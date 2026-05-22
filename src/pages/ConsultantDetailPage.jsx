import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  ChevronLeft, 
  Loader2, 
  Zap, 
  Clock, 
  MapPin,
  Activity,
  Search,
  CheckCircle2,
  AlertCircle
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
  'No Answer': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Call Back': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'Interested': 'bg-purple-50 text-purple-700 border border-purple-200',
  'Not Interested': 'bg-rose-50 text-rose-700 border border-rose-200',
  'Converted': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
};

const ConsultantDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/staff/${id}`, config);
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, user.token]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Loader2 className="w-10 h-10 text-[#3f7abe] animate-spin" />
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Loading Consultant Intel...</p>
    </div>
  );

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <AlertCircle className="w-16 h-16 text-red-500 opacity-20" />
      <h2 className="text-2xl font-black text-slate-900">Consultant Not Found</h2>
      <button onClick={() => navigate(-1)} className="btn-secondary">Go Back</button>
    </div>
  );

  const { staff, leads = [], contacts = [] } = data;
  const isTelecaller = staff.role === 'telecaller';

  // Stats calculation
  const completedLeads = isTelecaller
    ? contacts.filter(c => c.status === 'Converted').length
    : leads.filter(l => l.status === 'Completed').length;

  const activeLeads = isTelecaller
    ? contacts.filter(c => c.status === 'Call Back').length
    : leads.filter(l => l.status !== 'Completed' && l.status !== 'Cancelled').length;

  const totalAssignments = isTelecaller ? contacts.length : leads.length;

  const filteredItems = isTelecaller
    ? contacts.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : leads.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm) ||
        l.status.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header & Back Navigation */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all active:scale-95 group"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Consultant Dossier</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Consultant: {staff.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-[#3f7abe] h-32 relative">
               <div className="absolute -bottom-12 left-8">
                  <div className="w-24 h-24 rounded-[2rem] bg-white p-1.5 shadow-xl">
                     <div className="w-full h-full rounded-[1.75rem] bg-slate-50 flex items-center justify-center text-3xl font-black text-[#3f7abe] border border-slate-100">
                        {staff.name.charAt(0).toUpperCase()}
                     </div>
                  </div>
               </div>
            </div>
            <div className="p-8 pt-16">
               <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-black text-slate-900 truncate uppercase">{staff.name}</h2>
                  <Shield className="w-5 h-5 text-[#3f7abe]" />
                  <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase border w-fit ${
                     staff.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                   }`}>
                     {staff.status}
                  </span>
               </div>
               <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{staff.role === 'staff' ? 'Consultant' : staff.role === 'telecaller' ? 'Telecaller' : staff.role} Operative</p>
               
               <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-white hover:shadow-lg group">
                     <Mail className="w-5 h-5 text-slate-400 group-hover:text-[#3f7abe]" />
                     <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Email Protocol</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{staff.email}</p>
                     </div>
                  </div>
                   <a
                     href={`tel:${staff.phone}`}
                     className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-white hover:shadow-lg hover:border-emerald-200 group"
                     title={`Call ${staff.name}`}
                   >
                      <Phone className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                      <div className="min-w-0">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Direct Comms</p>
                         <p className="text-sm font-bold text-slate-700">{staff.phone}</p>
                      </div>
                   </a>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-white hover:shadow-lg group">
                     <Calendar className="w-5 h-5 text-slate-400 group-hover:text-orange-500" />
                     <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Commissioned On</p>
                        <p className="text-sm font-bold text-slate-700">{new Date(staff.createdAt).toLocaleDateString()}</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Productivity Stats */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3f7abe]" /> Output Metrics
             </h3>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                   <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                     {isTelecaller ? 'Converted' : 'Successful'}
                   </p>
                   <p className="text-3xl font-black text-emerald-700">{completedLeads}</p>
                </div>
                <div className="p-5 bg-[#3f7abe]/5 rounded-3xl border border-[#3f7abe]/20">
                   <p className="text-[9px] font-black text-[#3f7abe] uppercase tracking-widest mb-1">
                     {isTelecaller ? 'Callbacks' : 'In Pipeline'}
                   </p>
                   <p className="text-3xl font-black text-[#3f7abe]">{activeLeads}</p>
                </div>
             </div>
             <div className="mt-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Assignments</p>
                <p className="text-3xl font-black text-slate-900">{totalAssignments}</p>
             </div>
          </div>
        </div>

        {/* Assignments Table/List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 min-h-[600px] flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Assigned Operations</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">
                      {isTelecaller ? 'Active assigned calls & logs' : 'Active deployments & client history'}
                    </p>
                 </div>
                 <div className="relative group w-full sm:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#3f7abe] transition-colors" />
                    <input 
                      type="text" 
                      placeholder={isTelecaller ? "Filter contacts..." : "Filter leads..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-6 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all font-bold text-xs uppercase tracking-widest"
                    />
                 </div>
              </div>

              <div className="flex-1 space-y-4">
                 {filteredItems.length > 0 ? (
                   filteredItems.map((item) => (
                     <div 
                       key={item._id} 
                       onClick={() => navigate(isTelecaller ? `/dashboard/contacts/${item._id}` : `/dashboard/leads`)}
                       className="p-6 bg-white rounded-3xl border border-slate-100 hover:border-[#3f7abe]/20 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                     >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#3f7abe] group-hover:text-white transition-all">
                                 {isTelecaller ? <Phone className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                              </div>
                              <div>
                                 <h4 className="font-black text-slate-900 uppercase tracking-tight group-hover:text-[#3f7abe] transition-colors">{item.name}</h4>
                                 <div className="flex items-center gap-3 mt-1.5">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                       <MapPin className="w-3 h-3" /> {item.address}
                                    </div>
                                    {isTelecaller && item.phone && (
                                       <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l pl-3">
                                          <Phone className="w-3 h-3" /> {item.phone}
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4 self-end sm:self-center">
                              <div className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest shadow-sm ${statusColors[item.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                 {item.status}
                              </div>
                              <div className="p-2 rounded-xl bg-slate-50 text-slate-300 group-hover:text-[#3f7abe] group-hover:bg-[#3f7abe]/5 transition-all">
                                 <Clock className="w-4 h-4" />
                              </div>
                           </div>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="flex flex-col items-center justify-center h-96 opacity-30 text-center">
                      <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-6">
                         <Search className="w-8 h-8" />
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.3em]">No assignments detected</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantDetailPage;
