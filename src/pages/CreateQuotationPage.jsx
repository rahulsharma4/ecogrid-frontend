import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SearchableSelect from '../components/UI/SearchableSelect';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save, 
  Zap, 
  IndianRupee, 
  Info, 
  FileText,
  Calculator,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ChevronDown,
  CreditCard
} from 'lucide-react';

const CreateQuotationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    leadId: '',
    systemSize: '',
    solarPanels: '',
    inverter: '',
    structureType: 'Pre-fabricated HDGI Elevated',
    offering: 'ZenPro',
    gsmBased: 'Yes',
    cleaningFrequency: 'NO',
    floorHeight: 'G+0',
    inverterLocation: 'Ground',
    baseAmount: '',
    earlyBirdDiscount: '',
    additionalDiscount: '',
    gstPercentage: 8.9,
    centralSubsidy: '',
    stateSubsidy: '',
    terms: 'Once the commissioning is completed by MNRE, the subsidy amount will be directly transferred to the beneficiary\'s account.',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    loanDetails: {
      required: false,
      bankName: '',
      bankAddress: '',
      loanAmount: '',
      tenureMonths: '',
      interestRate: '',
      emiAmount: '',
      processingFees: '',
      downPayment: '',
      remarks: ''
    }
  });

  const [calculations, setCalculations] = useState({
    gstAmount: 0,
    netPrice: 0,
    netEffectivePrice: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/leads`, config);
        setLeads(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.token]);

  useEffect(() => {
    const base = Number(formData.baseAmount) || 0;
    const disc = (Number(formData.earlyBirdDiscount) || 0) + (Number(formData.additionalDiscount) || 0);
    const amountAfterDisc = Math.max(0, base - disc);
    const gst = (amountAfterDisc * (Number(formData.gstPercentage) || 0)) / 100;
    const net = amountAfterDisc + gst;
    const effective = net; // Subsidies no longer affect the final amount

    setCalculations({
      gstAmount: gst,
      netPrice: net,
      netEffectivePrice: effective
    });
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.leadId) return toast.error('Please select a lead');
    
    const loadingToast = toast.loading('Engineering your proposal...');
    setIsSubmitting(true);
    
    // Clean data for submission
    const submissionData = {
      ...formData,
      baseAmount: Number(formData.baseAmount) || 0,
      earlyBirdDiscount: Number(formData.earlyBirdDiscount) || 0,
      additionalDiscount: Number(formData.additionalDiscount) || 0,
      centralSubsidy: Number(formData.centralSubsidy) || 0,
      stateSubsidy: Number(formData.stateSubsidy) || 0,
      loanDetails: {
        ...formData.loanDetails,
        loanAmount: Number(formData.loanDetails.loanAmount) || 0,
        tenureMonths: Number(formData.loanDetails.tenureMonths) || 0,
        interestRate: Number(formData.loanDetails.interestRate) || 0,
        emiAmount: Number(formData.loanDetails.emiAmount) || 0,
        processingFees: Number(formData.loanDetails.processingFees) || 0,
        downPayment: Number(formData.loanDetails.downPayment) || 0,
      }
    };

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/quotations`, submissionData, config);
      toast.success('Proposal Launched Successfully!', { id: loadingToast });
      navigate('/dashboard/quotations');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message;
      toast.error('Launch Failed: ' + msg, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="w-8 h-8 text-[#3f7abe] animate-spin" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Waking up components...</p>
    </div>
  );

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/dashboard/quotations')} className="p-4 bg-white border border-slate-200 rounded-[1.25rem] shadow-sm hover:bg-slate-50 transition-all text-slate-500 group">
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-950 tracking-tighter uppercase leading-none mb-1">Technical Offer</h1>
            <p className="text-slate-500 font-bold text-sm">Configure project design & commercial terms</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Configuration */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section 1: Lead Selection */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#3f7abe]/10 flex items-center justify-center text-[#3f7abe]">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">Target Customer</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lead & Timeline</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                 <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Active Lead *</label>
                 <SearchableSelect
                   required
                   value={formData.leadId}
                   onChange={(val) => setFormData({...formData, leadId: val})}
                   options={leads.map(l => ({ value: l._id, label: `${l.name} (${l.phone})` }))}
                   placeholder="Choose a Lead..."
                   searchPlaceholder="Search leads by name or phone..."
                 />
               </div>

               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Offer Validity</label>
                  <input 
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                    className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#3f7abe] transition-all"
                  />
               </div>
            </div>

            {formData.leadId && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                {(() => {
                  const selectedLead = leads.find(l => l._id === formData.leadId);
                  if (!selectedLead) return null;
                  return (
                    <div className="bg-slate-50/80 border border-slate-100 rounded-[1.25rem] p-4 relative overflow-hidden group">
                       <div className="flex items-center justify-between gap-6 relative z-10">
                          {/* Left side: Identity */}
                          <div className="flex items-center gap-4 shrink-0">
                             <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-[#3f7abe] font-black text-sm overflow-hidden shrink-0">
                                {selectedLead.personalInfo?.profileImage ? (
                                  <img src={selectedLead.personalInfo.profileImage} alt={selectedLead.name} className="w-full h-full object-cover" />
                                ) : (
                                  selectedLead.name.charAt(0).toUpperCase()
                                )}
                             </div>
                             <div>
                                <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm leading-none mb-1">{selectedLead.name}</h4>
                                <span className="px-1.5 py-0.5 bg-white text-[8px] font-black text-slate-400 rounded-md border border-slate-100 uppercase tracking-widest">{selectedLead.status}</span>
                             </div>
                          </div>

                          {/* Divider */}
                          <div className="hidden md:block h-8 w-[1px] bg-slate-200"></div>

                          {/* Details Row */}
                          <div className="flex-1 flex items-center justify-between gap-4">
                             <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Contact</p>
                                <p className="text-[10px] font-bold text-slate-700">{selectedLead.phone}</p>
                             </div>
                             <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Capacity</p>
                                <p className="text-[10px] font-bold text-slate-700">{selectedLead.solarCapacity || 'N/A'}</p>
                             </div>
                             <div className="flex-1 max-w-[200px] hidden sm:block">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Address</p>
                                <p className="text-[10px] font-bold text-slate-700 truncate uppercase">{selectedLead.address}</p>
                             </div>
                          </div>

                          {/* Badges */}
                          <div className="flex items-center gap-2 shrink-0">
                             {selectedLead.personalInfo?.whatsappNumber && (
                               <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center" title="WhatsApp Active">
                                 <Zap className="w-3.5 h-3.5 fill-emerald-600" />
                               </div>
                             )}
                             {selectedLead.personalInfo?.aadhaarNumber && (
                               <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center" title="KYC Verified">
                                 <ShieldCheck className="w-3.5 h-3.5" />
                               </div>
                             )}
                          </div>
                       </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Section 2: Technical Configuration */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f6871e]/10 flex items-center justify-center text-[#f6871e]">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">Technical Specifications</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hardware & Engineering</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">System Size (kWp) *</label>
                  <input type="text" required value={formData.systemSize} onChange={e => setFormData({...formData, systemSize: e.target.value})} placeholder="e.g. 4.34 kWp" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all" />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Solar Panels *</label>
                  <input type="text" required value={formData.solarPanels} onChange={e => setFormData({...formData, solarPanels: e.target.value})} placeholder="e.g. ZS - Adani - 620 Wp" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all" />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Inverter *</label>
                  <input type="text" required value={formData.inverter} onChange={e => setFormData({...formData, inverter: e.target.value})} placeholder="e.g. Polycab - 5 kW (Single Phase)" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all" />
               </div>
               <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Structure Type</label>
                  <input type="text" value={formData.structureType} onChange={e => setFormData({...formData, structureType: e.target.value})} className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all" />
               </div>
               
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Offering</label>
                    <input type="text" value={formData.offering} onChange={e => setFormData({...formData, offering: e.target.value})} className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">GSM Based</label>
                    <div className="relative">
                       <select value={formData.gsmBased} onChange={e => setFormData({...formData, gsmBased: e.target.value})} className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all appearance-none cursor-pointer">
                         <option>Yes</option>
                         <option>No</option>
                       </select>
                       <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cleaning Freq</label>
                    <input type="text" value={formData.cleaningFrequency} onChange={e => setFormData({...formData, cleaningFrequency: e.target.value})} className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Floor Height</label>
                    <input type="text" value={formData.floorHeight} onChange={e => setFormData({...formData, floorHeight: e.target.value})} className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all" />
                  </div>
               </div>
            </div>
          </div>
          
          {/* Section 3: Financing & Loan Details */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8 mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg leading-none">Financing Options</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Loan & Bank Details</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.loanDetails.required}
                  onChange={e => setFormData({
                    ...formData, 
                    loanDetails: { ...formData.loanDetails, required: e.target.checked }
                  })}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ml-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Required</span>
              </label>
            </div>

            {formData.loanDetails.required && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-300">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bank Name</label>
                  <input type="text" value={formData.loanDetails.bankName} onChange={e => setFormData({...formData, loanDetails: {...formData.loanDetails, bankName: e.target.value}})} placeholder="e.g. State Bank of India" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bank Address</label>
                  <input type="text" value={formData.loanDetails.bankAddress} onChange={e => setFormData({...formData, loanDetails: {...formData.loanDetails, bankAddress: e.target.value}})} placeholder="Branch location" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Loan Amount (₹)</label>
                  <input type="number" value={formData.loanDetails.loanAmount} onChange={e => setFormData({...formData, loanDetails: {...formData.loanDetails, loanAmount: e.target.value}})} placeholder="0.00" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tenure (Months)</label>
                    <input type="number" value={formData.loanDetails.tenureMonths} onChange={e => setFormData({...formData, loanDetails: {...formData.loanDetails, tenureMonths: e.target.value}})} placeholder="e.g. 60" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Interest Rate (%)</label>
                    <input type="number" step="0.01" value={formData.loanDetails.interestRate} onChange={e => setFormData({...formData, loanDetails: {...formData.loanDetails, interestRate: e.target.value}})} placeholder="8.5" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">EMI Amount (₹)</label>
                  <input type="number" value={formData.loanDetails.emiAmount} onChange={e => setFormData({...formData, loanDetails: {...formData.loanDetails, emiAmount: e.target.value}})} placeholder="Monthly Payment" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Processing Fees (₹)</label>
                  <input type="number" value={formData.loanDetails.processingFees} onChange={e => setFormData({...formData, loanDetails: {...formData.loanDetails, processingFees: e.target.value}})} placeholder="Bank Charges" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Down Payment (₹)</label>
                  <input type="number" value={formData.loanDetails.downPayment} onChange={e => setFormData({...formData, loanDetails: {...formData.loanDetails, downPayment: e.target.value}})} placeholder="Paid to Bank" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Loan Remarks</label>
                  <input type="text" value={formData.loanDetails.remarks} onChange={e => setFormData({...formData, loanDetails: {...formData.loanDetails, remarks: e.target.value}})} placeholder="Any specific notes" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" />
                </div>
              </div>
            )}

            <div className="space-y-4 p-6 bg-[#f6871e]/5 rounded-[1.75rem] border border-[#f6871e]/10 mt-8">
              <p className="text-[10px] font-black text-[#f6871e] uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                 <Zap className="w-3 h-3 fill-[#f6871e]" /> Expected Subsidies (Reference Only)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Central Govt DBT</span>
                   <input type="number" placeholder="0" value={formData.centralSubsidy} onChange={e => setFormData({...formData, centralSubsidy: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-left font-bold text-slate-900 outline-none focus:bg-white focus:border-[#f6871e] transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">State (UPNEEDA)</span>
                   <input type="number" placeholder="0" value={formData.stateSubsidy} onChange={e => setFormData({...formData, stateSubsidy: e.target.value})} className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-left font-bold text-slate-900 outline-none focus:bg-white focus:border-[#f6871e] transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Calculations */}
        <div className="space-y-8">
           <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border-4 border-[#3f7abe]/5 space-y-8 sticky top-6">
              <div className="flex items-center gap-4">
                 <div className="p-4 bg-[#3f7abe] rounded-[1.5rem] shadow-lg shadow-[#3f7abe]/20">
                    <Calculator className="w-6 h-6 text-white" />
                 </div>
                 <div>
                    <h3 className="font-black uppercase tracking-tighter text-2xl text-slate-900 leading-none">Commercials</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Financial Analysis</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Base Amount (System Cost) *</label>
                    <div className="relative group">
                       <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 font-black">₹</div>
                       <input 
                        type="number" 
                        required 
                        placeholder="0.00"
                        value={formData.baseAmount} 
                        onChange={e => setFormData({...formData, baseAmount: e.target.value})} 
                        className="w-full pl-20 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.75rem] outline-none font-black text-2xl text-slate-900 focus:bg-white focus:border-[#3f7abe] transition-all placeholder:text-slate-300" 
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Early Bird Disc</label>
                       <input type="number" placeholder="0" value={formData.earlyBirdDiscount} onChange={e => setFormData({...formData, earlyBirdDiscount: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#3f7abe] transition-all" />
                    </div>
                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Add. Discount</label>
                       <input type="number" placeholder="0" value={formData.additionalDiscount} onChange={e => setFormData({...formData, additionalDiscount: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#3f7abe] transition-all" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[1.75rem] border border-slate-100">
                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-[#f6871e] uppercase tracking-widest ml-1">GST (%)</label>
                       <input type="number" step="0.1" value={formData.gstPercentage} onChange={e => setFormData({...formData, gstPercentage: e.target.value})} className="w-full px-4 py-3 bg-white border-2 border-[#f6871e]/20 rounded-xl outline-none font-black text-lg text-[#f6871e] focus:border-[#f6871e] transition-all" />
                    </div>
                    <div className="flex flex-col justify-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">GST Tax Amount</p>
                       <p className="font-black text-xl text-slate-900">₹ {calculations.gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                    </div>
                 </div>

                 <div className="py-6 border-y-2 border-slate-50">
                    <div className="flex justify-between items-center">
                       <div className="space-y-0.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Quotation Value</span>
                          <p className="text-xs font-bold text-slate-500 italic">(Inclusive of all Taxes)</p>
                       </div>
                       <span className="font-black text-2xl text-[#3f7abe]">₹ {calculations.netPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                 </div>

                 <div className="pt-8 mt-4">
                    <div className="bg-slate-950 p-8 rounded-[2rem] shadow-xl shadow-slate-200 group hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-[#3f7abe]/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                       <div className="relative z-10">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Final Effective Price</p>
                          <p className="text-5xl font-black tracking-tighter text-white">₹ {calculations.netEffectivePrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                          <p className="text-[9px] font-bold text-[#f6871e] uppercase tracking-widest mt-4 flex items-center gap-2">
                             <CheckCircle2 className="w-3 h-3" /> Guaranteed Solar Savings
                          </p>
                       </div>
                    </div>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-[#3f7abe] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-[#3f7abe]/40 hover:bg-[#33629c] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3 mt-8 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <Save className="w-5 h-5" />
                    Launch Proposal
                  </>
                )}
              </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default CreateQuotationPage;
