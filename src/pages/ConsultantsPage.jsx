import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import { 
  Trash2, 
  Shield, 
  Phone, 
  Mail, 
  Loader2, 
  UserPlus, 
  Search,
  ShieldCheck,
  UserCheck,
  X,
  Plus,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';

const ConsultantsPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const fetchStaff = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/staff`, config);
      setStaff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Adding consultant...');
    setIsSubmitting(true);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data: newUser } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/staff`, formData, config);
      toast.success('Consultant Added!', { id: loadingToast });
      setShowAddForm(false);
      setFormData({ name: '', email: '', phone: '', password: '', role: 'staff' });
      
      // Update local state instead of full re-fetch for instant UI feedback
      setStaff(prev => [newUser, ...prev]);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      toast.error('Failed to add consultant: ' + msg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteStaff = async (id) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Consultant?',
      message: 'This action will revoke all access for this consultant immediately. Are you sure you want to proceed?',
      type: 'danger',
      confirmText: 'Delete Member',
      onConfirm: async () => {
        const loadingToast = toast.loading('Removing consultant...');
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/staff/${id}`, config);
          toast.success('Consultant Removed', { id: loadingToast });
          fetchStaff();
        } catch (err) {
          const msg = err.response?.data?.message || err.message;
          toast.error('Failed to delete consultant: ' + msg, { id: loadingToast });
        }
      }
    });
  };

  const toggleBlockStatus = async (id, currentStatus) => {
    const isBlocking = currentStatus === 'active';
    setModalConfig({
      isOpen: true,
      title: isBlocking ? 'Block Consultant?' : 'Unblock Consultant?',
      message: isBlocking 
        ? 'This user will be blocked immediately and logged out of any active sessions. Are you sure?'
        : 'This user will be unblocked and will be able to log back into their account. Are you sure?',
      type: isBlocking ? 'danger' : 'confirm',
      confirmText: isBlocking ? 'Block Member' : 'Unblock Member',
      onConfirm: async () => {
        const actionText = isBlocking ? 'Blocking' : 'Unblocking';
        const loadingToast = toast.loading(`${actionText} consultant...`);
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.patch(
            `${import.meta.env.VITE_API_BASE_URL}/staff/${id}/toggle-status`,
            {},
            config
          );
          
          toast.success(`Consultant successfully ${data.status === 'active' ? 'unblocked' : 'blocked'}!`, { id: loadingToast });
          
          // Update local state instead of full re-fetch for instant UI feedback
          setStaff(prev => prev.map(member => 
            member._id === id ? { ...member, status: data.status } : member
          ));
        } catch (err) {
          const msg = err.response?.data?.message || err.message;
          toast.error(`Failed to update status: ${msg}`, { id: loadingToast });
        }
      }
    });
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
      <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Loading Consultants...</p>
    </div>
  );

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Consultants Registry</h1>
          <p className="text-slate-600 text-sm font-bold">Access Control & Team Management</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-secondary self-start md:self-center">
          <UserPlus className="w-5 h-5" />
          Add Consultant
        </button>
      </div>

      <div className="glass-card p-4 flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 self-start lg:self-center">
           <UserCheck className="w-4 h-4 text-[#3f7abe]" />
           <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">{filteredStaff.length} Users Found</span>
        </div>
      </div>

      {/* Responsive Grid for Staff */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {filteredStaff.map((member) => (
          <div 
            key={member._id} 
            onClick={() => navigate(`/dashboard/consultants/${member._id}`)}
            className="glass-card hover:border-[#3f7abe]/20 group relative overflow-hidden flex flex-col transition-all cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-95"
          >
            <div className={`absolute top-0 left-0 w-full h-1 ${member.role === 'admin' ? 'bg-[#3f7abe]' : 'bg-slate-200'}`}></div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#3f7abe] font-black text-base shadow-inner group-hover:bg-[#3f7abe] group-hover:text-white transition-all shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-900 leading-none mb-1.5 truncate uppercase tracking-tight text-xs">{member.name}</h3>
                    <div className="flex flex-wrap items-center gap-1.5">
                       <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase border flex items-center gap-1 w-fit ${
                          member.role === 'admin' ? 'bg-[#3f7abe]/5 text-[#3f7abe] border-[#3f7abe]/10' :
                          member.role === 'telecaller' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {member.role === 'admin' ? <ShieldCheck className="w-2.5 h-2.5" /> :
                           member.role === 'telecaller' ? <Phone className="w-2.5 h-2.5" /> :
                           <Shield className="w-2.5 h-2.5" />}
                          {member.role === 'staff' ? 'Consultant' : member.role === 'telecaller' ? 'Telecaller' : member.role}
                       </span>
                       <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase border w-fit ${
                          member.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {member.status}
                       </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteStaff(member._id); }}
                  className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  <span className="truncate text-[10px]">{member.email}</span>
                </div>
                <a
                  href={`tel:${member.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#3f7abe] transition-all hover:scale-102 origin-left w-fit"
                  title={`Call ${member.name}`}
                >
                  <Phone className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#3f7abe] shrink-0" />
                  <span className="text-[10px]">{member.phone}</span>
                </a>
              </div>
            </div>
            
            <div className="mt-auto bg-slate-50/50 p-2.5 flex items-center justify-between border-t border-slate-50">
               <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">ID: {member._id.slice(-6).toUpperCase()}</span>
               <button 
                 onClick={(e) => { e.stopPropagation(); toggleBlockStatus(member._id, member.status); }}
                 className={`text-[8px] font-black uppercase tracking-widest hover:underline transition-all ${
                   member.status === 'active' ? 'text-red-500 hover:text-red-700' : 'text-emerald-500 hover:text-emerald-700'
                 }`}
               >
                 {member.status === 'active' ? 'Block' : 'Unblock'}
               </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-20 glass-card">
           <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
           <h2 className="text-xl font-bold text-slate-800">No consultants found</h2>
           <p className="text-slate-600 text-sm mt-1 font-bold uppercase tracking-widest">Adjust your search criteria</p>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-xl overflow-hidden my-auto animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 bg-[#3f7abe]/5 flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black text-[#3f7abe]">Add Consultant</h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Access Credentials</p>
               </div>
               <button onClick={() => { setShowAddForm(false); setShowPassword(false); }} className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Full Name *</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="input-field" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Email *</label>
                   <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="input-field" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Phone *</label>
                   <input type="text" name="phone" required value={formData.phone} onChange={handleInputChange} className="input-field" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Role *</label>
                    <select 
                      name="role" 
                      required 
                      value={formData.role} 
                      onChange={handleInputChange} 
                      className="input-field bg-white"
                    >
                      <option value="staff">Consultant</option>
                      <option value="telecaller">Telecaller Executive</option>
                    </select>
                 </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Temporary Password *</label>
                  <div className="relative group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      required 
                      value={formData.password} 
                      onChange={handleInputChange} 
                      className="input-field pr-12" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#3f7abe] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setShowAddForm(false); setShowPassword(false); }} className="flex-1 p-4 bg-slate-50 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary flex-[2] p-4 justify-center rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-[#3f7abe]/20">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Add'}
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
        type={modalConfig.type || 'danger'}
        confirmText={modalConfig.confirmText || 'Confirm'}
      />
    </div>
  );
};

export default ConsultantsPage;
