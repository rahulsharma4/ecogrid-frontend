import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SearchableSelect from '../components/UI/SearchableSelect';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Loader2,
  Download,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  X,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Zap
} from 'lucide-react';

const paymentTypeColors = {
  'Booking Amount': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Material Payment': 'bg-orange-50 text-orange-700 border border-orange-200',
  'Installation Payment': 'bg-purple-50 text-purple-700 border border-purple-200',
  'Final Payment': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef(null);
  
  const [filters, setFilters] = useState({
    type: 'All',
    fromDate: '',
    toDate: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    leadId: '',
    amount: '',
    paymentMode: 'Online',
    paymentType: 'Booking Amount',
    referenceNo: '',
    bankName: '',
    chequeDate: '',
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [payRes, leadsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/payments`, config),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/leads`, config)
      ]);
      setPayments(payRes.data);
      setLeads(leadsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = (id) => {
    navigate(`/dashboard/payments/receipt/${id}?download=true`);
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Logging transaction...');
    setIsSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payments`, formData, config);
      toast.success('Payment Logged Successfully!', { id: loadingToast });
      setShowAddForm(false);
      setFormData({ leadId: '', amount: '', paymentMode: 'Online', paymentType: 'Booking Amount', referenceNo: '', bankName: '', chequeDate: '', remarks: '' });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Failed to log payment: ' + msg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.leadId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.remarks?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.type === 'All' || p.paymentType === filters.type;
    
    let matchesDate = true;
    if (filters.fromDate || filters.toDate) {
      const pDate = new Date(p.createdAt);
      if (filters.fromDate && pDate < new Date(filters.fromDate)) matchesDate = false;
      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999);
        if (pDate > toDate) matchesDate = false;
      }
    }
    return matchesSearch && matchesType && matchesDate;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);

  const activeFilterCount = (filters.type !== 'All' ? 1 : 0) + (filters.fromDate ? 1 : 0) + (filters.toDate ? 1 : 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
      <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Loading Ledger...</p>
    </div>
  );

  const totalLifetime = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Financial Ledger</h1>
          <p className="text-slate-600 text-sm font-bold tracking-tight">Revenue tracking and audit logs</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-secondary self-start md:self-center">
          <Plus className="w-5 h-5" />
          Log Payment
        </button>
      </div>

      {/* Summary Stat for Mobile */}
      <div className="bg-[#3f7abe] p-8 rounded-[2.5rem] text-white shadow-xl shadow-[#3f7abe]/20 flex items-center justify-between overflow-hidden relative group">
         <div className="absolute right-[-10%] top-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Collection</p>
            <h2 className="text-4xl font-black mt-1 tracking-tighter">₹{totalLifetime.toLocaleString()}</h2>
         </div>
         <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <CreditCard className="w-7 h-7" />
         </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="input-field pl-10" 
          />
        </div>
        <div className="relative" ref={filterRef}>
           <button 
             onClick={() => setShowFilterDropdown(!showFilterDropdown)}
             className={`p-3 rounded-xl border transition-all ${activeFilterCount > 0 ? 'bg-[#3f7abe]/5 border-[#3f7abe] text-[#3f7abe]' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'}`}
           >
             <Filter className="w-5 h-5" />
           </button>
           {showFilterDropdown && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900">Filter Ledger</h3>
                  <button onClick={() => setFilters({ type: 'All', fromDate: '', toDate: '' })} className="text-[10px] font-black text-[#3f7abe] uppercase hover:underline flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Reset</button>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Type</label>
                    <select value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})} className="input-field bg-slate-50 border-none">
                      <option value="All">All Types</option>
                      {Object.keys(paymentTypeColors).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Date Range</label>
                    <div className="grid grid-cols-2 gap-3">
                       <input type="date" value={filters.fromDate} onChange={e => setFilters({...filters, fromDate: e.target.value})} className="input-field text-xs px-2 bg-slate-50 border-none" />
                       <input type="date" value={filters.toDate} onChange={e => setFilters({...filters, toDate: e.target.value})} className="input-field text-xs px-2 bg-slate-50 border-none" />
                    </div>
                  </div>
                  <button onClick={() => setShowFilterDropdown(false)} className="w-full btn-primary justify-center rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-[#3f7abe]/20">Apply</button>
                </div>
              </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {currentItems.map((payment) => (
          <div key={payment._id} className="glass-card hover:border-[#3f7abe]/20 group transition-all">
             <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[#3f7abe] font-black shadow-inner overflow-hidden shrink-0 text-xs">
                          {payment.leadId?.personalInfo?.profileImage ? (
                             <img src={payment.leadId.personalInfo.profileImage} alt={payment.leadId.name} className="w-full h-full object-cover" />
                          ) : (
                             payment.leadId?.name.charAt(0).toUpperCase()
                          )}
                       </div>
                       <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 truncate max-w-[120px] sm:max-w-none uppercase tracking-tight leading-none text-xs">{payment.leadId?.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <span className={`px-1.5 py-0.5 rounded-[4px] text-[7px] font-black uppercase ${paymentTypeColors[payment.paymentType]}`}>
                                {payment.paymentType}
                             </span>
                             <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest">#{payment._id.slice(-6).toUpperCase()}</span>
                          </div>
                       </div>
                   </div>
                   <div className="text-right">
                      <p className="text-base font-black text-slate-900 leading-none">₹{payment.amount.toLocaleString()}</p>
                      <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mt-1">{payment.paymentMode}</p>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                   <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-wider">
                      <Calendar className="w-3 h-3" />
                      {new Date(payment.createdAt).toLocaleDateString()}
                   </div>
                   <div className="flex items-center gap-2">
                      <button 
                         onClick={() => handleDownload(payment._id)}
                         className="p-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-[#3f7abe] hover:text-white transition-all shadow-sm active:scale-95"
                      >
                         <Download className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => navigate(`/dashboard/payments/receipt/${payment._id}`)}
                        className="p-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-[#3f7abe] hover:text-white transition-all shadow-sm active:scale-95"
                      >
                         <Eye className="w-3.5 h-3.5" />
                      </button>
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4 pb-8">
           <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
           <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-9 h-9 rounded-lg font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-[#3f7abe] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'}`}>{i + 1}</button>
              ))}
           </div>
           <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl overflow-hidden my-auto animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 bg-[#3f7abe]/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#3f7abe]">Log Revenue</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Audit Entry</p>
              </div>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-500"><X className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleAddPayment} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Client Account *</label>
                  <SearchableSelect
                    required
                    value={formData.leadId}
                    onChange={(val) => setFormData({...formData, leadId: val})}
                    options={leads
                      .filter(l => ['Quotation Sent', 'Booked', 'Installation Underway', 'Completed'].includes(l.status))
                      .map(l => ({ value: l._id, label: `${l.name} (${l.phone})` }))
                    }
                    placeholder="Select Account..."
                    searchPlaceholder="Search accounts by name or phone..."
                  />
                </div>

                {formData.leadId && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    {(() => {
                      const selectedLead = leads.find(l => l._id === formData.leadId);
                      if (!selectedLead) return null;

                      const totalPaid = payments.filter(p => p.leadId?._id === selectedLead._id).reduce((acc, curr) => acc + curr.amount, 0);
                      const remainingPayment = Math.max(0, (selectedLead.quotationAmount || 0) - totalPaid);

                      return (
                        <div className="bg-[#3f7abe]/5 border border-[#3f7abe]/10 rounded-[2rem] p-5 space-y-4 relative overflow-hidden group">
                           <div className="flex items-center gap-4 relative z-10">
                              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[#3f7abe] font-black text-lg overflow-hidden shrink-0 shadow-inner">
                                {selectedLead.personalInfo?.profileImage ? (
                                  <img src={selectedLead.personalInfo.profileImage} alt={selectedLead.name} className="w-full h-full object-cover" />
                                ) : (
                                  selectedLead.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <h4 className="font-black text-slate-950 uppercase tracking-tight text-sm leading-none mb-1">{selectedLead.name}</h4>
                                <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                  <span className="px-1.5 py-0.5 bg-white rounded-md border border-slate-100 text-[#3f7abe]">{selectedLead.status}</span>
                                  <span>#{selectedLead._id.slice(-6).toUpperCase()}</span>
                                </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-3 gap-3 relative z-10">
                              <div className="bg-white/60 p-3 rounded-xl border border-white/50">
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Contact</p>
                                 <p className="text-[10px] font-bold text-slate-900 truncate">{selectedLead.phone}</p>
                              </div>
                              <div className="bg-white/60 p-3 rounded-xl border border-white/50">
                                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Assigned To</p>
                                 <p className="text-[10px] font-bold text-[#3f7abe] uppercase truncate">{selectedLead.assignedTo?.name || 'Unassigned'}</p>
                              </div>
                              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
                                 <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mb-0.5">Remaining</p>
                                 <p className="text-[10px] font-bold text-orange-600 truncate">₹{remainingPayment.toLocaleString('en-IN')}</p>
                              </div>
                           </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Transaction Amount (₹) *</label>
                  <input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="input-field text-xl font-black" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Phase</label>
                    <select value={formData.paymentType} onChange={e => setFormData({...formData, paymentType: e.target.value})} className="input-field">
                      {Object.keys(paymentTypeColors).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Mode</label>
                    <select value={formData.paymentMode} onChange={e => setFormData({...formData, paymentMode: e.target.value})} className="input-field">
                      <option value="Online">Online</option>
                      <option value="UPI">UPI Scan & Pay</option>
                      <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Fields based on Mode */}
                {formData.paymentMode === 'UPI' && (
                  <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">UPI Transaction ID / Ref No *</label>
                      <input type="text" required value={formData.referenceNo} onChange={e => setFormData({...formData, referenceNo: e.target.value})} placeholder="e.g. 6388908096" className="input-field bg-white" />
                    </div>
                    {formData.amount && Number(formData.amount) > 0 && (
                      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-100 gap-2">
                        <p className="text-[9px] font-black text-[#3f7abe] uppercase tracking-wider text-center">Scan & Pay Dynamic QR</p>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                            `upi://pay?pa=6388908096m@pnb&pn=ECOGRID%20INFRA%20PRIVATE%20LIMITED&am=${formData.amount}&cu=INR&tn=${encodeURIComponent(`${formData.paymentType} Ref ${formData.leadId ? formData.leadId.slice(-6).toUpperCase() : ''}`)}`
                          )}`} 
                          alt="Dynamic UPI QR" 
                          className="w-36 h-36 border border-slate-100 rounded-lg" 
                        />
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center mt-1">UPI ID: 6388908096m@pnb</p>
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest text-center">Payee: ECOGRID INFRA PRIVATE LIMITED</p>
                      </div>
                    )}
                  </div>
                )}

                {formData.paymentMode === 'Bank Transfer' && (
                  <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">UTR / Ref No *</label>
                        <input type="text" required value={formData.referenceNo} onChange={e => setFormData({...formData, referenceNo: e.target.value})} placeholder="e.g. UTR / Ref ID" className="input-field bg-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Remitting Bank Name *</label>
                        <input type="text" required value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} placeholder="e.g. HDFC, SBI" className="input-field bg-white" />
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-1 text-xs">
                      <p className="text-[9px] font-black text-[#3f7abe] uppercase tracking-wider mb-2">PNB Current Account Details</p>
                      <p className="font-bold text-slate-700">Name: <span className="text-slate-900 font-extrabold">ECOGRID INFRA PRIVATE LIMITED</span></p>
                      <p className="font-bold text-slate-700">A/c No: <span className="text-slate-900 font-extrabold">6193002100004183</span></p>
                      <p className="font-bold text-slate-700">IFSC: <span className="text-slate-900 font-extrabold">PUNB0619300</span></p>
                      <p className="font-bold text-slate-700">Branch: <span className="text-slate-900 font-extrabold">Vibhuti Khand, Gomti Nagar, Lucknow</span></p>
                    </div>
                  </div>
                )}

                {formData.paymentMode === 'Cheque' && (
                  <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Cheque Number *</label>
                        <input type="text" required value={formData.referenceNo} onChange={e => setFormData({...formData, referenceNo: e.target.value})} placeholder="e.g. 691244" className="input-field bg-white" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Remitting Bank Name *</label>
                        <input type="text" required value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} placeholder="e.g. PNB, SBI" className="input-field bg-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Cheque Date *</label>
                      <input type="date" required value={formData.chequeDate} onChange={e => setFormData({...formData, chequeDate: e.target.value})} className="input-field bg-white" />
                    </div>
                  </div>
                )}

                {formData.paymentMode === 'Online' && (
                  <div className="space-y-1 animate-in fade-in slide-in-from-top-4 duration-300">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Transaction Ref / ID (Optional)</label>
                    <input type="text" value={formData.referenceNo} onChange={e => setFormData({...formData, referenceNo: e.target.value})} placeholder="e.g. txn_12345" className="input-field" />
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Internal Remarks</label>
                  <input type="text" value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="input-field" />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 p-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-[2] p-4 justify-center rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-[#3f7abe]/20">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
