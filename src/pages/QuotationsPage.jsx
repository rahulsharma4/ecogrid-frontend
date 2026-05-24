import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Loader2,
  ChevronRight,
  Zap,
  Filter,
  Calendar,
  RotateCcw,
  ChevronLeft,
  ArrowRight,
  Eye
} from 'lucide-react';

const statusColors = {
  'Pending': 'bg-orange-50 text-orange-700 border border-orange-200',
  'Converted': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Cancelled': 'bg-red-50 text-red-700 border border-red-200',
};

const QuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef(null);
  
  const [filters, setFilters] = useState({
    status: 'All',
    fromDate: '',
    toDate: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const fetchQuotations = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/quotations`, config);
      setQuotations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
    
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = (id) => {
    navigate(`/dashboard/quotations/view/${id}?download=true`);
  };

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.lead?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'All' || q.status === filters.status;
    
    let matchesDate = true;
    if (filters.fromDate || filters.toDate) {
      const qDate = new Date(q.date);
      if (filters.fromDate && qDate < new Date(filters.fromDate)) matchesDate = false;
      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999);
        if (qDate > toDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuotations.slice(indexOfFirstItem, indexOfLastItem);

  const activeFilterCount = (filters.status !== 'All' ? 1 : 0) + (filters.fromDate ? 1 : 0) + (filters.toDate ? 1 : 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
      <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Loading Proposals...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Quotations</h1>
          <p className="text-slate-600 text-sm font-bold tracking-tight">Engineering estimates and technical proposals</p>
        </div>
        <button onClick={() => navigate('/dashboard/quotations/create')} className="btn-secondary self-start md:self-center">
          <Plus className="w-5 h-5" />
          Create Proposal
        </button>
      </div>

      {/* Control Bar */}
      <div className="glass-card p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by proposal ID or customer..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="input-field pl-10"
          />
        </div>
        
        {/* Filter Popover */}
        <div className="relative" ref={filterRef}>
          <button 
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-xs font-black uppercase tracking-wider ${
              activeFilterCount > 0 
              ? 'bg-[#3f7abe]/5 border-[#3f7abe] text-[#3f7abe]' 
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#3f7abe] text-white rounded-full flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </span>
            )}
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900">Refine List</h3>
                <button 
                  onClick={() => {
                    setFilters({ status: 'All', fromDate: '', toDate: '' });
                    setShowFilterDropdown(false);
                  }}
                  className="text-[10px] font-black text-[#3f7abe] uppercase hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Proposal Status</label>
                  <select 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="input-field bg-slate-50 border-none"
                  >
                    <option value="All">All Statuses</option>
                    {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase ml-1">From</p>
                      <input 
                        type="date" 
                        value={filters.fromDate}
                        onChange={(e) => setFilters({...filters, fromDate: e.target.value})}
                        className="input-field text-xs py-2 px-3 bg-slate-50 border-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-slate-500 font-bold uppercase ml-1">To</p>
                      <input 
                        type="date" 
                        value={filters.toDate}
                        onChange={(e) => setFilters({...filters, toDate: e.target.value})}
                        className="input-field text-xs py-2 px-3 bg-slate-50 border-none" 
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setShowFilterDropdown(false)}
                  className="w-full btn-primary justify-center py-3 text-[10px] uppercase tracking-widest shadow-lg shadow-[#3f7abe]/20 mt-2"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {currentItems.map((q) => (
          <div key={q._id} className="glass-card hover:border-[#3f7abe]/20 group flex flex-col overflow-hidden transition-all">
            <div className="p-4 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3f7abe]/5 flex items-center justify-center text-[#3f7abe] border border-[#3f7abe]/10">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-none mb-0.5 uppercase tracking-tight text-sm">{q.quotationNo}</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase mt-0.5 tracking-widest">{new Date(q.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`badge ${statusColors[q.status]} text-[8px] font-black shadow-sm px-2 py-0.5 rounded-md`}>
                  {q.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                <div className="space-y-0.5 flex items-center gap-2">
                   <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[#3f7abe] font-black overflow-hidden shrink-0 text-xs">
                      {q.lead?.personalInfo?.profileImage ? (
                         <img src={q.lead.personalInfo.profileImage} alt={q.lead.name} className="w-full h-full object-cover" />
                      ) : (
                         q.lead?.name.charAt(0).toUpperCase()
                      )}
                   </div>
                   <div className="overflow-hidden">
                      <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest leading-none mb-0.5">Customer</p>
                      <p className="text-xs font-bold text-slate-800 truncate uppercase leading-none">{q.lead?.name}</p>
                   </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">System Size</p>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-orange-500" />
                    {q.systemSize}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Net Price</p>
                  <p className="text-sm font-black text-[#3f7abe]">₹{q.netPrice.toLocaleString()}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Effective Price</p>
                  <p className="text-sm font-black text-emerald-600">₹{q.netEffectivePrice.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                   By: <span className="text-slate-800">{q.createdBy?.name.split(' ')[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                   {q.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => navigate(`/dashboard/quotations/edit/${q._id}`)}
                          className="py-1.5 px-3 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all shadow-sm border border-amber-100 font-black text-[8px] uppercase tracking-widest"
                        >
                           Edit
                        </button>
                        <button 
                           onClick={() => {
                             setModalConfig({
                               isOpen: true,
                               title: 'Generate Invoice?',
                               message: `Convert Proposal ${q.quotationNo} into a formal tax invoice?`,
                               onConfirm: async () => {
                                 const loadingToast = toast.loading('Generating Tax Invoice...');
                                 try {
                                   const config = { headers: { Authorization: `Bearer ${user.token}` } };
                                   await axios.post(`${import.meta.env.VITE_API_BASE_URL}/invoices`, {
                                     leadId: q.lead?._id,
                                     quotationId: q._id,
                                     systemSize: q.systemSize,
                                     solarPanels: q.solarPanels,
                                     inverter: q.inverter,
                                     baseAmount: q.isGstInclusive ? q.netPrice : (q.netPrice - q.gstAmount),
                                     gstPercentage: q.gstPercentage,
                                     isGstInclusive: !!q.isGstInclusive,
                                     amountPaid: 0
                                   }, config);
                                   toast.success('Invoice Generated!', { id: loadingToast });
                                   fetchQuotations();
                                 } catch (err) {
                                   const msg = err.response?.data?.message || err.message;
                                   toast.error('Failed: ' + msg, { id: loadingToast });
                                 }
                               }
                             });
                           }}
                          className="py-1.5 px-3 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 font-black text-[8px] uppercase tracking-widest"
                        >
                           Invoice
                        </button>
                      </>
                   )}
                   <button 
                     onClick={() => handleDownload(q._id)}
                     className="p-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-[#3f7abe] hover:text-white transition-all shadow-sm border border-slate-100"
                   >
                      <Download className="w-3.5 h-3.5" />
                   </button>
                   <button 
                     onClick={() => navigate(`/dashboard/quotations/view/${q._id}`)}
                     className="py-1.5 px-4 bg-[#3f7abe]/5 text-[#3f7abe] rounded-lg hover:bg-[#3f7abe] hover:text-white transition-all font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-2"
                   >
                     View
                     <Eye className="w-3 h-3" />
                   </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
           <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-5 h-5" />
           </button>
           <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-9 h-9 rounded-lg font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-[#3f7abe] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'}`}>
                  {i + 1}
                </button>
              ))}
           </div>
           <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 transition-all">
              <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      )}

      {filteredQuotations.length === 0 && (
        <div className="text-center py-20 glass-card">
           <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
           <h2 className="text-xl font-black text-slate-800">No proposals found</h2>
           <p className="text-slate-600 text-sm mt-1 font-bold uppercase tracking-widest">Adjust your filters</p>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
      />
    </div>
  );
};

export default QuotationsPage;
