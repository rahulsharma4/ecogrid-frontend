import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Loader2,
  Calendar,
  Zap,
  CreditCard,
  Target,
  ArrowRight,
  Activity,
  DollarSign
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const DashboardStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard/stats`, config);
        setData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user.token]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="w-10 h-10 text-[#3f7abe] animate-spin" />
      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Compiling Analytics...</p>
    </div>
  );

  const cards = [
    { 
      title: 'Gross Revenue', 
      value: data?.totalRevenue ? `₹${(data.totalRevenue / 100000).toFixed(2)}L` : '₹0', 
      icon: CreditCard, 
      color: 'text-emerald-700', 
      bg: 'bg-emerald-50', 
      path: '/dashboard/payments',
      desc: 'Lifetime collections'
    },
    { 
      title: 'Total Pipeline', 
      value: data?.totalLeads || 0, 
      icon: Target, 
      color: 'text-[#3f7abe]', 
      bg: 'bg-[#3f7abe]/5', 
      path: '/dashboard/leads',
      desc: 'Active lead flow'
    },
    { 
      title: 'Team Strength', 
      value: data?.staffCount || 0, 
      icon: Users, 
      color: 'text-orange-700', 
      bg: 'bg-orange-50', 
      path: '/dashboard/staff-management',
      desc: 'Field operatives'
    },
    { 
      title: 'Pending Action', 
      value: data?.pendingLeads || 0, 
      icon: Clock, 
      color: 'text-purple-700', 
      bg: 'bg-purple-50', 
      path: '/dashboard/leads',
      desc: 'Awaiting touchpoint'
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
      
      {/* Ultra-Compact KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((card, i) => (
          <div 
            key={i} 
            onClick={() => navigate(card.path)}
            className="bg-white p-3 lg:p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group active:scale-95 flex items-center gap-3"
          >
             <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
               <card.icon className={`w-5 h-5 ${card.color}`} />
             </div>
             <div className="min-w-0">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{card.title}</p>
                <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mt-0.5">{card.value}</h2>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Growth Analytics Chart - Compact */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Growth Velocity</h3>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Monthly lead trajectory</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shadow-inner">
               <TrendingUp className="w-3 h-3 text-[#3f7abe]" />
               <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Hub</span>
            </div>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.chartData || []}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3f7abe" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3f7abe" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 11, fontWeight: 800}}
                  dy={20}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 11, fontWeight: 800}}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px'}}
                  itemStyle={{fontWeight: 900, color: '#3f7abe', textTransform: 'uppercase', fontSize: '10px'}}
                  cursor={{stroke: '#3f7abe', strokeWidth: 2, strokeDasharray: '5 5'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#3f7abe" 
                  strokeWidth={6}
                  fillOpacity={1} 
                  fill="url(#colorLeads)" 
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Distribution Pie Chart - Side by Side */}
        <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <div className="mb-4 text-center">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-tighter">Pipeline</h3>
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Status Breakdown</p>
              </div>
              
              <div className="h-32 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={data?.statusDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={45}
                          paddingAngle={5}
                          dataKey="value"
                       >
                          {(data?.statusDistribution || []).map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={['#3f7abe', '#f6871e', '#10b981', '#7c3aed', '#ec4899', '#6366f1'][index % 6]} />
                          ))}
                       </Pie>
                       <Tooltip 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', padding: '8px'}}
                          itemStyle={{fontWeight: 900, fontSize: '8px', textTransform: 'uppercase'}}
                       />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[7px] font-black text-slate-400 uppercase">Total</span>
                    <span className="text-sm font-black text-slate-900">{data?.totalLeads || 0}</span>
                 </div>
              </div>

              <div className="mt-4 space-y-1.5 max-h-20 overflow-y-auto custom-scrollbar pr-1">
                 {(data?.statusDistribution || []).map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-[8px] font-black">
                       <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ['#3f7abe', '#f6871e', '#10b981', '#7c3aed', '#ec4899', '#6366f1'][index % 6] }}></div>
                          <span className="text-slate-500 uppercase truncate">{entry.name}</span>
                       </div>
                       <span className="text-slate-900">{entry.value}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Compact Pulse Feed */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-tighter">Pulse</h3>
                 <Activity className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto max-h-48 pr-2 custom-scrollbar">
                 {data?.recentLeads?.length > 0 ? (
                   data.recentLeads.slice(0, 4).map((lead) => (
                     <div key={lead._id} className="flex gap-3 group cursor-pointer" onClick={() => navigate('/dashboard/leads')}>
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#3f7abe] group-hover:text-white transition-all shrink-0">
                           <Zap className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] text-slate-900 font-black group-hover:text-[#3f7abe] transition-colors truncate uppercase leading-tight">
                             {lead.name}
                           </p>
                           <p className="text-[8px] text-slate-400 font-bold mt-0.5 truncate uppercase">
                             By {lead.assignedTo?.name || 'Unassigned'}
                           </p>
                        </div>
                     </div>
                   ))
                 ) : (
                   <p className="text-[8px] font-black text-slate-300 uppercase text-center mt-10">Static State</p>
                 )}
              </div>
              <button 
                onClick={() => navigate('/dashboard/leads')}
                className="mt-4 w-full py-2.5 bg-[#3f7abe] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-[#3f7abe]/20 hover:bg-[#33629c] transition-all"
              >
                Operations
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
