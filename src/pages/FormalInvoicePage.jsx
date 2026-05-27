import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Loader2,
  FileDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import logoImg from '../assets/Logo.jpeg';
import sealImg from '../assets/SealImg.jpeg';

const formatInvoiceNo = (no) => {
  if (!no) return '';
  if (no.startsWith('INV-')) {
    const parts = no.split('-');
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq)) {
        return `EG-${parts[1]}-${seq + 501}`;
      }
    }
  }
  return no;
};

const FormalInvoicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [logoBase64, setLogoBase64] = useState('');
  const [sealBase64, setSealBase64] = useState('');
  const invoiceRef = useRef();

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const convert = (n) => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
    };
    return num === 0 ? 'Zero' : convert(num);
  };

  const handleDownload = async () => {
    if (!invoiceRef.current) return;
    setIsDownloading(true);
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Tax-Invoice-${formatInvoiceNo(invoice?.invoiceNo) || 'Document'}.pdf`);
      
      const params = new URLSearchParams(location.search);
      if (params.get('download') === 'true') {
        setTimeout(() => navigate(-1), 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        // Fetch Logo
        const logoResp = await fetch(logoImg);
        const logoBlob = await logoResp.blob();
        const logoReader = new FileReader();
        logoReader.onloadend = () => setLogoBase64(logoReader.result);
        logoReader.readAsDataURL(logoBlob);

        // Fetch Seal
        const sealResp = await fetch(sealImg);
        const sealBlob = await sealResp.blob();
        const sealReader = new FileReader();
        sealReader.onloadend = () => setSealBase64(sealReader.result);
        sealReader.readAsDataURL(sealBlob);
      } catch (err) { console.error(err); }
    };
    fetchAssets();

    const fetchInvoice = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/invoices`, config);
        const found = data.find(i => i._id === id);
        setInvoice(found);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchInvoice();
  }, [id, user.token]);

  useEffect(() => {
    if (!loading && invoice) {
      const params = new URLSearchParams(location.search);
      if (params.get('download') === 'true') {
        setTimeout(handleDownload, 1000);
      }
    }
  }, [loading, invoice, location.search]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Loader2 className="w-10 h-10 text-[#3f7abe] animate-spin" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Generating Tax Invoice...</p>
    </div>
  );
  if (!invoice) return <div className="text-center py-20 font-bold text-slate-400">Invoice not found</div>;

  const params = new URLSearchParams(location.search);
  const showGst = params.get('gst') !== 'false';

  const baseAmt = invoice.baseAmount || 0;
  const gstAmt = invoice.gstAmount || 0;
  const netAmt = showGst ? (invoice.totalAmount || 0) : baseAmt;

  const s = {
    container: { width: '794px', minHeight: '1123px', backgroundColor: '#ffffff', fontFamily: "'Plus Jakarta Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif", color: '#1e293b', textAlign: 'left', position: 'relative' },
    header: { backgroundColor: '#3f7abe', padding: '30px 40px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    logoBox: { backgroundColor: '#ffffff', padding: '12px', borderRadius: '4px', display: 'inline-block' },
    invoiceBadge: { border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '10px 20px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
    bar: { backgroundColor: '#f1f5f9', padding: '15px 40px', borderBottom: '2px solid #3f7abe', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: '#64748b' },
    customerSection: { padding: '30px 40px', borderBottom: '1px solid #f1f5f9' },
    sectionTitle: { fontSize: '12px', fontWeight: '900', color: '#3f7abe', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { backgroundColor: '#3f7abe', color: '#ffffff', padding: '12px 15px', textAlign: 'left', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' },
    td: { padding: '15px', borderBottom: '1px solid #f1f5f9', fontSize: '11px', fontWeight: '700', color: '#334155' },
    summarySection: { padding: '30px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    totalBox: { width: '320px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' },
    footer: { position: 'absolute', bottom: '0', left: '0', right: '0', backgroundColor: '#3f7abe', padding: '12px 40px', color: '#ffffff', textAlign: 'center', fontSize: '9px', fontWeight: '600', opacity: 0.9 }
  };

  return (
    <div className="bg-slate-100 min-h-screen py-10 print:p-0 print:bg-white">
      <div className="flex items-center justify-between max-w-[850px] mx-auto mb-8 px-4 print:hidden">
        <button onClick={() => navigate('/dashboard/invoices')} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-all text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <button disabled={isDownloading} onClick={handleDownload} className="flex items-center gap-2 px-8 py-4 bg-[#3f7abe] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#3f7abe]/30 hover:bg-[#33629c] transition-all">
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
          <button onClick={() => window.print()} className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
             Print
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-6" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ minWidth: '794px', display: 'flex', justifyContent: 'center' }}>
          <div ref={invoiceRef} style={s.container} className="shadow-2xl print:shadow-none">
           <div style={s.header}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                 <div style={s.logoBox}>
                    {logoBase64 && <img src={logoBase64} alt="Logo" style={{ height: '55px' }} />}
                 </div>
                 <div style={{ maxWidth: '400px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '900', margin: '0', letterSpacing: '-0.02em' }}>ECOGRID INFRA PRIVATE LIMITED</h1>
                    <p style={{ fontSize: '9px', marginTop: '6px', opacity: 0.8, lineHeight: '1.5', fontWeight: '500' }}>
                      Extension Lucknow, Uttar Pradesh - 226021<br/>
                      {showGst && 'GSTIN: 09AAJCE0630Q1ZA'}
                    </p>
                 </div>
              </div>
              <div style={s.invoiceBadge}>
                 <h2 style={{ fontSize: '14px', fontWeight: '900', margin: '0', letterSpacing: '0.1em' }}>TAX INVOICE</h2>
                 <p style={{ fontSize: '8px', margin: '4px 0 0 0', opacity: 0.7 }}>Official Bill</p>
              </div>
           </div>

           <div style={s.bar}>
              <div style={{ display: 'flex', gap: '5px' }}>INVOICE NO: <span style={{ color: '#3f7abe' }}>{formatInvoiceNo(invoice.invoiceNo)}</span></div>
              <div style={{ display: 'flex', gap: '5px' }}>BILL DATE: <span style={{ color: '#3f7abe' }}>{new Date(invoice.date).toLocaleDateString('en-GB')}</span></div>
              <div style={{ display: 'flex', gap: '5px' }}>STATUS: <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px' }}>{invoice.paymentStatus?.toUpperCase()}</span></div>
           </div>

           <div style={s.customerSection}>
              <h3 style={s.sectionTitle}>Billed To</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', fontSize: '11px', fontWeight: '700' }}>
                    <div style={{ color: '#64748b' }}>Name</div><div style={{ color: '#0f172a' }}>{invoice.lead?.name?.toUpperCase()}</div>
                    <div style={{ color: '#64748b' }}>Phone</div><div style={{ color: '#0f172a' }}>{invoice.lead?.phone}</div>
                    <div style={{ color: '#64748b' }}>Address</div><div style={{ color: '#0f172a', lineHeight: '1.4' }}>{invoice.lead?.address?.toUpperCase() || 'LUCKNOW UP'}</div>
                 </div>
                 <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '9px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Project Summary</p>
                    <p style={{ fontSize: '12px', fontWeight: '900', color: '#3f7abe' }}>{invoice.systemSize} SOLAR PV SYSTEM</p>
                    <p style={{ fontSize: '9px', fontWeight: '600', color: '#64748b', marginTop: '4px' }}>Panels: {invoice.solarPanels} | Inv: {invoice.inverter}</p>
                 </div>
              </div>
           </div>

           <div style={{ padding: '0 40px' }}>
              <table style={s.table}>
                 <thead>
                    <tr style={s.th}>
                       <th style={{ ...s.th, borderTopLeftRadius: '4px' }}>Description</th>
                       <th style={{ ...s.th, textAlign: 'center' }}>Qty</th>
                       <th style={{ ...s.th, textAlign: 'right' }}>Base (₹)</th>
                       {showGst && <th style={{ ...s.th, textAlign: 'right' }}>GST ({invoice.gstPercentage}%)</th>}
                       <th style={{ ...s.th, textAlign: 'right', borderTopRightRadius: '4px' }}>Total (₹)</th>
                    </tr>
                 </thead>
                 <tbody>
                    <tr>
                       <td style={s.td}>DESIGN, SUPPLY & INSTALLATION OF SOLAR PV SYSTEM {invoice.isGstInclusive && '(GST INCLUSIVE)'}</td>
                       <td style={{ ...s.td, textAlign: 'center' }}>1.00</td>
                       <td style={{ ...s.td, textAlign: 'right' }}>{baseAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                       {showGst && <td style={{ ...s.td, textAlign: 'right' }}>{gstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>}
                       <td style={{ ...s.td, textAlign: 'right', color: '#3f7abe' }}>{netAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                 </tbody>
              </table>
           </div>

           <div style={s.summarySection}>
               <div style={{ width: '380px' }}>
                  <p style={{ fontSize: '9px', fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px' }}>Amount in Words</p>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#3f7abe', fontStyle: 'italic', lineHeight: '1.4' }}>Rupees {numberToWords(netAmt)} Only</p>
                  
                  <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                     <div style={{ flex: '1', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
                        <p style={{ fontSize: '8px', fontWeight: '900', color: '#0369a1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank Remittance</p>
                        <p style={{ fontSize: '9px', fontWeight: '800', color: '#3f7abe', lineHeight: '1.4' }}>
                           ECOGRID INFRA PRIVATE LIMITED<br/>
                           Bank: Punjab National Bank<br/>
                           A/C No: 6193002100004183 (Current)<br/>
                           IFSC Code: PUNB0619300<br/>
                           Branch: Vibhuti Khand, Lucknow
                        </p>
                     </div>
                     
                     <div style={{ width: '150px', padding: '10px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ fontSize: '7.5px', fontWeight: '900', color: '#3f7abe', textTransform: 'uppercase', marginBottom: '5px', textAlign: 'center', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '3px' }}>
                           <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
                           Scan & Pay
                        </p>
                        <img 
                           src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                              `upi://pay?pa=6388908096m@pnb&pn=ECOGRID%20INFRA%20PRIVATE%20LIMITED&am=${netAmt}&cu=INR&tn=${encodeURIComponent(`Invoice ${formatInvoiceNo(invoice.invoiceNo) || ''}`)}`
                           )}`} 
                           alt="Invoice UPI QR" 
                           style={{ width: '95px', height: '95px', display: 'block', borderRadius: '4px' }} 
                        />
                        <p style={{ fontSize: '7px', fontWeight: '800', color: '#64748b', marginTop: '6px', textAlign: 'center', wordBreak: 'break-all', maxWidth: '130px', lineHeight: '1.2' }}>6388908096m@pnb</p>
                     </div>
                  </div>
               </div>
              
              <div style={s.totalBox}>
                 {showGst && (
                   <>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', fontWeight: '700' }}>
                        <span style={{ color: '#64748b' }}>Sub Total</span>
                        <span>₹{baseAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '11px', fontWeight: '700' }}>
                        <span style={{ color: '#64748b' }}>Total GST</span>
                        <span>₹{gstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                     </div>
                   </>
                 )}
                 <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: showGst ? '15px' : '0', borderTop: showGst ? '2px solid #e2e8f0' : 'none', fontSize: '16px', fontWeight: '900', color: '#3f7abe' }}>
                    <span>Grand Total {showGst && invoice.isGstInclusive && '(Inclusive of GST)'}</span>
                    <span>₹{netAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                 </div>
              </div>
           </div>

           <div style={{ padding: '60px 40px 100px 40px', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
              <div style={{ textAlign: 'right' }}>
                 <p style={{ fontSize: '11px', fontWeight: '900', color: '#3f7abe', marginBottom: '5px' }}>For ECOGRID INFRA PRIVATE LIMITED</p>
                 <div style={{ height: '90px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', margin: '5px 0' }}>
                    {sealBase64 ? (
                       <img src={sealBase64} alt="Seal" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                    ) : (
                       <div style={{ width: '80px', height: '80px', border: '2px solid #3f7abe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: '900', color: '#3f7abe', textAlign: 'center', padding: '10px' }}>ECOGRID INFRA SEAL</div>
                    )}
                 </div>
                 <div style={{ borderTop: '1px solid #cbd5e1', width: '200px', marginLeft: 'auto' }}></div>
                 <p style={{ fontSize: '9px', color: '#64748b', marginTop: '8px', fontWeight: '800' }}>Authorized Signatory</p>
              </div>
            </div>

           <div style={s.footer}>
              <p style={{ margin: '0' }}>Phone: +91-9999999999 | Email: info@ecogridinfra.in | Web: www.ecogridinfra.in</p>
              <p style={{ margin: '4px 0 0 0', opacity: 0.7, fontSize: '8px' }}>This is a computer-generated tax invoice. | GSTIN: 09AAJCE0630Q1ZA</p>
           </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormalInvoicePage;
