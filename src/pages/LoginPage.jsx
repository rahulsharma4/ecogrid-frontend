import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import logo from '../assets/Logo.jpeg';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, Zap, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Authenticating security pin...');
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Welcome back, ' + (result.user?.name?.split(' ')[0] || 'User'), { id: loadingToast });
      navigate('/dashboard/stats');
    } else {
      setError(result.message);
      toast.error(result.message, { id: loadingToast });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 lg:p-8 font-sans">
      {/* Decorative Elements - Hidden on small mobile */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3f7abe] via-[#f6871e] to-[#3f7abe]"></div>
      
      <div className="w-full max-w-[1100px] bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex flex-col lg:flex-row overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Left Side: Visual/Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#3f7abe] p-16 flex-col justify-between relative overflow-hidden">
           {/* Abstract shapes */}
           <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-60 h-60 bg-[#f6871e]/20 rounded-full blur-3xl"></div>
           
           <div className="relative z-10">
              <div className="bg-white p-4 rounded-2xl inline-block shadow-xl">
                 <img src={logo} alt="Logo" className="h-12 w-auto" />
              </div>
              <h1 className="text-5xl font-black text-white mt-8 tracking-tighter leading-tight">
                 Powering the<br/><span className="text-[#f6871e]">Solar Revolution.</span>
              </h1>
              <p className="text-white/70 text-lg mt-6 font-medium max-w-sm">
                 Access the EcoGrid Command Center to manage your sustainable energy infrastructure.
              </p>
           </div>

           <div className="relative z-10 flex items-center gap-8 mt-auto">
              <div className="flex flex-col">
                 <span className="text-3xl font-bold text-white tracking-tighter">500+</span>
                 <span className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">Installations</span>
              </div>
              <div className="h-10 w-[1px] bg-white/20"></div>
              <div className="flex flex-col">
                 <span className="text-3xl font-bold text-white tracking-tighter">98%</span>
                 <span className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">Efficiency</span>
              </div>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center bg-white">
          <div className="lg:hidden flex justify-center mb-8">
             <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-sm">
                <img src={logo} alt="Logo" className="h-10 w-auto" />
             </div>
          </div>

          <div className="max-w-md mx-auto w-full">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
              <p className="text-slate-500 font-medium mt-2">Please enter your details to sign in</p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                   <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs font-bold text-red-600 uppercase tracking-wide">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                   <Mail className="w-3 h-3" /> Email Address
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all font-medium text-slate-900 group-hover:bg-slate-100/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Lock className="w-3 h-3" /> Security Pin
                  </label>
                  <a href="#" className="text-[10px] font-bold text-[#3f7abe] uppercase tracking-widest hover:underline">Forgot?</a>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#3f7abe] transition-all font-medium text-slate-900 group-hover:bg-slate-100/50 pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-[#3f7abe] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3f7abe] text-white py-5 justify-center rounded-[1.25rem] text-sm font-bold flex items-center gap-3 shadow-xl shadow-[#3f7abe]/20 group active:scale-95 transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Secure Access
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-12 text-center">
              <p className="text-sm text-slate-400 font-medium">
                Don't have an operator account?{' '}
                <Link to="/register" className="text-[#f6871e] font-bold hover:underline">
                  Request Access
                </Link>
              </p>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-6 opacity-40">
               <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">SSL Encrypted</span>
               </div>
               <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Fast Sync</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
