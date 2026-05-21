import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import SearchableSelect from '../components/UI/SearchableSelect';
import {
  Upload,
  Plus,
  Search,
  Trash2,
  BookOpen,
  FileSpreadsheet,
  X,
  Loader2,
  Check,
  AlertCircle,
  Phone,
  MapPin,
  User,
  User as UserIcon,
  UserCheck,
  Edit,
  Sparkles,
  RefreshCw,
  Download,
  Zap,
  Calendar,
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

const ContactsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Admin Modals & Selection State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const [telecallers, setTelecallers] = useState([]);
  const [selectedTelecallerId, setSelectedTelecallerId] = useState('');
  const [assignmentMode, setAssignmentMode] = useState('manual');
  const [autoAssignCount, setAutoAssignCount] = useState('10');
  
  // Telecaller Action State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  
  const [statusForm, setStatusForm] = useState({
    status: '',
    remarks: ''
  });

  const [activeTab, setActiveTab] = useState('project'); // 'project' or 'personal'
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

  // Common Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Single Contact Form State (Admin)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    remarks: ''
  });

  // Bulk Upload Preview State
  const [importPreview, setImportPreview] = useState([]);
  const [fileName, setFileName] = useState('');

  // Confirmation modal config
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Fetch Contacts
      const contactRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/contacts`, config);
      setContacts(contactRes.data);

      // If Admin, also fetch staff/telecallers
      if (isAdmin) {
        const staffRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/staff`, config);
        const activeTelecallers = staffRes.data.filter(
          (s) => s.role === 'telecaller' && s.status === 'active'
        );
        setTelecallers(activeTelecallers);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create single contact (Admin)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadingToast = toast.loading('Adding contact...');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/contacts`, formData, config);
      
      toast.success('Contact Added!', { id: loadingToast });
      setContacts(prev => [data, ...prev]);
      setShowAddModal(false);
      setFormData({ name: '', phone: '', address: '', remarks: '' });
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Failed to add contact: ' + msg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parse Excel / CSV File (Admin)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rawData.length < 2) {
          toast.error('File appears to be empty or missing headers');
          return;
        }

        // Get headers and convert to lowercase
        const headers = rawData[0].map(h => String(h).trim().toLowerCase());
        const nameIdx = headers.indexOf('name');
        const phoneIdx = headers.indexOf('phone');
        const addressIdx = headers.indexOf('address');
        const remarksIdx = headers.indexOf('remarks');

        if (nameIdx === -1 || phoneIdx === -1 || addressIdx === -1) {
          toast.error('File must contain "Name", "Phone", and "Address" columns');
          return;
        }

        const parsedRows = [];
        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (row.length === 0) continue;

          const name = row[nameIdx] ? String(row[nameIdx]).trim() : '';
          const phone = row[phoneIdx] ? String(row[phoneIdx]).trim() : '';
          const address = row[addressIdx] ? String(row[addressIdx]).trim() : '';
          const remarks = remarksIdx !== -1 && row[remarksIdx] ? String(row[remarksIdx]).trim() : '';

          if (name && phone) {
            parsedRows.push({ name, phone, address, remarks });
          }
        }

        if (parsedRows.length === 0) {
          toast.error('No valid rows found (Name & Phone are required)');
        } else {
          setImportPreview(parsedRows);
          toast.success(`${parsedRows.length} contacts parsed successfully!`);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to parse file. Please verify layout.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Download Sample Excel Template
  const downloadSampleTemplate = () => {
    const headers = [["Name", "Phone", "Address", "Remarks"]];
    const sampleRows = [
      ["Sushil Kumar", "9876543210", "123, Eco Street, Jaipur, Rajasthan", "Interested in 5kW solar system"],
      ["Amit Sharma", "9123456789", "456, Solar Sector, Noida, UP", "Call back tomorrow morning"]
    ];
    const sheetData = [...headers, ...sampleRows];
    
    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      
      // Auto-fit column widths (with fallback sizes)
      const wscols = [
        { wch: 20 }, // Name
        { wch: 15 }, // Phone
        { wch: 40 }, // Address
        { wch: 35 }  // Remarks
      ];
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, "Contacts Template");
      XLSX.writeFile(wb, "sample_contacts.xlsx");
      toast.success("Excel template downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate template Excel file");
    }
  };

  // Bulk upload to server (Admin)
  const handleBulkUploadSubmit = async () => {
    if (importPreview.length === 0) return;
    setIsSubmitting(true);
    const loadingToast = toast.loading(`Uploading ${importPreview.length} contacts...`);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/contacts/bulk`, importPreview, config);
      
      toast.success('All contacts uploaded successfully!', { id: loadingToast });
      fetchData();
      setShowUploadModal(false);
      setImportPreview([]);
      setFileName('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Failed to upload contacts: ' + msg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete contact (Admin)
  const handleDeleteContact = (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Contact?',
      message: 'Are you sure you want to delete this contact? This action cannot be undone.',
      onConfirm: async () => {
        const loadingToast = toast.loading('Deleting contact...');
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/contacts/${id}`, config);
          toast.success('Contact deleted', { id: loadingToast });
          fetchData();
        } catch (err) {
          const msg = err.response?.data?.message || err.message;
          toast.error('Failed to delete contact: ' + msg, { id: loadingToast });
        }
      }
    });
  };

  const openAssignModal = () => {
    if (selectedContactIds.length > 0) {
      setAssignmentMode('manual');
    } else {
      setAssignmentMode('auto');
    }
    setAutoAssignCount('10');
    setSelectedTelecallerId('');
    setShowAssignModal(true);
  };

  // Bulk Assign Contacts (Admin)
  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    const targetContactIds = assignmentMode === 'manual'
      ? selectedContactIds
      : filteredContacts.filter(c => !c.assignedTo).slice(0, parseInt(autoAssignCount, 10) || 0).map(c => c._id);

    if (targetContactIds.length === 0) {
      toast.error(assignmentMode === 'manual' ? 'No contacts selected' : 'No unassigned contacts available to assign');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Assigning contacts...');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/contacts/assign`,
        {
          contactIds: targetContactIds,
          assignedTo: selectedTelecallerId === 'unassign' ? null : (selectedTelecallerId || null)
        },
        config
      );

      toast.success('Assignment updated successfully!', { id: loadingToast });
      fetchData();
      setSelectedContactIds([]);
      setShowAssignModal(false);
      setSelectedTelecallerId('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Failed to assign contacts: ' + msg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Status & Remarks (Telecaller)
  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedContact) return;
    setIsSubmitting(true);
    const loadingToast = toast.loading('Updating status...');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/contacts/${selectedContact._id}`,
        statusForm,
        config
      );

      toast.success('Contact updated successfully!', { id: loadingToast });
      
      // Update local state
      setContacts(prev => prev.map(c => c._id === selectedContact._id ? { ...c, status: data.status, remarks: data.remarks } : c));
      setShowStatusModal(false);
      setSelectedContact(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Failed to update contact: ' + msg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert Contact to Lead (Telecaller)
  const handleConvertSubmit = async (e) => {
    e.preventDefault();
    if (!selectedContact) return;
    setIsSubmitting(true);
    const loadingToast = toast.loading('Converting to Lead...');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/contacts/${selectedContact._id}/convert`,
        convertForm,
        config
      );

      toast.success('Lead created and Contact converted!', { id: loadingToast });
      
      // Update local state status to Converted
      setContacts(prev => prev.map(c => c._id === selectedContact._id ? { ...c, status: 'Converted', remarks: convertForm.remarks || c.remarks } : c));
      setShowConvertModal(false);
      setSelectedContact(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Failed to convert contact: ' + msg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Status modal
  const openStatusModal = (contact) => {
    setSelectedContact(contact);
    setStatusForm({
      status: contact.status || 'New',
      remarks: contact.remarks || ''
    });
    setShowStatusModal(true);
  };

  // Open Convert modal
  const openConvertModal = (contact) => {
    setSelectedContact(contact);
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

  // Handle Multi-Selection Checkboxes
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const unassignedContacts = filteredContacts.filter(c => !c.assignedTo);
      setSelectedContactIds(unassignedContacts.map(c => c._id));
    } else {
      setSelectedContactIds([]);
    }
  };

  const handleSelectContact = (id) => {
    setSelectedContactIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
      <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Loading Contacts...</p>
    </div>
  );

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-28 relative">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isAdmin ? 'Contacts Directory' : 'My Assigned Calls'}
          </h1>
          <p className="text-slate-600 text-sm font-bold">
            {isAdmin 
              ? 'Manage calling databases, bulk import excel sheets and assign tasks' 
              : 'Call clients, update logs, and convert prospective databases to leads'
            }
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowUploadModal(true)} 
              className="btn-secondary flex items-center gap-2 self-start md:self-center"
            >
              <Upload className="w-4 h-4" />
              Bulk Import (Excel/CSV)
            </button>
            <button 
              onClick={openAssignModal} 
              className="btn-secondary flex items-center gap-2 self-start md:self-center"
            >
              <UserCheck className="w-4 h-4" />
              Assign to Telecaller
            </button>
            <button 
              onClick={() => setShowAddModal(true)} 
              className="btn-primary flex items-center gap-2 self-start md:self-center shadow-lg shadow-[#3f7abe]/10"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        )}
      </div>

      {/* Filter and Stats Bar */}
      <div className="glass-card p-4 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, phone or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 self-start lg:self-center">
          <UserCheck className="w-4 h-4 text-[#3f7abe]" />
          <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{filteredContacts.length} Contacts Found</span>
        </div>
      </div>

      {/* Contacts List Grid */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100">
                {isAdmin && (
                  <th className="p-5 w-10 text-center">
                    <input 
                      type="checkbox" 
                      onChange={handleSelectAll} 
                      checked={filteredContacts.filter(c => !c.assignedTo).length > 0 && selectedContactIds.length === filteredContacts.filter(c => !c.assignedTo).length}
                      disabled={filteredContacts.filter(c => !c.assignedTo).length === 0}
                      className="rounded border-slate-300 text-[#3f7abe] focus:ring-[#3f7abe] w-4 h-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </th>
                )}
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</th>
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone</th>
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Address</th>
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Assigned To</th>
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Remarks</th>
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredContacts.map((contact) => (
                <tr key={contact._id} className="hover:bg-slate-50/50 transition-colors group">
                  {isAdmin && (
                    <td className="p-5 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedContactIds.includes(contact._id)}
                        onChange={() => handleSelectContact(contact._id)}
                        disabled={!!contact.assignedTo}
                        title={contact.assignedTo ? `Already assigned to ${contact.assignedTo.name}` : 'Select for assignment'}
                        className="rounded border-slate-300 text-[#3f7abe] focus:ring-[#3f7abe] w-4 h-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                  )}
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-[#3f7abe]">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{contact.name}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {contact.phone}
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold max-w-[200px] truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {contact.address}
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${statusColors[contact.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="p-5">
                    {contact.assignedTo ? (
                      <span className="px-2 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-[9px] font-black uppercase tracking-wider">
                        {contact.assignedTo.name}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-50 text-slate-400 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="p-5">
                    <span className="text-xs font-semibold text-slate-500 italic truncate max-w-[150px] block">
                      {contact.remarks || 'No remarks'}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <a
                        href={`tel:${contact.phone}`}
                        className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-500 text-sky-700 hover:text-white border border-sky-100 hover:border-sky-300 rounded-xl transition-all font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 active:scale-95 shadow-sm"
                        title={`Call ${contact.name}`}
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </a>
                      
                      {isAdmin ? (
                        <button
                          onClick={() => handleDeleteContact(contact._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-95"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        contact.status !== 'Converted' ? (
                          <>
                            <button
                              onClick={() => openStatusModal(contact)}
                              className="px-2.5 py-1.5 bg-slate-50 hover:bg-[#3f7abe]/5 text-slate-600 hover:text-[#3f7abe] border border-slate-100 rounded-xl transition-all font-black text-[9px] uppercase tracking-wider flex items-center gap-1 active:scale-95"
                              title="Update Status / Remarks"
                            >
                              <Edit className="w-3 h-3" />
                              Update
                            </button>
                            <button
                              onClick={() => openConvertModal(contact)}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-xl transition-all font-black text-[9px] uppercase tracking-wider flex items-center gap-1 active:scale-95"
                              title="Convert to Lead"
                            >
                              <Sparkles className="w-3 h-3" />
                              Convert
                            </button>
                          </>
                        ) : (
                          <span className="px-2 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-lg text-[9px] font-black uppercase tracking-wider">
                            Lead Active
                          </span>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredContacts.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="p-20 text-center">
                    <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-800">No contacts found</h3>
                    <p className="text-slate-600 text-sm font-bold uppercase tracking-widest mt-1">
                      {isAdmin 
                        ? 'Add a single contact or upload a database to start calling' 
                        : 'No calls assigned to you. Contact admin for list assignments.'
                      }
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Bar (Admin Bulk assignment) */}
      {isAdmin && selectedContactIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40 animate-in slide-in-from-bottom-5 duration-300">
          <div className="backdrop-blur-md bg-white/90 border border-slate-200/80 p-4 rounded-3xl shadow-[0_15px_40px_-5px_rgba(0,0,0,0.15)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 pl-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f6871e] animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
                {selectedContactIds.length} Selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedContactIds([])}
                className="px-4 py-2.5 text-slate-500 hover:text-slate-800 text-[10px] font-black uppercase tracking-widest"
              >
                Clear
              </button>
              <button
                onClick={openAssignModal}
                className="btn-primary px-5 py-2.5 flex items-center gap-2 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-[#3f7abe]/20"
              >
                <UserCheck className="w-4 h-4" />
                Assign Telecaller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Assign Telecaller (Admin) */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl overflow-visible my-auto animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 bg-[#3f7abe]/5 rounded-t-[2.5rem] flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#3f7abe]">Assign Tasks</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                  {assignmentMode === 'manual'
                    ? `Assigning ${selectedContactIds.length} contacts manually`
                    : `Auto-assigning top contacts`}
                </p>
              </div>
              <button 
                onClick={() => setShowAssignModal(false)} 
                className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAssignSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                    Select Telecaller Executive
                  </label>
                  <SearchableSelect
                    required
                    value={selectedTelecallerId}
                    onChange={(val) => setSelectedTelecallerId(val)}
                    options={[
                      { value: 'unassign', label: 'Unassigned (Clear assignment)' },
                      ...telecallers.map(t => ({
                        value: t._id,
                        label: `${t.name.toUpperCase()} (${t.email})`
                      }))
                    ]}
                    placeholder="-- Choose Telecaller --"
                    searchPlaceholder="Search telecallers..."
                  />
                </div>

                {assignmentMode === 'manual' && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/80 space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Assignment Method
                    </span>
                    <span className="text-xs font-bold text-slate-700 block">
                      Manual Assignment ({selectedContactIds.length} contact{selectedContactIds.length > 1 ? 's' : ''} selected)
                    </span>
                  </div>
                )}

                {assignmentMode === 'auto' && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">
                      Number of Contacts to Assign *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="1"
                        max={filteredContacts.filter(c => !c.assignedTo).length}
                        value={autoAssignCount}
                        onChange={(e) => setAutoAssignCount(e.target.value)}
                        placeholder="e.g. 10"
                        className="input-field pr-20"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                        Max: {filteredContacts.filter(c => !c.assignedTo).length}
                      </span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide ml-1">
                      Assigns the first {autoAssignCount || 0} unassigned contacts matching current search/filters.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAssignModal(false)} 
                  className="flex-1 p-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-primary flex-[2] p-4 justify-center rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-[#3f7abe]/20"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Manual Add Contact (Admin) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl overflow-hidden my-auto animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 bg-[#3f7abe]/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#3f7abe]">Add Contact</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Manual entry</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Full Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    className="input-field" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Phone Number *</label>
                  <input 
                    type="text" 
                    name="phone" 
                    required 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="input-field" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Address *</label>
                  <textarea 
                    name="address" 
                    required 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    className="input-field h-20 pt-3" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Remarks</label>
                  <input 
                    type="text" 
                    name="remarks" 
                    value={formData.remarks} 
                    onChange={handleInputChange} 
                    className="input-field" 
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="flex-1 p-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-primary flex-[2] p-4 justify-center rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-[#3f7abe]/20"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Bulk Upload (Admin) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-xl overflow-hidden my-auto animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 bg-[#3f7abe]/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[#3f7abe]">Bulk Import Contacts</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Excel (.xlsx) or CSV format</p>
              </div>
              <button 
                onClick={() => { setShowUploadModal(false); setImportPreview([]); setFileName(''); }} 
                className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              
              {/* Uploader */}
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center bg-slate-50 hover:bg-slate-100/50 hover:border-[#3f7abe] transition-all relative flex flex-col items-center justify-center cursor-pointer group">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                />
                <div className="p-4 bg-white rounded-2xl shadow-sm text-slate-400 group-hover:text-[#3f7abe] group-hover:scale-110 transition-all mb-3">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  {fileName ? fileName : 'Choose spreadsheet file'}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  Drag and drop or click to browse
                </p>
              </div>

              {/* Template Download Option */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-600">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Need a template?</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                      Download the ready-to-use sample sheet
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-2xl transition-all font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 active:scale-95 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Template
                </button>
              </div>

              {/* Requirement Note */}
              <div className="flex items-start gap-3 p-4 bg-[#f6871e]/5 rounded-2xl border border-[#f6871e]/10 text-xs">
                <AlertCircle className="w-5 h-5 text-[#f6871e] shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-[#f6871e] uppercase tracking-wide">File Columns requirement</p>
                  <p className="text-slate-600 font-medium mt-1">
                    Your file must contain the headers: <strong className="text-slate-800">Name</strong>, <strong className="text-slate-800">Phone</strong>, and <strong className="text-slate-800">Address</strong>. You can also include <strong className="text-slate-800">Remarks</strong>. Non-empty Name and Phone are required.
                  </p>
                </div>
              </div>

              {/* Preview Section */}
              {importPreview.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">
                      Import Preview ({importPreview.length} items parsed)
                    </span>
                    <button 
                      onClick={() => { setImportPreview([]); setFileName(''); }}
                      className="text-[10px] font-black text-rose-600 uppercase tracking-widest hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-2xl custom-scrollbar bg-slate-50/50">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 sticky top-0 border-b border-slate-200">
                          <th className="p-3 font-bold text-slate-700">Name</th>
                          <th className="p-3 font-bold text-slate-700">Phone</th>
                          <th className="p-3 font-bold text-slate-700">Address</th>
                          <th className="p-3 font-bold text-slate-700">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {importPreview.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-100/30 transition-colors">
                            <td className="p-3 font-bold text-slate-800 uppercase">{row.name}</td>
                            <td className="p-3 font-medium text-slate-600">{row.phone}</td>
                            <td className="p-3 font-medium text-slate-600 truncate max-w-[120px]">{row.address}</td>
                            <td className="p-3 font-medium text-slate-500 italic truncate max-w-[120px]">{row.remarks || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importPreview.length > 10 && (
                      <div className="p-3 text-center text-[10px] font-black text-slate-400 bg-slate-100 border-t border-slate-200 uppercase tracking-widest">
                        And {importPreview.length - 10} more rows...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-2">
                <button 
                  type="button" 
                  onClick={() => { setShowUploadModal(false); setImportPreview([]); setFileName(''); }} 
                  className="flex-1 p-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  disabled={isSubmitting || importPreview.length === 0} 
                  onClick={handleBulkUploadSubmit}
                  className="btn-primary flex-[2] p-4 justify-center rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-[#3f7abe]/20 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Update Contact Status (Telecaller) */}
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
                onClick={() => { setShowStatusModal(false); setSelectedContact(null); }} 
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
                  onClick={() => { setShowStatusModal(false); setSelectedContact(null); }} 
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

      {/* MODAL: Convert Contact to Lead (Telecaller) */}
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
                onClick={() => { setShowConvertModal(false); setSelectedContact(null); }} 
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
                                 {convertForm.personalInfo.additionalImages.map((img, idx) => (
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
                              <input type="text" value={convertForm.personalInfo.alternatePhone} onChange={e => setConvertForm({...convertForm, personalInfo: {...convertForm.personalInfo, alternatePhone: e.target.value}})} className="input-field" placeholder="e.g. +91 00000 00000" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                 <Zap className="w-3.5 h-3.5" /> WhatsApp Number
                              </label>
                              <input type="text" value={convertForm.personalInfo.whatsappNumber} onChange={e => setConvertForm({...convertForm, personalInfo: {...convertForm.personalInfo, whatsappNumber: e.target.value}})} className="input-field" placeholder="Same as primary?" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <UserIcon className="w-3.5 h-3.5" /> Gender
                                 </label>
                                 <select value={convertForm.personalInfo.gender} onChange={e => setConvertForm({...convertForm, personalInfo: {...convertForm.personalInfo, gender: e.target.value}})} className="input-field">
                                    <option>Male</option>
                                    <option>Female</option>
                                    <option>Other</option>
                                 </select>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <Briefcase className="w-3.5 h-3.5" /> Occupation
                                 </label>
                                 <input type="text" value={convertForm.personalInfo.occupation} onChange={e => setConvertForm({...convertForm, personalInfo: {...convertForm.personalInfo, occupation: e.target.value}})} className="input-field" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                 <Calendar className="w-3.5 h-3.5" /> Date of Birth
                              </label>
                              <input type="date" value={convertForm.personalInfo.dob} onChange={e => setConvertForm({...convertForm, personalInfo: {...convertForm.personalInfo, dob: e.target.value}})} className="input-field" />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <Target className="w-3.5 h-3.5" /> Aadhaar Number
                                 </label>
                                 <input type="text" value={convertForm.personalInfo.aadhaarNumber} onChange={e => setConvertForm({...convertForm, personalInfo: {...convertForm.personalInfo, aadhaarNumber: e.target.value}})} className="input-field" placeholder="12 Digit No." />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                    <CreditCard className="w-3.5 h-3.5" /> PAN Card No.
                                 </label>
                                 <input type="text" value={convertForm.personalInfo.panNumber} onChange={e => setConvertForm({...convertForm, personalInfo: {...convertForm.personalInfo, panNumber: e.target.value}})} className="input-field" placeholder="ABCDE1234F" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

              <div className="flex gap-4 pt-10">
                <button 
                  type="button" 
                  onClick={() => { setShowConvertModal(false); setSelectedContact(null); }} 
                  className="flex-1 p-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-primary flex-[2] p-4 justify-center rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 border-emerald-600 hover:border-emerald-700"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Convert & Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type="danger"
        confirmText="Delete Contact"
      />
    </div>
  );
};

export default ContactsPage;
