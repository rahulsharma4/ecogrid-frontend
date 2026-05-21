import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import SearchableSelect from '../components/UI/SearchableSelect';
import { 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  Zap, 
  Loader2,
  X,
  History,
  Edit,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  RotateCcw,
  Camera,
  Briefcase,
  Smartphone,
  CreditCard,
  Target
} from 'lucide-react';

const statusColors = {
  'New': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Contacted': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'Follow-up Scheduled': 'bg-violet-50 text-violet-700 border border-violet-200',
  'Site Visit Scheduled': 'bg-orange-50 text-orange-700 border border-orange-200',
  'Meeting Done': 'bg-pink-50 text-pink-700 border border-pink-200',
  'Quotation Sent': 'bg-purple-50 text-purple-700 border border-purple-200',
  'Booked': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Installation Underway': 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  'Completed': 'bg-green-50 text-green-700 border border-green-200',
  'Cancelled': 'bg-red-50 text-red-700 border border-red-200',
  'Closed': 'bg-slate-200 text-slate-700 border border-slate-300',
};

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpData, setFollowUpData] = useState({ date: '', time: '', remarks: '' });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef(null);
  
  const [selectedLead, setSelectedLead] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter States
  const [filters, setFilters] = useState({
    status: 'All',
    fromDate: '',
    toDate: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('project'); // 'project' or 'personal'
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', solarCapacity: '', 
    roofType: 'Concrete', propertyType: 'Residential', assignedTo: '',
    quotationAmount: '', technicalRemarks: '',
    companyName: '', companyAddress: '', gstNumber: '',
    personalInfo: {
      profileImage: '',
      additionalImages: [],
      alternatePhone: '',
      whatsappNumber: '',
      gender: 'Male',
      occupation: '',
      dob: '',
      aadhaarNumber: '',
      panNumber: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [leadsRes, staffRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/leads`, config),
        user.role === 'admin' ? axios.get(`${import.meta.env.VITE_API_BASE_URL}/staff`, config) : Promise.resolve({ data: [] })
      ]);
      setLeads(leadsRes.data);
      setStaff(staffRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusUpdateClick = (lead, status) => {
    setSelectedLead(lead);
    setNewStatus(status);
    setStatusComment('');
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!statusComment) return toast.error('Please enter a comment for status update');
    const loadingToast = toast.loading('Updating lead status...');
    setIsSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/leads/${selectedLead._id}`, { 
        status: newStatus,
        comment: statusComment 
      }, config);
      toast.success('Status Updated Successfully', { id: loadingToast });
      setShowStatusModal(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Update Failed: ' + msg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFollowUpClick = (lead) => {
    setSelectedLead(lead);
    if (lead.followUpDate) {
      const d = new Date(lead.followUpDate);
      setFollowUpData({
        date: d.toISOString().split('T')[0],
        time: d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' }),
        remarks: lead.followUpRemarks || ''
      });
    } else {
      setFollowUpData({ date: '', time: '', remarks: '' });
    }
    setShowFollowUpModal(true);
  };

  const confirmFollowUp = async () => {
    if (!followUpData.date || !followUpData.time) return toast.error('Please select both date and time');
    const loadingToast = toast.loading('Scheduling follow-up...');
    setIsSubmitting(true);
    try {
      const followUpDateTime = new Date(`${followUpData.date}T${followUpData.time}`);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/leads/${selectedLead._id}`, { 
        followUpDate: followUpDateTime,
        followUpRemarks: followUpData.remarks,
        followUpStatus: 'Pending',
        status: 'Follow-up Scheduled',
        comment: `Meeting scheduled for ${new Date(followUpDateTime).toLocaleString()}`
      }, config);
      toast.success('Follow-up Scheduled!', { id: loadingToast });
      setShowFollowUpModal(false);
      fetchData();
    } catch (err) {
      toast.error('Scheduling Failed: ' + (err.response?.data?.message || err.message), { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOrUpdateLead = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(showEditModal ? 'Updating lead profile...' : 'Creating new lead...');
    setIsSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (showEditModal) {
        await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/leads/${selectedLead._id}`, formData, config);
        toast.success('Lead Profile Updated', { id: loadingToast });
        setShowEditModal(false);
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/leads`, formData, config);
        toast.success('New Lead Created', { id: loadingToast });
        setShowAddForm(false);
      }
      resetForm();
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Operation Failed: ' + msg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', email: '', phone: '', address: '', solarCapacity: '', 
      roofType: 'Concrete', propertyType: 'Residential', assignedTo: '',
      quotationAmount: '', technicalRemarks: '',
      companyName: '', companyAddress: '', gstNumber: '',
      personalInfo: {
        profileImage: '',
        additionalImages: [],
        alternatePhone: '',
        whatsappNumber: '',
        gender: 'Male',
        occupation: '',
        dob: '',
        aadhaarNumber: '',
        panNumber: ''
      }
    });
    setSelectedLead(null);
    setActiveTab('project');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("Image size should be less than 2MB");
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          personalInfo: { ...formData.personalInfo, profileImage: reader.result }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error(`${file.name} is larger than 2MB`);
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          personalInfo: { 
            ...prev.personalInfo, 
            additionalImages: [...prev.personalInfo.additionalImages, reader.result] 
          }
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAdditionalImage = (index) => {
    const newImages = [...formData.personalInfo.additionalImages];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      personalInfo: { ...formData.personalInfo, additionalImages: newImages }
    });
  };

  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone,
      address: lead.address,
      solarCapacity: lead.solarCapacity || '',
      roofType: lead.roofType || 'Concrete',
      propertyType: lead.propertyType || 'Residential',
      assignedTo: lead.assignedTo?._id || '',
      quotationAmount: lead.quotationAmount || '',
      technicalRemarks: lead.technicalRemarks || '',
      companyName: lead.companyName || '',
      companyAddress: lead.companyAddress || '',
      gstNumber: lead.gstNumber || '',
      personalInfo: {
        profileImage: lead.personalInfo?.profileImage || '',
        additionalImages: lead.personalInfo?.additionalImages || [],
        alternatePhone: lead.personalInfo?.alternatePhone || '',
        whatsappNumber: lead.personalInfo?.whatsappNumber || '',
        gender: lead.personalInfo?.gender || 'Male',
        occupation: lead.personalInfo?.occupation || '',
        dob: lead.personalInfo?.dob ? new Date(lead.personalInfo.dob).toISOString().split('T')[0] : '',
        aadhaarNumber: lead.personalInfo?.aadhaarNumber || '',
        panNumber: lead.personalInfo?.panNumber || ''
      }
    });
    setShowEditModal(true);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || lead.phone.includes(searchTerm);
    const matchesStatus = filters.status === 'All' || lead.status === filters.status;
    
    // Date Filtering
    let matchesDate = true;
    if (filters.fromDate || filters.toDate) {
      const leadDate = new Date(lead.createdAt);
      if (filters.fromDate && leadDate < new Date(filters.fromDate)) matchesDate = false;
      if (filters.toDate) {
        const toDate = new Date(filters.toDate);
        toDate.setHours(23, 59, 59, 999);
        if (leadDate > toDate) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);

  const activeFilterCount = (filters.status !== 'All' ? 1 : 0) + (filters.fromDate ? 1 : 0) + (filters.toDate ? 1 : 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
      <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Loading Leads...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leads Pipeline</h1>
          <p className="text-slate-600 text-sm font-bold tracking-tight">Manage and track your customer journey</p>
        </div>
        <button onClick={() => { resetForm(); setShowAddForm(true); }} className="btn-secondary">
          <Plus className="w-5 h-5" />
          Add New Lead
        </button>
      </div>

      {/* Control Bar */}
      <div className="glass-card p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search leads by name or contact number..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="input-field pl-10"
          />
        </div>
        
        {/* Filter Popover */}
        <div className="relative" ref={filterRef}>
          <button 
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider ${
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
                <h3 className="font-bold text-slate-900">Refine Results</h3>
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
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Lead Phase</label>
                  <select 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="input-field bg-slate-50 border-none"
                  >
                    <option value="All">All Phases</option>
                    {Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Creation Timeline
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

      {/* Leads Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {currentItems.map((lead) => {
          const isClosed = lead.status === 'Closed';
          return (
          <div key={lead._id} className="glass-card hover:border-[#3f7abe]/20 group flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-50">
               <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[#3f7abe] shrink-0 font-bold shadow-inner overflow-hidden">
                      {lead.personalInfo?.profileImage ? (
                        <img src={lead.personalInfo.profileImage} alt={lead.name} className="w-full h-full object-cover" />
                      ) : (
                        lead.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 leading-none mb-1">{lead.name}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase truncate max-w-[150px]">
                          <MapPin className="w-2.5 h-2.5 text-slate-400" /> {lead.address}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-slate-500 font-bold uppercase">
                          <Calendar className="w-2.5 h-2.5 text-slate-400" /> {new Date(lead.createdAt).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <select
                      value={lead.status}
                      disabled={lead.status === 'Closed'}
                      onChange={(e) => handleStatusUpdateClick(lead, e.target.value)}
                      className={`text-[8px] font-black px-2 py-1 rounded-md border outline-none transition-all uppercase tracking-wider shadow-sm ${statusColors[lead.status]} ${lead.status === 'Closed' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {Object.keys(statusColors).map(s => (
                        <option key={s} value={s} disabled={lead.status === 'Closed'}>{s}</option>
                      ))}
                    </select>
                    
                    {lead.followUpDate ? (
                      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter shadow-sm animate-pulse
                        ${new Date(lead.followUpDate) < new Date() ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        <Calendar className="w-2.5 h-2.5" />
                        Next: {new Date(lead.followUpDate).toLocaleDateString('en-GB')}
                      </div>
                    ) : (
                      lead.history && lead.history.length > 0 && (
                        <div className="flex items-center gap-1 text-[7px] font-bold text-slate-400 uppercase tracking-tighter">
                          <RotateCcw className="w-2 h-2" />
                          Updated {new Date(lead.history[lead.history.length - 1].updatedAt).toLocaleDateString('en-GB')}
                        </div>
                      )
                    )}
                  </div>
               </div>
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/50">
              <div className="space-y-0.5">
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Capacity</p>
                <div className="flex items-center gap-1 font-bold text-slate-900 text-xs">
                  <Zap className="w-3 h-3 text-orange-500" />
                  {lead.solarCapacity || '---'}
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Quote</p>
                <div className="flex items-center gap-1 font-bold text-slate-900 text-xs">
                  <span className="text-emerald-600 font-black">₹</span>
                  {lead.quotationAmount ? lead.quotationAmount.toLocaleString() : '---'}
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Assigned</p>
                <div className="flex items-center gap-1 font-bold text-[#3f7abe] text-xs truncate uppercase">
                  <UserIcon className="w-3 h-3" />
                  {lead.assignedTo?.name.split(' ')[0] || 'NONE'}
                </div>
              </div>
              <div className="space-y-0.5">
                <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Contact</p>
                <div className="flex items-center gap-1 font-bold text-slate-900 text-xs uppercase">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {lead.phone}
                </div>
              </div>
            </div>

            <div className="mt-auto p-3 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
               <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1 text-[9px] font-black px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest text-white bg-sky-600 hover:bg-sky-700 shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                    title={`Call ${lead.name}`}
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                  <button onClick={() => navigate(`/dashboard/leads/${lead._id}/history`)} className="flex items-center gap-1 text-[9px] font-black text-slate-600 hover:text-[#3f7abe] transition-all uppercase tracking-wider">
                    <History className="w-3 h-3" /> History
                  </button>
                  <button 
                    onClick={() => !isClosed && openEditModal(lead)} 
                    disabled={isClosed}
                    className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider transition-all ${isClosed ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-orange-600'}`}
                  >
                    <Edit className="w-3 h-3" /> Profile
                  </button>
                  <button 
                    onClick={() => !isClosed && handleFollowUpClick(lead)} 
                    disabled={isClosed}
                    className={`flex items-center gap-1 text-[9px] font-black px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest ${isClosed ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' : 'text-white bg-[#3f7abe] hover:bg-[#326199]'}`}
                  >
                    <Calendar className="w-3 h-3" /> Follow Up
                  </button>
               </div>
               <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest">#{lead._id.slice(-6).toUpperCase()}</div>
            </div>
          </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
           <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30">
              <ChevronLeft className="w-5 h-5" />
           </button>
           <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-9 h-9 rounded-lg font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-[#3f7abe] text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'}`}>
                  {i + 1}
                </button>
              ))}
           </div>
           <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-30">
              <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-md rounded-[2rem] shadow-xl overflow-hidden">
               <div className="p-6 border-b border-slate-100 bg-[#3f7abe]/5">
                  <h2 className="text-xl font-black text-[#3f7abe]">Status Update</h2>
                  <div className="flex items-center justify-between mt-1">
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-wider">New Phase: <span className="text-orange-600">{newStatus}</span></p>
                     <p className="text-[9px] font-bold text-[#3f7abe] uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-[#3f7abe]/10">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                     </p>
                  </div>
               </div>
              <div className="p-6 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Comment *</label>
                    <textarea 
                       value={statusComment}
                       onChange={(e) => setStatusComment(e.target.value)}
                       placeholder="Detail the interaction outcome..."
                       className="input-field h-24"
                    />
                 </div>
                 <div className="flex gap-3">
                    <button onClick={() => setShowStatusModal(false)} className="flex-1 p-3 bg-slate-50 text-slate-600 rounded-xl font-black uppercase text-[10px] tracking-wider hover:bg-slate-100 transition-all">Cancel</button>
                    <button onClick={confirmStatusUpdate} disabled={isSubmitting || !statusComment} className="btn-primary flex-1 p-3 justify-center rounded-xl text-[10px] uppercase tracking-wider">
                       {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddForm || showEditModal) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-xl overflow-visible my-auto border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-[#3f7abe]/[0.01] rounded-t-[2.5rem]">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  {showEditModal ? 'Edit Lead' : 'Create Lead'}
                </h2>
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mt-1">Lead Onboarding & Details</p>
              </div>
              <button onClick={() => { setShowAddForm(false); setShowEditModal(false); }} className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-500">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex px-8 border-b border-slate-50 bg-slate-50/30">
               <button 
                  type="button"
                  onClick={() => setActiveTab('project')}
                  className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'project' ? 'border-[#3f7abe] text-[#3f7abe]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
               >
                  Project Details
               </button>
               <button 
                  type="button"
                  onClick={() => setActiveTab('personal')}
                  className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'personal' ? 'border-[#3f7abe] text-[#3f7abe]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
               >
                  Personal Information
               </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdateLead} className="p-8">
               {activeTab === 'project' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Full Name *</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Phone *</label>
                        <input type="text" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Address *</label>
                        <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="input-field h-24" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Capacity (kW)</label>
                        <input type="text" value={formData.solarCapacity} onChange={e => setFormData({...formData, solarCapacity: e.target.value})} className="input-field" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Roof Type</label>
                          <select value={formData.roofType} onChange={e => setFormData({...formData, roofType: e.target.value})} className="input-field">
                            <option>Concrete</option>
                            <option>Tin Shade</option>
                            <option>Tiled</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Property</label>
                          <select value={formData.propertyType} onChange={e => setFormData({...formData, propertyType: e.target.value})} className="input-field">
                            <option>Residential</option>
                            <option>Commercial</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Quotation Amount</label>
                        <input type="number" value={formData.quotationAmount} onChange={e => setFormData({...formData, quotationAmount: e.target.value})} className="input-field" />
                      </div>
                      {user.role === 'admin' && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Assigned Staff</label>
                          <SearchableSelect
                            value={formData.assignedTo}
                            onChange={val => setFormData({...formData, assignedTo: val})}
                          options={staff
                            .filter(s => s.role === 'staff' && s.status === 'active')
                            .map(s => ({ value: s._id, label: s.name.toUpperCase() }))}
                            placeholder="Select Personnel..."
                            searchPlaceholder="Search personnel..."
                          />
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Technical Remarks</label>
                       <textarea value={formData.technicalRemarks} onChange={e => setFormData({...formData, technicalRemarks: e.target.value})} className="input-field h-24" />
                    </div>

                    {formData.propertyType === 'Commercial' && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#3f7abe]/5 rounded-[2rem] border border-[#3f7abe]/10 animate-in zoom-in-95 duration-300">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#3f7abe] uppercase tracking-widest">Company Name</label>
                            <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="input-field border-[#3f7abe]/20 focus:border-[#3f7abe]" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#3f7abe] uppercase tracking-widest">GST Number</label>
                            <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="input-field border-[#3f7abe]/20 focus:border-[#3f7abe]" placeholder="22AAAAA0000A1Z5" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#3f7abe] uppercase tracking-widest">Company Address</label>
                            <input type="text" value={formData.companyAddress} onChange={e => setFormData({...formData, companyAddress: e.target.value})} className="input-field border-[#3f7abe]/20 focus:border-[#3f7abe]" />
                         </div>
                      </div>
                    )}
                  </div>
               ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                           <div className="flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 group hover:border-[#3f7abe]/30 transition-all">
                              <div className="relative">
                                 <div className="w-32 h-32 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center overflow-hidden border-4 border-white">
                                    {formData.personalInfo.profileImage ? (
                                       <img src={formData.personalInfo.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                       <UserIcon className="w-12 h-12 text-slate-200" />
                                    )}
                                 </div>
                                 <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#3f7abe] text-white rounded-2xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-all">
                                    <Camera className="w-5 h-5" />
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                 </label>
                              </div>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4">Profile Image</p>
                           </div>

                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest block ml-1">Additional Documents / Images</label>
                              <div className="grid grid-cols-3 gap-3">
                                 {formData.personalInfo.additionalImages.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm group">
                                       <img src={img} alt={`doc-${idx}`} className="w-full h-full object-cover" />
                                       <button 
                                          type="button" 
                                          onClick={() => removeAdditionalImage(idx)}
                                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                       >
                                          <X className="w-3.5 h-3.5" />
                                       </button>
                                    </div>
                                 ))}
                                 <label className="aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-[#3f7abe] hover:border-[#3f7abe]/30 transition-all cursor-pointer">
                                    <Plus className="w-6 h-6" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter mt-1">Add Image</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleAdditionalImagesUpload} />
                                 </label>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                 <Smartphone className="w-3.5 h-3.5" /> Alt. Phone Number
                              </label>
                              <input type="text" value={formData.personalInfo.alternatePhone} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, alternatePhone: e.target.value}})} className="input-field" placeholder="e.g. +91 00000 00000" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                 <Zap className="w-3.5 h-3.5" /> WhatsApp Number
                              </label>
                              <input type="text" value={formData.personalInfo.whatsappNumber} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, whatsappNumber: e.target.value}})} className="input-field" placeholder="Same as primary?" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <UserIcon className="w-3.5 h-3.5" /> Gender
                                 </label>
                                 <select value={formData.personalInfo.gender} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, gender: e.target.value}})} className="input-field">
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                 </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase className="w-3.5 h-3.5" /> Occupation
                                 </label>
                                 <input type="text" value={formData.personalInfo.occupation} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, occupation: e.target.value}})} className="input-field" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                 <Calendar className="w-3.5 h-3.5" /> Date of Birth
                              </label>
                              <input type="date" value={formData.personalInfo.dob} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, dob: e.target.value}})} className="input-field" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <Target className="w-3.5 h-3.5" /> Aadhaar Number
                                 </label>
                                 <input type="text" value={formData.personalInfo.aadhaarNumber} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, aadhaarNumber: e.target.value}})} className="input-field" placeholder="12 Digit No." />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard className="w-3.5 h-3.5" /> PAN Card No.
                                 </label>
                                 <input type="text" value={formData.personalInfo.panNumber} onChange={e => setFormData({...formData, personalInfo: {...formData.personalInfo, panNumber: e.target.value}})} className="input-field" placeholder="ABCDE1234F" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

              <div className="flex gap-4 pt-10">
                <button type="button" onClick={() => { setShowAddForm(false); setShowEditModal(false); }} className="flex-1 p-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-[2] p-4 justify-center rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#3f7abe]/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (showEditModal ? 'Update Lead Profile' : 'Confirm & Save Lead')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Follow Up Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
               <div className="p-8 border-b border-slate-100 bg-[#3f7abe]/5">
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 rounded-2xl bg-[#3f7abe] text-white flex items-center justify-center shadow-lg shadow-[#3f7abe]/20">
                        <Calendar className="w-5 h-5" />
                     </div>
                     <h2 className="text-xl font-black text-slate-900">Schedule Follow-up</h2>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Plan your next meeting with <span className="text-[#3f7abe]">{selectedLead?.name}</span></p>
               </div>

               <div className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Next Date *</label>
                        <input 
                           type="date" 
                           min={new Date().toISOString().split('T')[0]}
                           value={followUpData.date} 
                           onChange={e => setFollowUpData({...followUpData, date: e.target.value})} 
                           className="input-field" 
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Next Time *</label>
                        <input 
                           type="time" 
                           value={followUpData.time} 
                           onChange={e => setFollowUpData({...followUpData, time: e.target.value})} 
                           className="input-field" 
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Follow-up Remarks</label>
                     <textarea 
                        value={followUpData.remarks} 
                        onChange={e => setFollowUpData({...followUpData, remarks: e.target.value})} 
                        className="input-field h-24 pt-3" 
                        placeholder="What needs to be discussed in the next meeting?"
                     />
                  </div>

                  <div className="flex gap-4 pt-2">
                     <button 
                        onClick={() => setShowFollowUpModal(false)} 
                        className="flex-1 p-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-100 transition-all"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={confirmFollowUp}
                        disabled={isSubmitting}
                        className="btn-primary flex-[2] p-4 justify-center rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-[#3f7abe]/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                     >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Follow-up'}
                     </button>
                  </div>
               </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default LeadsPage;
