import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  History, 
  User as UserIcon, 
  Clock, 
  ChevronRight,
  Loader2,
  Calendar,
  MessageSquare,
  FileText,
  IndianRupee,
  Receipt,
  Eye,
  Download
} from 'lucide-react';

const statusColors = {
  'New': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Contacted': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'Site Visit Scheduled': 'bg-orange-50 text-orange-700 border border-orange-200',
  'Quotation Sent': 'bg-purple-50 text-purple-700 border border-purple-200',
  'Booked': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Installation Underway': 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  'Completed': 'bg-green-50 text-green-700 border border-green-200',
  'Cancelled': 'bg-red-50 text-red-700 border border-red-200',
};

const LeadHistoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quotations, setQuotations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        const [leadsRes, quotesRes, paymentsRes, invoicesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/leads`, config),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/quotations`, config).catch(() => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/payments`, config).catch(() => ({ data: [] })),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/invoices`, config).catch(() => ({ data: [] }))
        ]);

        const foundLead = leadsRes.data.find(l => l._id === id);
        setLead(foundLead);

        if (foundLead) {
          setQuotations(quotesRes.data.filter(q => q.lead?._id === id));
          setPayments(paymentsRes.data.filter(p => p.leadId?._id === id));
          setInvoices(invoicesRes.data.filter(i => i.lead?._id === id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeadData();
  }, [id, user.token]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
      <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Compiling Comprehensive Profile...</p>
    </div>
  );

  if (!lead) return <div className="text-center py-20 font-black text-slate-400 uppercase tracking-widest">Lead not found</div>;

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/dashboard/leads')}
          className="p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm hover:bg-slate-50 transition-all text-slate-600 active:scale-90"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black text-[#3f7abe] uppercase tracking-[0.2em] mb-1">
            <History className="w-3.5 h-3.5" /> Interaction Archive
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase">
            {lead.name} <span className="text-slate-400 ml-2 font-black">#{lead._id.slice(-6).toUpperCase()}</span>
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all">
        <div className="p-8 border-b border-slate-50 bg-slate-50/20 flex flex-wrap items-center gap-10">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Direct Contact</span>
               <a
                 href={`tel:${lead.phone}`}
                 className="font-black text-slate-900 text-lg hover:text-[#3f7abe] transition-all hover:scale-102 origin-left inline-block w-fit"
                 title={`Call ${lead.name}`}
               >
                 {lead.phone}
               </a>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Active Phase</span>
               <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight border shadow-sm w-fit ${statusColors[lead.status]}`}>
                 {lead.status}
               </span>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Lead Assigned To</span>
               <span className="font-black text-[#3f7abe] uppercase tracking-tight flex items-center gap-2">
                 <UserIcon className="w-4 h-4" />
                 {lead.assignedTo?.name || 'Unassigned'}
               </span>
            </div>
        </div>

        {/* Mobile Friendly Timeline for Smaller Screens, Table for Large */}
        <div className="lg:hidden p-6 space-y-8 relative">
           <div className="absolute left-10 top-10 bottom-10 w-px bg-slate-100"></div>
           {lead.history && lead.history.length > 0 ? (
             lead.history.slice().reverse().map((log, i) => (
               <div key={i} className="relative pl-12">
                  <div className={`absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${log.status === lead.status ? 'bg-[#3f7abe] scale-150' : 'bg-slate-300'}`}></div>
                  <div className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
                     <div className="flex justify-between items-start">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase border ${statusColors[log.status]}`}>
                           {log.status}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase">
                           {new Date(log.updatedAt).toLocaleDateString()}
                        </span>
                     </div>
                     <p className="text-sm font-bold text-slate-800 leading-relaxed italic">"{log.comment}"</p>
                     <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-1">
                        <UserIcon className="w-3 h-3 text-[#3f7abe]" />
                        <span className="text-[9px] font-black text-slate-600 uppercase">By {log.updatedBy?.name || 'System'}</span>
                     </div>
                  </div>
               </div>
             ))
           ) : (
             <div className="text-center py-10 opacity-30">
                <History className="w-12 h-12 mx-auto mb-2" />
                <p className="text-xs font-black uppercase">No archive logs</p>
             </div>
           )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Timeline</th>
                <th className="px-8 py-6 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Phase Shift</th>
                <th className="px-8 py-6 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Internal Log</th>
                <th className="px-8 py-6 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Audited By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lead.history && lead.history.length > 0 ? (
                lead.history.slice().reverse().map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-8">
                       <div className="flex flex-col">
                          <span className="font-black text-slate-900 text-sm tracking-tight">{new Date(log.updatedAt).toLocaleDateString()}</span>
                          <span className="text-[10px] font-bold text-slate-500 mt-0.5">{new Date(log.updatedAt).toLocaleTimeString()}</span>
                       </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight inline-block shadow-sm border ${statusColors[log.status]}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-start gap-3 max-w-sm">
                        <MessageSquare className="w-4.5 h-4.5 text-[#3f7abe]/30 mt-1 shrink-0 group-hover:text-[#3f7abe] transition-colors" />
                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                          "{log.comment}"
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-xl bg-[#3f7abe]/5 flex items-center justify-center text-[#3f7abe] border border-[#3f7abe]/10">
                            <UserIcon className="w-4.5 h-4.5" />
                         </div>
                         <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                           {log.updatedBy?.name || 'System'}
                         </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-5 opacity-20">
                       <History className="w-20 h-20" />
                       <p className="font-black text-sm uppercase tracking-[0.3em]">No interaction logs recorded</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid for Related Entities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quotations Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Quotations</h3>
          </div>
          <div className="flex-1 space-y-4">
            {quotations.length > 0 ? quotations.map(q => (
              <div key={q._id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex justify-between items-center group hover:border-[#3f7abe]/30 transition-all">
                <div>
                  <p className="text-xs font-black text-[#3f7abe] mb-1">{q.quotationNo}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(q.createdAt || q.date).toLocaleDateString()}</p>
                  <p className="text-xs font-black text-slate-800 mt-1">₹{Math.round(q.netEffectivePrice || 0).toLocaleString('en-IN')}</p>
                </div>
                <button onClick={() => navigate(`/dashboard/quotations/view/${q._id}`)} className="p-2 rounded-xl bg-white shadow-sm border border-slate-200 text-slate-400 group-hover:text-[#3f7abe] group-hover:border-[#3f7abe] transition-all">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            )) : (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center py-6">No Quotations</p>
            )}
          </div>
        </div>

        {/* Payments Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <IndianRupee className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Payments</h3>
          </div>
          <div className="flex-1 space-y-4">
            {payments.length > 0 ? payments.map(p => (
              <div key={p._id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                <div>
                  <p className="text-[10px] font-black uppercase text-emerald-600 mb-1 px-2 py-0.5 bg-emerald-100 rounded-md w-fit">{p.paymentType}</p>
                  <p className="text-xs font-black text-slate-800">₹{p.amount?.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{new Date(p.paymentDate).toLocaleDateString()} • {p.paymentMode}</p>
                </div>
                <button onClick={() => navigate(`/dashboard/payments/receipt/${p._id}`)} className="p-2 rounded-xl bg-white shadow-sm border border-slate-200 text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-500 transition-all">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )) : (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center py-6">No Payments</p>
            )}
          </div>
        </div>

        {/* Invoices Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">Invoices</h3>
          </div>
          <div className="flex-1 space-y-4">
            {invoices.length > 0 ? invoices.map(i => (
              <div key={i._id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex justify-between items-center group hover:border-orange-500/30 transition-all">
                <div>
                  <p className="text-[10px] font-black uppercase text-orange-600 mb-1">{i.invoiceNo}</p>
                  <p className="text-xs font-black text-slate-800">₹{i.totalAmount?.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{new Date(i.createdAt).toLocaleDateString()} • {i.paymentStatus}</p>
                </div>
                <button onClick={() => navigate(`/dashboard/invoices/view/${i._id}`)} className="p-2 rounded-xl bg-white shadow-sm border border-slate-200 text-slate-400 group-hover:text-orange-600 group-hover:border-orange-500 transition-all">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            )) : (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center py-6">No Invoices</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadHistoryPage;
