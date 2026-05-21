import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Receipt, 
  Search, 
  Download, 
  Loader2,
  ChevronRight,
  ArrowRight,
  ChevronLeft,
  Calendar,
  Layers,
  Filter,
  RotateCcw,
  Eye
} from 'lucide-react';

const statusColors = {
  'Unpaid': 'bg-red-50 text-red-700 border border-red-200',
  'Partially Paid': 'bg-orange-50 text-orange-700 border border-orange-200',
  'Paid': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
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
  const itemsPerPage = 6;

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchInvoices = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [invRes, payRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/invoices`, config),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/payments`, config)
      ]);
      setInvoices(invRes.data);
      setPayments(payRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = (id) => {
    navigate(`/dashboard/invoices/view/${id}?download=true`);
  };

  const filteredInvoices = invoices.map(inv => {
    const totalPaid = payments.filter(p => p.leadId?._id === inv.lead?._id).reduce((sum, p) => sum + p.amount, 0);
    const computedBalance = Math.max(0, inv.totalAmount - totalPaid);
    let computedStatus = 'Unpaid';
    if (totalPaid > 0) {
      computedStatus = computedBalance <= 0 ? 'Paid' : 'Partially Paid';
    }
    return { ...inv, computedBalance, computedStatus };
  }).filter(inv => {
    const matchesSearch = inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.lead?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'All' || inv.computedStatus === filters.status;
    
    let matchesDate = true;
    if (filters.fromDate || filters.toDate) {
      const invDate = new Date(inv.createdAt || inv.date);
      if (filters.fromDate && invDate < new Date(filters.fromDate)) matchesDate = false;
      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999);
        if (invDate > toDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);

  const activeFilterCount = (filters.status !== 'All' ? 1 : 0) + (filters.fromDate ? 1 : 0) + (filters.toDate ? 1 : 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
      <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Loading Records...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing Ledger</h1>
          <p className="text-slate-600 text-sm font-bold tracking-tight">Invoice history and payment synchronization</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm self-start md:self-center">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Real-time Data</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="glass-card p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by ID or name..."
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
            Refine
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#3f7abe] text-white rounded-full flex items-center justify-center text-[10px]">
                {activeFilterCount}
              </span>
            )}
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900">Filter Ledger</h3>
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
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Payment Status</label>
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
                    <Calendar className="w-3.5 h-3.5" /> Billing Period
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
                  Apply Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 gap-4">
        {currentItems.map((inv) => (
          <div key={inv._id} className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#3f7abe]/20 group transition-all">
             <div className="flex items-center gap-5 w-full md:w-auto">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#3f7abe] shrink-0 overflow-hidden shadow-inner">
                   {inv.lead?.personalInfo?.profileImage ? (
                      <img src={inv.lead.personalInfo.profileImage} alt={inv.lead.name} className="w-full h-full object-cover" />
                   ) : (
                      <Receipt className="w-7 h-7" />
                   )}
                </div>
                <div className="min-w-0">
                   <h3 className="font-black text-slate-900 tracking-tight uppercase leading-none">{inv.invoiceNo}</h3>
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase mt-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(inv.createdAt || inv.date).toLocaleDateString()}
                   </div>
                </div>
             </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 w-full">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{inv.lead?.name}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                  <p className="text-sm font-black text-slate-900">₹{Math.round(inv.totalAmount).toLocaleString('en-IN')}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</p>
                  <p className={`text-sm font-black ${inv.computedBalance > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>₹{Math.round(inv.computedBalance).toLocaleString('en-IN')}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                  <span className={`badge ${statusColors[inv.computedStatus]} block w-fit shadow-sm`}>
                    {inv.computedStatus}
                  </span>
               </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
               <button 
                 onClick={() => navigate(`/dashboard/invoices/view/${inv._id}?gst=true`)}
                 className="flex-1 md:flex-none px-4 py-3 bg-[#3f7abe]/5 text-[#3f7abe] rounded-2xl hover:bg-[#3f7abe] hover:text-white transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-[#3f7abe]/10"
               >
                  <Eye className="w-3.5 h-3.5" />
                  GST Bill
               </button>
               <button 
                 onClick={() => navigate(`/dashboard/invoices/view/${inv._id}?gst=false`)}
                 className="flex-1 md:flex-none px-4 py-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-800 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-slate-200"
               >
                  <Eye className="w-3.5 h-3.5" />
                  Without GST
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
           <button 
             disabled={currentPage === 1}
             onClick={() => setCurrentPage(prev => prev - 1)}
             className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 transition-all"
           >
              <ChevronLeft className="w-5 h-5" />
           </button>
           <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-lg font-black text-xs transition-all ${
                    currentPage === i + 1 
                    ? 'bg-[#3f7abe] text-white shadow-sm' 
                    : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
           </div>
           <button 
             disabled={currentPage === totalPages}
             onClick={() => setCurrentPage(prev => prev + 1)}
             className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30 transition-all"
           >
              <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      )}

      {filteredInvoices.length === 0 && (
        <div className="text-center py-20 glass-card">
           <Receipt className="w-12 h-12 text-slate-200 mx-auto mb-4" />
           <h2 className="text-xl font-bold text-slate-800">No records found</h2>
           <p className="text-slate-600 text-sm mt-1 font-bold uppercase tracking-widest">Adjust your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
