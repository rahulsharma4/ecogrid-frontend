import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/Logo.jpeg';
import { toast } from 'react-hot-toast';
import { UserPlus, Mail, Lock, Phone, User, Loader2, ArrowRight, ShieldCheck, Zap, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Sending registration request...');
    setLoading(true);
    setError('');
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, formData);
      toast.success('Registration Request Received!', { id: loadingToast });
      setSuccess(true);
      // Wait for 3 seconds to show success message before navigating
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      toast.error(msg, { id: loadingToast });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 lg:p-8 font-sans">
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3f7abe] via-[#f6871e] to-[#3f7abe]"></div>
      
      <div className="w-full max-w-[1100px] bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 flex flex-col lg:flex-row-reverse overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Right Side: Visual/Branding (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#f6871e] p-16 flex-col justify-between relative overflow-hidden">
           <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-[#3f7abe]/20 rounded-full blur-3xl"></div>
           
           <div className="relative z-10">
              <div className="bg-white p-4 rounded-2xl inline-block shadow-xl">
                 <img src={logo} alt="Logo" className="h-12 w-auto" />
              </div>
              <h1 className="text-5xl font-black text-white mt-8 tracking-tighter leading-tight">
                 Join the<br/><span className="text-[#3f7abe]">EcoGrid Team.</span>
              </h1>
              <p className="text-white/70 text-lg mt-6 font-medium max-w-sm">
                 Create your operator account to start managing sustainable energy projects.
              </p>
           </div>

           <div className="relative z-10 flex items-center gap-8 mt-auto">
              <div className="flex flex-col">
                 <span className="text-3xl font-bold text-white tracking-tighter">Secure</span>
                 <span className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">Encrypted Data</span>
              </div>
              <div className="h-10 w-[1px] bg-white/20"></div>
              <div className="flex flex-col">
                 <span className="text-3xl font-bold text-white tracking-tighter">Native</span>
                 <span className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">App Experience</span>
              </div>
           </div>
        </div>

        {/* Left Side: Form or Success */}
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center bg-white relative">
          <div className="lg:hidden flex justify-center mb-8">
             <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-sm">
                <img src={logo} alt="Logo" className="h-10 w-auto" />
             </div>
          </div>

          <div className="max-w-md mx-auto w-full">
            {success ? (
              <div className="text-center animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Request Sent!</h2>
                <p className="text-slate-600 font-bold leading-relaxed mb-8">
                  Your registration is successful. You will be redirected to the sign-in page shortly.
                </p>
                <div className="flex items-center justify-center gap-2 text-[#3f7abe] font-black text-xs uppercase tracking-widest">
                   <Loader2 className="w-4 h-4 animate-spin" />
                   Redirecting...
                </div>
              </div>
            ) : (
              <>
                <div className="mb-10 text-center lg:text-left">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Request Access</h2>
                  <p className="text-slate-500 font-medium mt-2">Fill in your details for account review</p>
                </div>

                {error && (
                  <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                       <ShieldCheck className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wide">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <User className="w-3 h-3" /> Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full px-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#f6871e] transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Mail className="w-3 h-3" /> Email
                       </label>
                       <input
                         type="email"
                         name="email"
                         required
                         value={formData.email}
                         onChange={handleChange}
                         placeholder="john@example.com"
                         className="w-full px-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#f6871e] transition-all font-medium text-slate-900 text-sm"
                       />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Phone className="w-3 h-3" /> Phone
                       </label>
                       <input
                         type="text"
                         name="phone"
                         required
                         value={formData.phone}
                         onChange={handleChange}
                         placeholder="95557 XXXXX"
                         className="w-full px-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#f6871e] transition-all font-medium text-slate-900 text-sm"
                       />
                     </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                       <Lock className="w-3 h-3" /> Create Password
                    </label>
                    <div className="relative group">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full px-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#f6871e] transition-all font-medium text-slate-900 pr-14"
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

                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#f6871e] text-white py-5 justify-center rounded-[1.25rem] text-sm font-bold flex items-center gap-3 shadow-xl shadow-[#f6871e]/20 group active:scale-95 transition-all"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Register Account
                          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-10 text-center">
                  <p className="text-sm text-slate-400 font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#3f7abe] font-bold hover:underline">
                      Sign In
                    </Link>
                  </p>
                </div>
              </>
            )}
            
            <div className="mt-10 flex items-center justify-center gap-6 opacity-40">
               <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Secure Audit</span>
               </div>
               <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Instant Setup</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
