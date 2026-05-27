import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2, FileDown, X, Phone, Mail, Globe, Zap, Cpu, Calendar, Layers, Droplet, Building, Wifi, Home, MapPin } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Assets
import logoImg from '../assets/Logo.jpeg';
import coverEngineerImg from '../assets/cover_engineer.png';
import coverTabletImg from '../assets/cover_tablet.png';
import structureImg from '../assets/structure_diagram.png';
import solarRoof1 from '../assets/solar_roof_1.png';
import solarRoof2 from '../assets/solar_roof_2.png';
import solarRoof3 from '../assets/solar_roof_3.png';
import solarRail from '../assets/solar_rail.png';
import endEngineerImg from '../assets/end_engineer.png';

const TopRightTriangle = () => (
  <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '200px', zIndex: 0 }}>
    <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="none">
      <polygon points="300,0 300,200 120,0" fill="#3f7abe" />
      <polygon points="300,200 180,200 300,100" fill="#f6871e" />
    </svg>
  </div>
);

const BottomLeftTriangle = () => (
  <div style={{ position: 'absolute', bottom: 0, left: 0, width: '300px', height: '200px', zIndex: 0 }}>
    <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="none">
      <polygon points="0,200 0,0 180,200" fill="#3f7abe" />
      <polygon points="0,0 120,0 0,100" fill="#f6871e" />
    </svg>
  </div>
);

const LogoHeader = ({ logo }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 10 }}>
    {logo && <img src={logo} alt="Logo" style={{ height: '48px', width: '48px', borderRadius: '50%', objectFit: 'cover' }} />}
    <div>
      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#3f7abe', lineHeight: '1.1', letterSpacing: '0.5px' }}>Solar</h2>
      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#f6871e', lineHeight: '1.1', letterSpacing: '0.5px' }}>Eco Grid</h2>
    </div>
  </div>
);

const QuotationViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [logoBase64, setLogoBase64] = useState('');
  
  // Base64 images for html2canvas
  const [imagesBase64, setImagesBase64] = useState({});
  const pagesRef = useRef([]);

  const handleDownload = async () => {
    if (!quotation) return;
    setIsDownloading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const totalPages = quotation.loanDetails?.required ? 7 : 6;

      for (let i = 0; i < totalPages; i++) {
        const page = pagesRef.current[i];
        if (!page) continue;

        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#f1f5f9'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        await new Promise(r => setTimeout(r, 100));
      }
      pdf.save(`Proposal-${quotation.quotationNo}.pdf`);
      
      const params = new URLSearchParams(location.search);
      if (params.get('download') === 'true') {
        setTimeout(() => navigate(-1), 1000);
      }
    } catch (err) {
      console.error(err);
      alert('Download Failed: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const toBase64 = async (url) => {
          const res = await fetch(url);
          const blob = await res.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        };
        
        const logoB64 = await toBase64(logoImg);
        setLogoBase64(logoB64);

        const imgs = {
          cover: await toBase64(coverEngineerImg),
          coverTablet: await toBase64(coverTabletImg),
          structure: await toBase64(structureImg),
          roof1: await toBase64(solarRoof1),
          roof2: await toBase64(solarRoof2),
          roof3: await toBase64(solarRoof3),
          rail: await toBase64(solarRail),
          end: await toBase64(endEngineerImg)
        };
        setImagesBase64(imgs);
      } catch (err) { console.error('Error loading assets', err); }
    };
    fetchAssets();

    const fetchQuotation = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/quotations/${id}`, config);
        setQuotation(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchQuotation();
  }, [id, user.token]);

  useEffect(() => {
    if (!loading && quotation) {
      const params = new URLSearchParams(location.search);
      if (params.get('download') === 'true') {
        setTimeout(handleDownload, 2000);
      }
    }
  }, [loading, quotation, location.search]);

  if (loading) return <div className="flex flex-col items-center justify-center h-screen gap-4"><Loader2 className="w-12 h-12 text-[#1b315b] animate-spin" /><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Generating Proposal...</p></div>;
  if (!quotation) return <div className="flex flex-col items-center justify-center h-screen gap-6 text-center"><div style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', margin: '0 auto' }}><X size={40} /></div><h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' }}>Proposal Not Found</h2></div>;

  const basePrice = quotation.baseAmount || 0;
  const netPrice = quotation.netPrice || 0;
  const netEffective = Math.max(0, netPrice - (quotation.centralSubsidy || 0) - (quotation.stateSubsidy || 0));
  const year = new Date(quotation.date || Date.now()).getFullYear();

  const pageStyle = {
    width: '210mm',
    height: '297mm',
    backgroundColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    fontFamily: "'Plus Jakarta Sans', Arial, sans-serif",
    boxSizing: 'border-box'
  };

  return (
    <div className="space-y-8 pb-20 font-sans bg-slate-100 p-8">
      <div className="flex items-center justify-between max-w-5xl mx-auto px-4 print:hidden">
        <button onClick={() => navigate('/dashboard/quotations')} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-all text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          {quotation?.status === 'Pending' && (
            <button 
              onClick={() => navigate(`/dashboard/quotations/edit/${quotation._id}`)} 
              className="flex items-center gap-2 px-6 py-5 bg-amber-50 hover:bg-amber-600 hover:text-white border border-amber-200 text-amber-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all animate-in fade-in zoom-in-95 duration-200"
            >
              Edit Proposal
            </button>
          )}
          <button disabled={isDownloading} onClick={handleDownload} className="flex items-center gap-2 px-10 py-5 bg-[#3f7abe] hover:bg-[#33629c] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#3f7abe]/30 transition-all">
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {isDownloading ? 'Downloading...' : 'Download Full Proposal'}
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-6" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center', minWidth: '794px' }}>
        
        {/* PAGE 1: COVER PAGE */}
        <div ref={el => pagesRef.current[0] = el} style={{ ...pageStyle, background: 'linear-gradient(180deg, #3f7abe 0%, #204c82 70%, #f6871e 100%)', padding: '40px 30px', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Top Logo Container */}
          <div style={{ background: '#ffffff', borderRadius: '30px', padding: '12px 36px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginTop: '20px', zIndex: 10 }}>
            {logoBase64 && <img src={logoBase64} alt="Logo" style={{ height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover' }} />}
            <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '0.5px' }}>
              <span style={{ color: '#3f7abe' }}>SOLAR </span>
              <span style={{ color: '#f6871e' }}>ECO GRID</span>
            </span>
          </div>

          {/* Central Titles */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', zIndex: 10, textAlign: 'center', marginTop: '20px' }}>
            <h1 style={{ color: '#ffffff', fontSize: '34px', fontWeight: '900', margin: 0, letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              ONE TIME INVESTMENT
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
              <span style={{ color: '#ffffff', fontSize: '30px', fontWeight: '800' }}>LIFE TIME</span>
              <span style={{ background: '#facc15', color: '#1e293b', fontSize: '28px', fontWeight: '900', padding: '4px 16px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.15)' }}>
                SAVINGS
              </span>
            </div>
          </div>

          {/* Tablet Mockup Image */}
          <div style={{ width: '85%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10, flex: 1, margin: '20px 0' }}>
            {imagesBase64.coverTablet && (
              <img src={imagesBase64.coverTablet} alt="Solar Tablet Mockup" style={{ width: '100%', maxHeight: '420px', objectFit: 'contain' }} />
            )}
          </div>

          {/* Footer Band */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 15px' }}>
              <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '700', letterSpacing: '0.5px' }}>www.solarecogrid.in</span>
              <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '700', letterSpacing: '0.5px' }}>+91 9889555339</span>
            </div>
            {/* Accent colored bottom line */}
            <div style={{ height: '5px', width: '100%', background: '#ffffff', borderRadius: '999px', opacity: 0.8 }}></div>
          </div>
        </div>

        {/* PAGE 2: FINAL OUTPUT */}
        <div ref={el => pagesRef.current[1] = el} style={{ ...pageStyle, background: 'linear-gradient(180deg, #3f7abe 0%, #1e4575 100%)', padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Subtle decorative concentric circle backgrounds */}
          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', zIndex: 0 }}></div>
          
          <LogoHeader logo={logoBase64} />

          <div style={{ textAlign: 'center', margin: '15px 0', zIndex: 10 }}>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', margin: '0 0 5px 0', letterSpacing: '0.5px' }}>Final Output</h1>
          </div>

          {/* Image Container Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '20px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            width: '90%',
            margin: '0 auto',
            flex: 1,
            justifyContent: 'center',
            maxHeight: '620px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#3f7abe', textAlign: 'center', margin: 0, letterSpacing: '0.5px' }}>
              "GO GREEN GO SOLAR"
            </h2>
            <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              {imagesBase64.roof1 ? (
                <img src={imagesBase64.roof1} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Solar Roof" />
              ) : (
                imagesBase64.structure && <img src={imagesBase64.structure} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Structure" />
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', zIndex: 10, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '15px', marginTop: '15px' }}>
            <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '700', letterSpacing: '0.5px' }}>www.solarecogrid.com</span>
          </div>
        </div>

        {/* PAGE 3: OUR OFFER FOR YOU */}
        <div ref={el => pagesRef.current[2] = el} style={{ 
          ...pageStyle, 
          background: 'linear-gradient(180deg, #3f7abe 0%, #204675 100%)', 
          padding: '30px 25px', 
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {/* Header Title */}
          <h1 style={{ 
            fontSize: '30px', 
            fontWeight: '900', 
            textAlign: 'center', 
            margin: '0 0 15px 0', 
            color: 'white',
            letterSpacing: '-0.5px'
          }}>
            Our offer for <span style={{ color: '#facc15' }}>you</span>
          </h1>

          {/* Content Card */}
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.98)', 
            borderRadius: '24px', 
            padding: '24px 20px', 
            color: '#1e293b',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            maxHeight: '790px',
            overflow: 'hidden'
          }}>
            {/* Customer Details */}
            <div style={{ marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#3f7abe', margin: '0 0 4px 0' }}>
                {quotation.lead?.name || 'Customer'}
              </h2>
              <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', margin: 0 }}>
                {quotation.lead?.phone || 'N/A'} - {quotation.lead?.address || 'N/A'}
              </p>
            </div>

            {/* Technical Specifications Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '16px 20px',
              backgroundColor: '#f8fafc',
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '15px',
              border: '1px solid #f1f5f9'
            }}>
              {/* Item 1: System Size */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  backgroundColor: '#3f7abe', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Zap size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>System size</div>
                  <div style={{ fontSize: '12px', fontWeight: '900', color: '#1e293b', lineHeight: '1.3', paddingBottom: '2px' }}>{quotation.systemSize}</div>
                </div>
              </div>

              {/* Item 2: Solar Panels */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  backgroundColor: '#3f7abe', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  fontWeight: '900',
                  fontSize: '10px',
                  flexShrink: 0
                }}>
                  ZS
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Solar Panels</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', maxWidth: '175px', lineHeight: '1.4', paddingBottom: '4px', wordBreak: 'break-word' }} title={quotation.solarPanels}>
                    {quotation.solarPanels}
                  </div>
                </div>
              </div>

              {/* Item 3: Inverter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  backgroundColor: '#3f7abe', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Cpu size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inverter</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', maxWidth: '175px', lineHeight: '1.4', paddingBottom: '4px', wordBreak: 'break-word' }} title={quotation.inverter}>
                    {quotation.inverter}
                  </div>
                </div>
              </div>

              {/* Item 4: Quotation Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  backgroundColor: '#3f7abe', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Calendar size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quotation Date</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', lineHeight: '1.3', paddingBottom: '2px' }}>
                    {new Date(quotation.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Item 5: Structure Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  backgroundColor: '#3f7abe', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Layers size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Structure type</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', maxWidth: '175px', lineHeight: '1.4', paddingBottom: '4px', wordBreak: 'break-word' }} title={quotation.structureType}>
                    {quotation.structureType || 'Approved Make'}
                  </div>
                </div>
              </div>

              {/* Item 6: Cleaning Frequency */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  backgroundColor: '#3f7abe', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Droplet size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cleaning frequency</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', lineHeight: '1.3', paddingBottom: '2px' }}>{quotation.cleaningFrequency || 'NO'}</div>
                </div>
              </div>

              {/* Item 7: Offering */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  backgroundColor: '#3f7abe', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  fontWeight: '900',
                  fontSize: '10px',
                  flexShrink: 0
                }}>
                  S
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Offering</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', lineHeight: '1.3', paddingBottom: '2px' }}>{quotation.offering || 'EcoGrid'}</div>
                </div>
              </div>

              {/* Item 8: Floor Height */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  backgroundColor: '#3f7abe', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Building size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Floor Height</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', lineHeight: '1.3', paddingBottom: '2px' }}>{quotation.floorHeight || 'G+0'}</div>
                </div>
              </div>

              {/* Item 9: GSM Based */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  backgroundColor: '#3f7abe', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Wifi size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GSM Based</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', lineHeight: '1.3', paddingBottom: '2px' }}>{quotation.gsmBased || 'No'}</div>
                </div>
              </div>

              {/* Item 10: Inverter Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ 
                  backgroundColor: '#3f7abe', 
                  borderRadius: '50%', 
                  width: '32px', 
                  height: '32px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Home size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inverter Location</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e293b', lineHeight: '1.3', paddingBottom: '2px' }}>{quotation.inverterLocation || 'Ground'}</div>
                </div>
              </div>
            </div>

            {/* Price Estimator Table */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: '900', color: '#3f7abe', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>Price</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px', fontWeight: '900', color: '#3f7abe', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 4px', fontWeight: '700', color: '#475569' }}>Rooftop System</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>₹ {basePrice.toLocaleString('en-IN')}</td>
                  </tr>
                  
                  {quotation.earlyBirdDiscount > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', color: '#64748b' }}>Early bird discount</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>- ₹ {quotation.earlyBirdDiscount.toLocaleString('en-IN')}</td>
                    </tr>
                  )}

                  {quotation.additionalDiscount > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', color: '#64748b' }}>Discount</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>- ₹ {quotation.additionalDiscount.toLocaleString('en-IN')}</td>
                    </tr>
                  )}

                  {quotation.isGstInclusive ? (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', fontWeight: '700', color: '#475569' }}>
                        Net Price (Inclusive of {quotation.gstPercentage || 8.9}% GST)
                      </td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: '900', color: '#1e293b' }}>
                        ₹ {netPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {quotation.gstPercentage > 0 && (
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 4px', color: '#64748b' }}>
                            GST ({quotation.gstPercentage}% Extra)
                          </td>
                          <td style={{ padding: '6px 4px', textAlign: 'right', color: '#1e293b', fontWeight: 'bold' }}>
                            + ₹ {(quotation.gstAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </td>
                        </tr>
                      )}
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 4px', fontWeight: '700', color: '#475569' }}>
                          Net Price (Inclusive of all Taxes)
                        </td>
                        <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: '900', color: '#1e293b' }}>
                          ₹ {netPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    </>
                  )}

                  {quotation.centralSubsidy > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', color: '#64748b' }}>Central Govt. Direct Benefit Transfer</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>- ₹ {quotation.centralSubsidy.toLocaleString('en-IN')}</td>
                    </tr>
                  )}

                  {quotation.stateSubsidy > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', color: '#64748b' }}>UPNEEDA Subsidy</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>- ₹ {quotation.stateSubsidy.toLocaleString('en-IN')}</td>
                    </tr>
                  )}

                  {/* Net Effective Price Highlight Row */}
                  <tr style={{ 
                    background: 'linear-gradient(90deg, #f6871e 0%, #fb923c 100%)', 
                    borderRadius: '8px', 
                    boxShadow: '0 2px 5px rgba(246,135,30,0.2)'
                  }}>
                    <td style={{ padding: '8px 10px', fontWeight: '900', color: '#ffffff', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                      Net Effective Price*
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '900', color: '#ffffff', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '13px' }}>
                      ₹ {netEffective.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note Section */}
            <div style={{ 
              marginTop: '12px', 
              fontSize: '8px', 
              color: '#64748b', 
              lineHeight: '1.4', 
              borderTop: '1px solid #e2e8f0', 
              paddingTop: '8px' 
            }}>
              <b>Note</b><br/>
              1. Once the commissioning is completed by MNRE, the subsidy amount will be directly transferred to the beneficiary's account.<br/>
              2. The applicable subsidy amount is determined according to the MNRE declaration. For more details regarding the MNRE subsidy.
            </div>
          </div>

          {/* Footer Website link */}
          <div style={{ textAlign: 'center', marginTop: '12px', zIndex: 10 }}>
            <span style={{ fontSize: '13px', color: 'white', fontWeight: '700', letterSpacing: '0.5px' }}>
              www.solarecogrid.com
            </span>
          </div>
        </div>

        {/* PAGE 4: TECHNICAL SPECS TABLE */}
        <div ref={el => pagesRef.current[3] = el} style={{ ...pageStyle, padding: '45px 30px' }}>
          <TopRightTriangle />
          <BottomLeftTriangle />
          
          <LogoHeader logo={logoBase64} />
          
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#3f7abe', marginTop: '35px', marginBottom: '20px', position: 'relative', zIndex: 10, letterSpacing: '0.5px' }}>
            Details about the System {quotation.systemSize} On-Grid
          </h2>
          
          <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <thead style={{ backgroundColor: '#e0ebf6', borderBottom: '2px solid #3f7abe' }}>
                <tr>
                  <th style={{ border: '1px solid #cbd5e1', padding: '10px 8px', fontSize: '11px', fontWeight: '900', color: '#3f7abe', width: '25%' }}>Item/Component</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '10px 8px', fontSize: '11px', fontWeight: '900', color: '#3f7abe', width: '40%' }}>Details</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '10px 8px', fontSize: '11px', fontWeight: '900', color: '#3f7abe', width: '18%' }}>Make</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '10px 8px', fontSize: '11px', fontWeight: '900', color: '#3f7abe', width: '17%' }}>Quantity</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '10.5px', color: '#334155' }}>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 'bold' }}>Solar Panels<br/>30 Year Performance<br/>Warranty</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.solarPanels}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.solarPanelsMake || 'Adani/Luminous'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.solarPanelsQty || 'As per capacity'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 'bold' }}>Inverter<br/>10 / 7 Year Warranty</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.inverter}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.inverterMake || 'Solis'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.inverterQty || '1 Unit'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 'bold' }}>Inverter Hybrid</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.inverterHybrid || 'No'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>—</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>—</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 'bold' }}>Battery Backup</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>
                    {quotation.battery === 'Yes' ? `Yes (${quotation.batteryRemark || 'Required'})` : 'No'}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.battery === 'Yes' ? 'Approved Make' : '—'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.battery === 'Yes' ? '1 Set' : '—'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 'bold' }}>Solar panel<br/>mounting structure</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.structureType || 'HDGI Rust-free structure'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.structureMake || 'Approved Make'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.structureQty || 'For panels'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 'bold' }}>ACDB (AC Distribution<br/>Box)</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.acdbDetails || 'For Safe AC Distribution, IP65'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.acdbMake || 'Polycab'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.acdbQty || '1 Unit'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 'bold' }}>DCDB (DC Distribution<br/>Box)</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.dcdbDetails || 'For Safe DC Distribution, IP65'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.dcdbMake || 'Polycab'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.dcdbQty || '1 Unit'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 'bold' }}>3 Copper Earthing</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.earthingDetails || 'Standard earthing for safety'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.earthingMake || 'True Power'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.earthingQty || '3 Unit'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 'bold' }}>Closed Wiring in PVC<br/>Conduit Pipe</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.wiringDetails || 'For safe and secure wiring'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.wiringMake || 'Approved Make'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.wiringQty || 'As per Requirement'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 'bold' }}>Cables & Accessories</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.cablesDetails || 'Cu wire 4mm'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.cablesMake || 'Polycab'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.cablesQty || '1 Set'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 'bold' }}>Lightning Arrestor</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.lightningDetails || 'Safely grounds lighting'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.lightningMake || 'Approved Make'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.lightningQty || '1 Set'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px', fontWeight: 'bold' }}>Installation & Labour</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.installationDetails || 'Complete setup'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.installationMake || 'EcoGrid'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 6px' }}>{quotation.installationQty || 'Each'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'center', zIndex: 10, marginTop: '20px', borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
            <span style={{ fontSize: '13px', color: '#3f7abe', fontWeight: '700', letterSpacing: '0.5px' }}>www.solarecogrid.com</span>
          </div>
        </div>

        {/* PAGE 5: WARRANTY AND SERVICES */}
        <div ref={el => pagesRef.current[4] = el} style={{ ...pageStyle, padding: '45px 30px' }}>
          <TopRightTriangle />
          <BottomLeftTriangle />
          
          <LogoHeader logo={logoBase64} />
          
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#3f7abe', marginTop: '35px', marginBottom: '20px', position: 'relative', zIndex: 10, letterSpacing: '0.5px' }}>
            Warranty and Services
          </h1>
          
          <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', justifyContent: 'center' }}>
            {/* What you get table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <thead style={{ backgroundColor: '#e0ebf6', borderBottom: '2px solid #3f7abe' }}>
                <tr>
                  <th style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'left', color: '#3f7abe', fontSize: '11px', fontWeight: '900', width: '50%' }}>What You Get</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'left', color: '#3f7abe', fontSize: '11px', fontWeight: '900', width: '50%' }}>What Is Not Included</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '9px', color: '#475569' }}>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', lineHeight: '1.4' }}>
                    <b>Zero paper cost guarantee:</b> Solar Eco Grid selects the most suitable components that go in your solar plant. you don't have to pay out of your pocket for any repairs, replacements or spare parts that are required during regular maintenance over the next 5 year.
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', lineHeight: '1.4' }}>
                    Any external damage due to human intervention or unpredictable nature events will make the warranty void.
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', lineHeight: '1.4' }}>
                    <b>Solar Panel Door 2 Door warranty:</b><br/>No question asked solar panel replacement with no dependency on OEM.
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', lineHeight: '1.4' }}>
                    Any external damage due to human intervention or unpredictable nature events will make the warranty void.
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', lineHeight: '1.4' }}>
                    <b>Anti Cyclone:</b><br/>Your structures are certified for high wind speeds of upto 150 KMPH. In case there is any damage due to cyclone below this threshold, Solar Eco Grid will repair/replace for free.
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', lineHeight: '1.4' }}>
                    Any external damage due to human intervention.
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', lineHeight: '1.4' }}>
                    <b>Upto Rs. 1 Lac water leakage coverage:</b><br/>We use Seal to safeguard you against any water seepage issues on your roof. Hence we provide a water leakage cover of upto INR 1 Lac in case of any damages.
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', lineHeight: '1.4' }}>
                    Any seepage in non-solar area due to pre-existing condition or any other non-related work.
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Components Warranty List */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <thead style={{ backgroundColor: '#e0ebf6', borderBottom: '2px solid #3f7abe' }}>
                <tr>
                  <th style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'left', color: '#3f7abe', fontSize: '11px', fontWeight: '900', width: '70%' }}>Components</th>
                  <th style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'left', color: '#3f7abe', fontSize: '11px', fontWeight: '900', width: '30%' }}>Years</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '10px', color: '#334155', fontWeight: '700' }}>
                <tr><td style={{ border: '1px solid #cbd5e1', padding: '8px 10px' }}>Solar Panel (production)</td><td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', color: '#3f7abe' }}>30 years</td></tr>
                <tr><td style={{ border: '1px solid #cbd5e1', padding: '8px 10px' }}>Solar Panel (product)</td><td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', color: '#3f7abe' }}>12 years</td></tr>
                <tr><td style={{ border: '1px solid #cbd5e1', padding: '8px 10px' }}>Inverter</td><td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', color: '#3f7abe' }}>7-10 years</td></tr>
                <tr><td style={{ border: '1px solid #cbd5e1', padding: '8px 10px' }}>Other components</td><td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', color: '#3f7abe' }}>5 years</td></tr>
                <tr><td style={{ border: '1px solid #cbd5e1', padding: '8px 10px' }}>Plant performance guarantee</td><td style={{ border: '1px solid #cbd5e1', padding: '8px 10px', color: '#3f7abe' }}>Applicable</td></tr>
              </tbody>
            </table>

            {/* Terms and Conditions */}
            <div style={{ fontSize: '8px', color: '#64748b', lineHeight: '1.4', borderTop: '1px solid #cbd5e1', paddingTop: '8px' }}>
              <b>Terms and Conditions</b><br/>
              1. Additional charges may apply for changes to your electricity bill, such as load, name, or phase adjustments.<br/>
              2. Please provide all necessary documents, including PAN card, Aadhaar card, and electricity bill.<br/>
              3. Customers opting for financing may need to submit extra documents.<br/>
              4. Delays due to missing documents are not Solar Eco Grid's responsibility.<br/>
              5. Our Solar system will generate average of 4 units per kw of electricity depending upon service and maintenance.
            </div>
          </div>

          <div style={{ textAlign: 'center', zIndex: 10, marginTop: '20px', borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
            <span style={{ fontSize: '13px', color: '#3f7abe', fontWeight: '700', letterSpacing: '0.5px' }}>www.solarecogrid.com</span>
          </div>
        </div>

        {/* PAGE 6: CONTACT US / BACK COVER */}
        <div ref={el => pagesRef.current[5] = el} style={{ ...pageStyle, padding: 0, justifyContent: 'space-between', display: 'flex', flexDirection: 'column' }}>
          {/* Top Half: Solar panels photo */}
          <div style={{ width: '100%', height: '35%', position: 'relative', overflow: 'hidden' }}>
            {imagesBase64.roof2 ? (
              <img src={imagesBase64.roof2} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Solar panels backdrop" />
            ) : (
              imagesBase64.roof1 && <img src={imagesBase64.roof1} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Solar panels backdrop" />
            )}
          </div>

          {/* Middle: Title cards */}
          <div style={{ padding: '0 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase' }}>CONTACT US</span>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#3f7abe', margin: 0, textAlign: 'center', letterSpacing: '0.5px', lineHeight: '1.2' }}>
              ECOGRID INFRA PVT LTD
            </h1>

            {/* Logo Container */}
            <div style={{ background: '#ffffff', borderRadius: '30px', padding: '10px 28px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #cbd5e1', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', marginTop: '5px' }}>
              {logoBase64 && <img src={logoBase64} alt="Logo" style={{ height: '35px', width: '35px', borderRadius: '50%', objectFit: 'cover' }} />}
              <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.5px' }}>
                <span style={{ color: '#3f7abe' }}>SOLAR </span>
                <span style={{ color: '#f6871e' }}>ECO GRID</span>
              </span>
            </div>
          </div>

          {/* Bottom Card Block: Contact, Bank Account Details & QRs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1.2fr',
            gap: '15px',
            margin: '0 20px 20px 20px',
            alignItems: 'stretch'
          }}>
            {/* Column 1: Orange Contact, GST Card & WhatsApp QR */}
            <div style={{
              background: '#f6871e',
              color: 'white',
              borderRadius: '20px',
              padding: '16px 20px',
              boxShadow: '0 6px 20px rgba(246,135,30,0.15)',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {/* Phone Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={13} color="white" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>+91 9889555339</span>
                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>+91 6388908096</span>
                  </div>
                </div>

                {/* Website Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Globe size={13} color="white" />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold' }}>www.solarecogrid.in</span>
                </div>

                {/* Email Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={13} color="white" />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', wordBreak: 'break-all' }}>info@ecogridinfra.in</span>
                </div>

                {/* Address Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', flexShrink: 0 }}>
                    <MapPin size={13} color="white" />
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', lineHeight: '1.3' }}>
                    D-352, Vibhuti khand, Gomti Nagar Lucknow, 226010
                  </span>
                </div>

                {/* GSTIN Row */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '6px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1px',
                  marginTop: '4px'
                }}>
                  <span style={{ fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '0.5px' }}>GSTIN</span>
                  <span style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>09AAJCE0630Q1ZA</span>
                </div>
              </div>

              {/* WhatsApp QR inside the Orange Card */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.15)', padding: '10px', borderRadius: '15px', flexShrink: 0 }}>
                <span style={{ fontSize: '9px', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', margin: 0, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.202-1.362a9.92 9.92 0 0 0 4.808 1.238h.005c5.505 0 9.99-4.478 9.99-9.986C22.007 6.478 17.519 2 12.012 2zm5.548 13.918c-.227.638-1.309 1.202-1.803 1.258-.456.052-.907.243-2.906-.554-2.559-1.02-4.179-3.593-4.307-3.76-.127-.168-1.037-1.366-1.037-2.61 0-1.244.65-1.854.882-2.102.23-.248.503-.309.671-.309.168 0 .336.002.483.008.151.006.353-.058.552.416.202.489.69 1.666.75 1.787.061.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.252.312-.359.419-.118.118-.242.247-.104.48.138.233.612.997 1.31 1.614.896.793 1.649 1.039 1.884 1.159.236.12.373.1.512-.06.139-.16.605-.698.766-.938.162-.239.324-.2.548-.118.224.08 1.42.662 1.662.782.242.12.404.18.463.28.059.1.059.578-.168 1.216z"/></svg>
                  Scan to Chat
                </span>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://wa.me/916388908096')}`}
                  alt="WhatsApp QR Code" 
                  style={{ width: '85px', height: '85px', display: 'block', borderRadius: '4px', backgroundColor: '#ffffff', padding: '4px' }} 
                />
                <span style={{ fontSize: '8px', fontWeight: '800', color: '#ffffff' }}>+91 6388908096</span>
              </div>
            </div>

            {/* Column 2: White Bank Details Card & UPI QR */}
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '16px 20px',
              border: '2px solid #e0ebf6',
              boxShadow: '0 6px 20px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <p style={{ fontSize: '9px', fontWeight: '900', color: '#3f7abe', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank Remittance</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '8px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Account Name</p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#1e293b', fontWeight: '900', lineHeight: '1.2' }}>ECOGRID INFRA PRIVATE LIMITED</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '8px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Bank Name</p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#1e293b', fontWeight: '900' }}>Punjab National Bank</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '8px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Account Number (Current)</p>
                    <p style={{ margin: 0, fontSize: '10.5px', color: '#3f7abe', fontWeight: '900' }}>6193002100004183</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '8px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>IFSC Code</p>
                    <p style={{ margin: 0, fontSize: '10px', color: '#1e293b', fontWeight: '900' }}>PUNB0619300</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '8px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Branch</p>
                    <p style={{ margin: 0, fontSize: '8.5px', color: '#475569', fontWeight: 'bold', lineHeight: '1.2' }}>Vibhuti Khand, Gomti Nagar, Lucknow</p>
                  </div>
                </div>
              </div>

              {/* UPI QR inside the White Bank Card */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '15px', flexShrink: 0 }}>
                <span style={{ fontSize: '9px', fontWeight: '900', color: '#3f7abe', textTransform: 'uppercase', margin: 0, letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
                  Scan to Pay
                </span>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('upi://pay?pa=6193002100004183@pnb&pn=ECOGRID%20INFRA%20PRIVATE%20LIMITED&cu=INR')}`}
                  alt="UPI Payment QR Code" 
                  style={{ width: '85px', height: '85px', display: 'block', borderRadius: '4px', backgroundColor: '#ffffff', padding: '4px' }} 
                />
                <span style={{ fontSize: '8px', fontWeight: '800', color: '#64748b', textAlign: 'center', maxWidth: '100px', wordBreak: 'break-all', display: 'block', lineHeight: '1.2' }}>
                  6193002100004183@pnb
                </span>
              </div>
            </div>
          </div>

          {/* Price Estimator Table */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: '900', color: '#3f7abe', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '6px 4px', fontWeight: '900', color: '#3f7abe', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 4px', fontWeight: '700', color: '#475569' }}>Rooftop System</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>₹ {basePrice.toLocaleString('en-IN')}</td>
                </tr>
                
                {quotation.earlyBirdDiscount > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 4px', color: '#64748b' }}>Early bird discount</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>- ₹ {quotation.earlyBirdDiscount.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {quotation.additionalDiscount > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 4px', color: '#64748b' }}>Discount</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>- ₹ {quotation.additionalDiscount.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {quotation.isGstInclusive ? (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 4px', fontWeight: '700', color: '#475569' }}>
                      Net Price (Inclusive of {quotation.gstPercentage || 8.9}% GST)
                    </td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: '900', color: '#1e293b' }}>
                      ₹ {netPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ) : (
                  <>
                    {quotation.gstPercentage > 0 && (
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 4px', color: '#64748b' }}>
                          GST ({quotation.gstPercentage}% Extra)
                        </td>
                        <td style={{ padding: '6px 4px', textAlign: 'right', color: '#1e293b', fontWeight: 'bold' }}>
                          + ₹ {(quotation.gstAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    )}
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', fontWeight: '700', color: '#475569' }}>
                        Net Price (Inclusive of all Taxes)
                      </td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: '900', color: '#1e293b' }}>
                        ₹ {netPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  </>
                )}

                {quotation.centralSubsidy > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 4px', color: '#64748b' }}>Central Govt. Direct Benefit Transfer</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>- ₹ {quotation.centralSubsidy.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {quotation.stateSubsidy > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 4px', color: '#64748b' }}>UPNEEDA Subsidy</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>- ₹ {quotation.stateSubsidy.toLocaleString('en-IN')}</td>
                  </tr>
                )}

                {/* Net Effective Price Highlight Row */}
                <tr style={{ 
                  background: 'linear-gradient(90deg, #f6871e 0%, #fb923c 100%)', 
                  borderRadius: '8px', 
                  boxShadow: '0 2px 5px rgba(246,135,30,0.2)'
                }}>
                  <td style={{ padding: '8px 10px', fontWeight: '900', color: '#ffffff', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                    Net Effective Price*
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '900', color: '#ffffff', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '13px' }}>
                    ₹ {netEffective.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Note Section */}
          <div style={{ 
            marginTop: '12px', 
            fontSize: '8px', 
            color: '#64748b', 
            lineHeight: '1.4', 
            borderTop: '1px solid #e2e8f0', 
            paddingTop: '8px' 
          }}>
            <b>Note</b><br/>
            1. Once the commissioning is completed by MNRE, the subsidy amount will be directly transferred to the beneficiary's account.<br/>
            2. The applicable subsidy amount is determined according to the MNRE declaration. For more details regarding the MNRE subsidy.
          </div>

          {/* Footer Website link */}
          <div style={{ textAlign: 'center', marginTop: '12px', zIndex: 10 }}>
            <span style={{ fontSize: '13px', color: 'white', fontWeight: '700', letterSpacing: '0.5px' }}>
              www.solarecogrid.com
            </span>
          </div>
        </div>

        {/* PAGE 7: FINANCING (Only if required) */}
        {quotation.loanDetails?.required && (
          <div ref={el => pagesRef.current[6] = el} style={{ ...pageStyle, padding: '45px 30px' }}>
            <TopRightTriangle />
            <BottomLeftTriangle />
            
            <LogoHeader logo={logoBase64} />
            
            <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#3f7abe', marginTop: '35px', marginBottom: '25px', position: 'relative', zIndex: 10, letterSpacing: '0.5px' }}>
              Financing & Loan Structure
            </h1>
            
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center' }}>
              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h3 style={{ color: '#3f7abe', fontSize: '16px', fontWeight: '900', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', marginBottom: '15px' }}>Bank Information</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>BANK NAME</p>
                    <p style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: '900' }}>{quotation.loanDetails.bankName}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>BRANCH</p>
                    <p style={{ margin: 0, fontSize: '16px', color: '#1e293b', fontWeight: '900' }}>{quotation.loanDetails.bankAddress}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1, backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>LOAN AMOUNT</p>
                  <p style={{ margin: 0, fontSize: '24px', color: '#3f7abe', fontWeight: '900' }}>₹{quotation.loanDetails.loanAmount?.toLocaleString()}</p>
                </div>
                <div style={{ flex: 1, backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                  <p style={{ margin: 0, fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>MONTHLY EMI</p>
                  <p style={{ margin: 0, fontSize: '24px', color: '#3f7abe', fontWeight: '900' }}>₹{quotation.loanDetails.emiAmount?.toLocaleString()}</p>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <h3 style={{ color: '#3f7abe', fontSize: '16px', fontWeight: '900', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', marginBottom: '15px' }}>Repayment Terms</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>TENURE</span>
                  <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '900' }}>{quotation.loanDetails.tenureMonths} MONTHS</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>INTEREST RATE</span>
                  <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '900' }}>{quotation.loanDetails.interestRate}% P.A.</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>DOWN PAYMENT</span>
                  <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '900' }}>₹{quotation.loanDetails.downPayment?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>PROCESSING FEES</span>
                  <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: '900' }}>₹{quotation.loanDetails.processingFees?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', zIndex: 10, marginTop: '20px', borderTop: '1px solid #cbd5e1', paddingTop: '10px' }}>
              <span style={{ fontSize: '13px', color: '#3f7abe', fontWeight: '700', letterSpacing: '0.5px' }}>www.solarecogrid.com</span>
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
  );
};

export default QuotationViewPage;
