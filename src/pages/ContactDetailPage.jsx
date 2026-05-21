import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Loader2,
  X,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  Edit,
  Sparkles,
  UserCheck,
  AlertCircle,
  FileSpreadsheet,
  Camera,
  Briefcase,
  Smartphone,
  CreditCard,
  Target
} from 'lucide-react';

const statusColors = {
  'New': 'bg-blue-50 text-blue-700 border-blue-100',
  'No Answer': 'bg-amber-50 text-amber-700 border-amber-100',
  'Call Back': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Interested': 'bg-purple-50 text-purple-700 border-purple-100',
  'Not Interested': 'bg-rose-50 text-rose-700 border-rose-100',
  'Converted': 'bg-emerald-50 text-emerald-700 border-emerald-100'
};

const ContactDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals & Action State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [activeTab, setActiveTab] = useState('project');

  const [statusForm, setStatusForm] = useState({
    status: '',
    remarks: '',
    callBackDate: '',
    callBackTime: ''
  });

  const [convertForm, setConvertForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    solarCapacity: '',
    roofType: 'Concrete',
    propertyType: 'Residential',
    quotationAmount: '',
    technicalRemarks: '',
    companyName: '',
    companyAddress: '',
    gstNumber: '',
    remarks: '',
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

  const fetchContactDetails = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/contacts/${id}`, config);
      setContact(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load contact details');
      navigate('/dashboard/contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactDetails();
  }, [id]);

  // Open Status modal
  const openStatusModal = () => {
    if (contact.status === 'Call Back' && contact.callBackDate) {
      const d = new Date(contact.callBackDate);
      setStatusForm({
        status: contact.status || 'New',
        remarks: contact.remarks || '',
        callBackDate: d.toISOString().split('T')[0],
        callBackTime: d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })
      });
    } else {
      setStatusForm({
        status: contact.status || 'New',
        remarks: contact.remarks || '',
        callBackDate: '',
        callBackTime: ''
      });
    }
    setShowStatusModal(true);
  };

  // Open Convert modal
  const openConvertModal = () => {
    setConvertForm({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      solarCapacity: '',
      roofType: 'Concrete',
      propertyType: 'Residential',
      quotationAmount: '',
      technicalRemarks: '',
      companyName: '',
      companyAddress: '',
      gstNumber: '',
      remarks: contact.remarks || '',
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
    setActiveTab('project');
    setShowConvertModal(true);
  };

  // Update Status & Remarks
  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (statusForm.status === 'Call Back' && (!statusForm.callBackDate || !statusForm.callBackTime)) {
      toast.error('Please select both callback date and time');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Updating status...');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        status: statusForm.status,
        remarks: statusForm.remarks,
      };

      if (statusForm.status === 'Call Back') {
        payload.callBackDate = new Date(`${statusForm.callBackDate}T${statusForm.callBackTime}`);
      }

      const { data } = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/contacts/${id}`,
        payload,
        config
      );

      toast.success('Contact updated successfully!', { id: loadingToast });
      setContact(data);
      setShowStatusModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Failed to update contact: ' + msg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert Contact to Lead
  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading('Converting to Lead...');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/contacts/${id}/convert`,
        convertForm,
        config
      );

      toast.success('Lead created and Contact converted!', { id: loadingToast });
      setContact(data.contact);
      setShowConvertModal(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Failed to convert contact: ' + msg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConvertForm(prev => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, profileImage: reader.result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConvertForm(prev => ({
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
    setConvertForm(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        additionalImages: prev.personalInfo.additionalImages.filter((_, idx) => idx !== index)
      }
    }));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
      <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Loading Details...</p>
    </div>
  );

  if (!contact) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <AlertCircle className="w-12 h-12 text-slate-400" />
      <p className="text-sm font-black text-slate-600 uppercase tracking-widest">Contact not found</p>
    </div>
  );

  // Sorting status history descending (newest first)
  const sortedHistory = contact.statusHistory ? [...contact.statusHistory].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) : [];

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-28">
      {/* Header & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-all text-slate-500 active:scale-95"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{contact.name}</h1>
              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${statusColors[contact.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                {contact.status}
              </span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">
              Contact Dossier & Audit Log
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`tel:${contact.phone}`}
            className="px-4 py-2.5 bg-sky-50 hover:bg-sky-500 text-sky-700 hover:text-white border border-sky-100 hover:border-sky-300 rounded-2xl transition-all font-black text-xs uppercase tracking-wider flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <Phone className="w-4 h-4" />
            Call Client
          </a>
          {contact.status !== 'Converted' ? (
            <>
              <button
                onClick={openStatusModal}
                className="px-4 py-2.5 bg-slate-50 hover:bg-[#3f7abe]/5 text-slate-600 hover:text-[#3f7abe] border border-slate-200 rounded-2xl transition-all font-black text-xs uppercase tracking-wider flex items-center gap-1.5 active:scale-95"
              >
                <Edit className="w-4 h-4" />
                Update Status
              </button>
              <button
                onClick={openConvertModal}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-2xl transition-all font-black text-xs uppercase tracking-wider flex items-center gap-1.5 active:scale-95 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Convert to Lead
              </button>
            </>
          ) : (
            <span className="px-4 py-2.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-2xl text-xs font-black uppercase tracking-wider">
              Converted to Lead
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Info Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">
              Profile Overview
            </h3>
            
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Phone Number</span>
                <span className="text-sm font-bold text-slate-800">{contact.phone}</span>
              </div>

              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Address</span>
                <div className="flex items-start gap-1.5 text-xs text-slate-600 font-semibold mt-1">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{contact.address}</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Assigned Telecaller</span>
                {contact.assignedTo ? (
                  <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold uppercase tracking-tight mt-1">
                    <UserCheck className="w-4 h-4 text-[#3f7abe] shrink-0" />
                    <span>{contact.assignedTo.name} ({contact.assignedTo.role})</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1 block">Unassigned</span>
                )}
              </div>

              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Created By</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold uppercase tracking-tight mt-1">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{contact.createdBy?.name || 'Admin'}</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Created At</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold mt-1">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{new Date(contact.createdAt).toLocaleString('en-GB')}</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Last Updated At</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold mt-1">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{new Date(contact.updatedAt).toLocaleString('en-GB')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Timeline Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Status History Audit Log
              </h3>
              <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black uppercase text-slate-500 tracking-wider">
                {sortedHistory.length} Updates Recorded
              </span>
            </div>

            <div className="relative border-l-2 border-slate-100 pl-6 ml-4 space-y-8 py-2">
              {sortedHistory.map((item, idx) => {
                const isNewest = idx === 0;
                const date = new Date(item.updatedAt);
                return (
                  <div key={item._id || idx} className="relative group animate-in slide-in-from-left duration-200">
                    {/* Circle marker */}
                    <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-300 ${
                      isNewest ? 'bg-[#3f7abe] ring-4 ring-[#3f7abe]/10 scale-110' : 'bg-slate-300'
                    }`} />

                    <div className="space-y-2">
                      {/* Timeline Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${statusColors[item.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                            {item.status}
                          </span>
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide">
                            by {item.updatedBy?.name || 'System / Admin'}
                          </span>
                          {item.updatedBy?.role && (
                            <span className="text-[8px] font-black bg-slate-50 border border-slate-100 text-[#3f7abe] px-1.5 py-0.2 rounded uppercase tracking-wider">
                              {item.updatedBy.role}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-300" />
                          {date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>

                      {/* Remarks */}
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-xs text-slate-600 font-semibold italic">
                        {item.remarks || 'No remarks recorded.'}
                      </div>

                      {/* Callback details */}
                      {item.status === 'Call Back' && item.callBackDate && (
                        <div className="flex items-center gap-1.5 text-[9px] text-[#3f7abe] font-black uppercase bg-[#3f7abe]/5 border border-[#3f7abe]/10 px-3 py-1 rounded-xl w-max">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Scheduled Callback: {new Date(item.callBackDate).toLocaleString('en-GB')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {sortedHistory.length === 0 && (
                <div className="text-center py-8 text-slate-400 font-bold uppercase tracking-widest text-xs">
                  No status updates recorded yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Update Contact Status */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl overflow-hidden my-auto animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 bg-[#3f7abe]/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#3f7abe]">Update Client</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                  Log status and calling notes
                </p>
              </div>
              <button 
                onClick={() => setShowStatusModal(false)} 
                className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleStatusUpdateSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                    Call Status
                  </label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                    className="input-field bg-white cursor-pointer"
                  >
                    <option value="New">New (Uncalled)</option>
                    <option value="No Answer">No Answer / Switch Off</option>
                    <option value="Call Back">Call Back Scheduled</option>
                    <option value="Interested">Interested / Prospective</option>
                    <option value="Not Interested">Not Interested</option>
                  </select>
                </div>

                {statusForm.status === 'Call Back' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                        Callback Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={statusForm.callBackDate}
                        onChange={(e) => setStatusForm({ ...statusForm, callBackDate: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                        Callback Time *
                      </label>
                      <input
                        type="time"
                        required
                        value={statusForm.callBackTime}
                        onChange={(e) => setStatusForm({ ...statusForm, callBackTime: e.target.value })}
                        className="input-field"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                    Remarks / Calling Notes
                  </label>
                  <textarea
                    value={statusForm.remarks}
                    onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
                    className="input-field h-24 pt-3"
                    placeholder="Enter call notes or comments here..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowStatusModal(false)} 
                  className="flex-1 p-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-primary flex-[2] p-4 justify-center rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-[#3f7abe]/20"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Convert Contact to Lead */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-xl overflow-visible my-auto border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 bg-[#3f7abe]/5 flex items-center justify-between rounded-t-[2.5rem]">
              <div>
                <h2 className="text-2xl font-black text-[#3f7abe]">Convert to Lead</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                  Add technical details to pipeline
                </p>
              </div>
              <button 
                onClick={() => setShowConvertModal(false)} 
                className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-500"
              >
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
            
            <form onSubmit={handleConvertSubmit} className="p-8">
               {activeTab === 'project' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Full Name *</label>
                        <input type="text" required value={convertForm.name} onChange={e => setConvertForm({...convertForm, name: e.target.value})} className="input-field" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Phone *</label>
                        <input type="text" required value={convertForm.phone} onChange={e => setConvertForm({...convertForm, phone: e.target.value})} className="input-field" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Address *</label>
                        <textarea required value={convertForm.address} onChange={e => setConvertForm({...convertForm, address: e.target.value})} className="input-field h-24" />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Capacity (kW)</label>
                        <input type="text" value={convertForm.solarCapacity} onChange={e => setConvertForm({...convertForm, solarCapacity: e.target.value})} className="input-field" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Roof Type</label>
                          <select value={convertForm.roofType} onChange={e => setConvertForm({...convertForm, roofType: e.target.value})} className="input-field">
                            <option>Concrete</option>
                            <option>Tin Shade</option>
                            <option>Tiled</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Property</label>
                          <select value={convertForm.propertyType} onChange={e => setConvertForm({...convertForm, propertyType: e.target.value})} className="input-field">
                            <option>Residential</option>
                            <option>Commercial</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Quotation Amount</label>
                        <input type="number" value={convertForm.quotationAmount} onChange={e => setConvertForm({...convertForm, quotationAmount: e.target.value})} className="input-field" />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Technical Remarks</label>
                       <textarea value={convertForm.technicalRemarks} onChange={e => setConvertForm({...convertForm, technicalRemarks: e.target.value})} className="input-field h-24" />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Conversion Remarks / Calling Notes</label>
                       <textarea value={convertForm.remarks} onChange={e => setConvertForm({...convertForm, remarks: e.target.value})} className="input-field h-24" placeholder="Provide details about call outcome and solar project interest..." />
                    </div>

                    {convertForm.propertyType === 'Commercial' && (
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#3f7abe]/5 rounded-[2rem] border border-[#3f7abe]/10 animate-in zoom-in-95 duration-300">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#3f7abe] uppercase tracking-widest">Company Name</label>
                            <input type="text" value={convertForm.companyName} onChange={e => setConvertForm({...convertForm, companyName: e.target.value})} className="input-field border-[#3f7abe]/20 focus:border-[#3f7abe]" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#3f7abe] uppercase tracking-widest">GST Number</label>
                            <input type="text" value={convertForm.gstNumber} onChange={e => setConvertForm({...convertForm, gstNumber: e.target.value})} className="input-field border-[#3f7abe]/20 focus:border-[#3f7abe]" placeholder="22AAAAA0000A1Z5" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#3f7abe] uppercase tracking-widest">Company Address</label>
                            <input type="text" value={convertForm.companyAddress} onChange={e => setConvertForm({...convertForm, companyAddress: e.target.value})} className="input-field border-[#3f7abe]/20 focus:border-[#3f7abe]" />
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
                                    {convertForm.personalInfo.profileImage ? (
                                       <img src={convertForm.personalInfo.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                       <User className="w-12 h-12 text-slate-200" />
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
                                 {convertForm.personalInfo.additionalImages.map((img, idx) => (
                                    <div key={idx} className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                                       <img src={img} alt={`Doc ${idx}`} className="w-full h-full object-cover" />
                                       <button type="button" onClick={() => removeAdditionalImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                                          <X className="w-3 h-3" />
                                       </button>
                                    </div>
                                 ))}
                                 <label className="w-full aspect-square bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 hover:border-[#3f7abe]/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer text-slate-400 group">
                                    <Camera className="w-6 h-6 group-hover:scale-110 transition-all" />
                                    <span className="text-[8px] font-black uppercase mt-1">Upload</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleAdditionalImagesUpload} />
                                 </label>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Alt Phone</label>
                                 <input type="text" value={convertForm.personalInfo.alternatePhone} onChange={e => setConvertForm({...convertForm, personalInfo: { ...convertForm.personalInfo, alternatePhone: e.target.value }})} className="input-field" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">WhatsApp</label>
                                 <input type="text" value={convertForm.personalInfo.whatsappNumber} onChange={e => setConvertForm({...convertForm, personalInfo: { ...convertForm.personalInfo, whatsappNumber: e.target.value }})} className="input-field" />
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Gender</label>
                                 <select value={convertForm.personalInfo.gender} onChange={e => setConvertForm({...convertForm, personalInfo: { ...convertForm.personalInfo, gender: e.target.value }})} className="input-field">
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                 </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Occupation</label>
                                 <input type="text" value={convertForm.personalInfo.occupation} onChange={e => setConvertForm({...convertForm, personalInfo: { ...convertForm.personalInfo, occupation: e.target.value }})} className="input-field" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Date of Birth</label>
                              <input type="date" value={convertForm.personalInfo.dob} onChange={e => setConvertForm({...convertForm, personalInfo: { ...convertForm.personalInfo, dob: e.target.value }})} className="input-field" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Aadhaar No.</label>
                                 <input type="text" value={convertForm.personalInfo.aadhaarNumber} onChange={e => setConvertForm({...convertForm, personalInfo: { ...convertForm.personalInfo, aadhaarNumber: e.target.value }})} className="input-field" placeholder="0000 0000 0000" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">PAN Number</label>
                                 <input type="text" value={convertForm.personalInfo.panNumber} onChange={e => setConvertForm({...convertForm, personalInfo: { ...convertForm.personalInfo, panNumber: e.target.value }})} className="input-field" placeholder="ABCDE1234F" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               <div className="flex gap-4 pt-8 border-t border-slate-50 mt-8">
                  <button 
                    type="button" 
                    onClick={() => { setShowConvertModal(false); }} 
                    className="flex-1 p-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary flex-[2] p-4 justify-center rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-[#3f7abe]/20"
                  >
                     {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Conversion'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactDetailPage;
