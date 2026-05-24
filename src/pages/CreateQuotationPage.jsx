import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import SearchableSelect from '../components/UI/SearchableSelect';
import { useNavigate, useParams } from 'react-router-dom';
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

const calculateEmi = (principal, annualRate, tenureMonths) => {
  const p = Number(principal) || 0;
  const rate = Number(annualRate) || 0;
  const n = Number(tenureMonths) || 0;

  if (p <= 0 || n <= 0) return '';
  if (rate <= 0) return Math.round(p / n).toString();

  const monthlyRate = rate / 12 / 100;
  const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  return Math.round(emi).toString();
};

const CreateQuotationPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedSpecs, setShowAdvancedSpecs] = useState(false);

  const [formData, setFormData] = useState({
    leadId: '',
    systemSize: '',
    solarPanels: '',
    solarPanelsMake: 'Adani/Luminous',
    solarPanelsQty: 'As per capacity',
    inverter: '',
    inverterMake: 'Solis',
    inverterQty: '1 Unit',
    structureType: 'Pre-fabricated HDGI Elevated',
    structureMake: 'Approved Make',
    structureQty: 'For panels',
    acdbDetails: 'For Safe AC Distribution, IP65',
    acdbMake: 'Polycab',
    acdbQty: '1 Unit',
    dcdbDetails: 'For Safe DC Distribution, IP65',
    dcdbMake: 'Polycab',
    dcdbQty: '1 Unit',
    earthingDetails: 'Standard earthing for electrical safety',
    earthingMake: 'True Power',
    earthingQty: '3 Unit',
    wiringDetails: 'For safe and secure wiring',
    wiringMake: '',
    wiringQty: 'As per Requirement',
    cablesDetails: 'Cu wire 4mm',
    cablesMake: 'Polycab',
    cablesQty: '1 Set',
    lightningDetails: 'Safely grounds lighting, protecting structure and equipment.',
    lightningMake: 'Approved Make',
    lightningQty: '1 Set',
    installationDetails: 'Complete Installation & Setup',
    installationMake: '',
    installationQty: 'Each',
    offering: 'EcoGrid',
    gsmBased: 'Yes',
    cleaningFrequency: 'NO',
    floorHeight: 'G+0',
    inverterLocation: 'Ground',
    inverterHybrid: 'No',
    battery: 'No',
    batteryRemark: '',
    baseAmount: '',
    earlyBirdDiscount: '',
    additionalDiscount: '',
    gstPercentage: 8.9,
    includeGST: true,
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
        const leadsRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/leads`, config);
        setLeads(leadsRes.data);
        
        if (id) {
          const quoteRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/quotations/${id}`, config);
          const found = quoteRes.data;
          if (found) {
            setFormData({
              leadId: found.lead?._id || found.lead || '',
              systemSize: found.systemSize || '',
              solarPanels: found.solarPanels || '',
              solarPanelsMake: found.solarPanelsMake || 'Adani/Luminous',
              solarPanelsQty: found.solarPanelsQty || 'As per capacity',
              inverter: found.inverter || '',
              inverterMake: found.inverterMake || 'Solis',
              inverterQty: found.inverterQty || '1 Unit',
              structureType: found.structureType || 'Pre-fabricated HDGI Elevated',
              structureMake: found.structureMake || 'Approved Make',
              structureQty: found.structureQty || 'For panels',
              acdbDetails: found.acdbDetails || 'For Safe AC Distribution, IP65',
              acdbMake: found.acdbMake || 'Polycab',
              acdbQty: found.acdbQty || '1 Unit',
              dcdbDetails: found.dcdbDetails || 'For Safe DC Distribution, IP65',
              dcdbMake: found.dcdbMake || 'Polycab',
              dcdbQty: found.dcdbQty || '1 Unit',
              earthingDetails: found.earthingDetails || 'Standard earthing for electrical safety',
              earthingMake: found.earthingMake || 'True Power',
              earthingQty: found.earthingQty || '3 Unit',
              wiringDetails: found.wiringDetails || 'For safe and secure wiring',
              wiringMake: found.wiringMake || '',
              wiringQty: found.wiringQty || 'As per Requirement',
              cablesDetails: found.cablesDetails || 'Cu wire 4mm',
              cablesMake: found.cablesMake || 'Polycab',
              cablesQty: found.cablesQty || '1 Set',
              lightningDetails: found.lightningDetails || 'Safely grounds lighting, protecting structure and equipment.',
              lightningMake: found.lightningMake || 'Approved Make',
              lightningQty: found.lightningQty || '1 Set',
              installationDetails: found.installationDetails || 'Complete Installation & Setup',
              installationMake: found.installationMake || '',
              installationQty: found.installationQty || 'Each',
              offering: found.offering || 'EcoGrid',
              gsmBased: found.gsmBased || 'Yes',
              cleaningFrequency: found.cleaningFrequency || 'NO',
              floorHeight: found.floorHeight || 'G+0',
              inverterLocation: found.inverterLocation || 'Ground',
              inverterHybrid: found.inverterHybrid || 'No',
              battery: found.battery || 'No',
              batteryRemark: found.batteryRemark || '',
              baseAmount: found.baseAmount || '',
              earlyBirdDiscount: found.earlyBirdDiscount || '',
              additionalDiscount: found.additionalDiscount || '',
              gstPercentage: found.gstPercentage || 8.9,
              includeGST: !found.isGstInclusive,
              centralSubsidy: found.centralSubsidy || '',
              stateSubsidy: found.stateSubsidy || '',
              terms: found.terms || '',
              validUntil: found.validUntil ? new Date(found.validUntil).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              loanDetails: {
                required: found.loanDetails?.required || false,
                bankName: found.loanDetails?.bankName || '',
                bankAddress: found.loanDetails?.bankAddress || '',
                loanAmount: found.loanDetails?.loanAmount || '',
                tenureMonths: found.loanDetails?.tenureMonths || '',
                interestRate: found.loanDetails?.interestRate || '',
                emiAmount: found.loanDetails?.emiAmount || '',
                processingFees: found.loanDetails?.processingFees || '',
                downPayment: found.loanDetails?.downPayment || '',
                remarks: found.loanDetails?.remarks || ''
              }
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user.token]);

  useEffect(() => {
    const base = Number(formData.baseAmount) || 0;
    const disc = (Number(formData.earlyBirdDiscount) || 0) + (Number(formData.additionalDiscount) || 0);
    const amountAfterDisc = Math.max(0, base - disc);

    let gst = 0;
    let net = 0;
    if (!formData.includeGST) {
      gst = (amountAfterDisc * 8.9) / 108.9;
      net = amountAfterDisc;
    } else {
      const gstPercentage = Number(formData.gstPercentage) || 0;
      gst = (amountAfterDisc * gstPercentage) / 100;
      net = amountAfterDisc + gst;
    }
    const centralSub = Number(formData.centralSubsidy) || 0;
    const stateSub = Number(formData.stateSubsidy) || 0;
    const effective = Math.max(0, net - centralSub - stateSub);

    setCalculations({
      gstAmount: gst,
      netPrice: net,
      netEffectivePrice: effective
    });
  }, [
    formData.baseAmount,
    formData.earlyBirdDiscount,
    formData.additionalDiscount,
    formData.includeGST,
    formData.gstPercentage,
    formData.centralSubsidy,
    formData.stateSubsidy
  ]);

  // Recalculate Down Payment when Net Price changes
  useEffect(() => {
    if (formData.loanDetails.required) {
      const loanAmt = Number(formData.loanDetails.loanAmount) || 0;
      const netVal = calculations.netPrice || 0;
      if (loanAmt > 0 && netVal > 0) {
        const calculatedDownPayment = Math.max(0, Math.round(netVal - loanAmt)).toString();
        if (calculatedDownPayment !== formData.loanDetails.downPayment) {
          setFormData(prev => ({
            ...prev,
            loanDetails: {
              ...prev.loanDetails,
              downPayment: calculatedDownPayment
            }
          }));
        }
      }
    }
  }, [calculations.netPrice, formData.loanDetails.required]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.leadId) return toast.error('Please select a lead');

    const loadingToast = toast.loading('Engineering your proposal...');
    setIsSubmitting(true);

    // Clean data for submission
    const submissionData = {
      ...formData,
      isGstInclusive: !formData.includeGST,
      gstPercentage: formData.includeGST ? (Number(formData.gstPercentage) || 0) : 8.9,
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
      if (id) {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/quotations/${id}`, submissionData, config);
        toast.success('Proposal Updated Successfully!', { id: loadingToast });
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/quotations`, submissionData, config);
        toast.success('Proposal Launched Successfully!', { id: loadingToast });
      }
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
            <h1 className="text-3xl font-black text-slate-950 tracking-tighter uppercase leading-none mb-1">{id ? 'Edit Proposal' : 'Technical Offer'}</h1>
            <p className="text-slate-500 font-bold text-sm">{id ? 'Update project design & commercial terms for proposal' : 'Configure project design & commercial terms'}</p>
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
                  onChange={(val) => setFormData({ ...formData, leadId: val })}
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
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
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
                <input type="text" required value={formData.systemSize} onChange={e => setFormData({ ...formData, systemSize: e.target.value })} placeholder="e.g. 4.34 kWp" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Solar Panels *</label>
                <input type="text" required value={formData.solarPanels} onChange={e => setFormData({ ...formData, solarPanels: e.target.value })} placeholder="e.g. EG - Adani - 620 Wp" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all" />
              </div>
              <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-[#3f7abe] uppercase tracking-widest ml-1">Inverter Details *</label>
                  <input type="text" required value={formData.inverter} onChange={e => setFormData({ ...formData, inverter: e.target.value })} placeholder="e.g. Polycab - 5 kW (Single Phase)" className="w-full px-6 py-4.5 bg-white border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:border-[#f6871e] transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[#3f7abe] uppercase tracking-widest ml-1">Inverter Hybrid?</label>
                    <div className="relative">
                      <select value={formData.inverterHybrid} onChange={e => setFormData({ ...formData, inverterHybrid: e.target.value })} className="w-full px-5 py-3.5 bg-white border-2 border-transparent rounded-[1.25rem] outline-none font-bold text-slate-900 focus:border-[#f6871e] transition-all appearance-none cursor-pointer text-sm">
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-[#3f7abe] uppercase tracking-widest ml-1">Battery Option</label>
                    <div className="relative">
                      <select value={formData.battery} onChange={e => setFormData({ ...formData, battery: e.target.value })} className="w-full px-5 py-3.5 bg-white border-2 border-transparent rounded-[1.25rem] outline-none font-bold text-slate-900 focus:border-[#f6871e] transition-all appearance-none cursor-pointer text-sm">
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-[#3f7abe] uppercase tracking-widest ml-1">Battery Remark / Capacity</label>
                  <input type="text" value={formData.batteryRemark} onChange={e => setFormData({ ...formData, batteryRemark: e.target.value })} placeholder={formData.battery === 'Yes' ? "e.g. 5kW Battery Pack" : "No battery required"} disabled={formData.battery !== 'Yes'} className="w-full px-6 py-4 bg-white border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:border-[#f6871e] transition-all disabled:opacity-50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Structure Type</label>
                <input type="text" value={formData.structureType} onChange={e => setFormData({ ...formData, structureType: e.target.value })} className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Offering</label>
                  <input type="text" value={formData.offering} onChange={e => setFormData({ ...formData, offering: e.target.value })} className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">GSM Based</label>
                  <div className="relative">
                    <select value={formData.gsmBased} onChange={e => setFormData({ ...formData, gsmBased: e.target.value })} className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all appearance-none cursor-pointer">
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
                  <input type="text" value={formData.cleaningFrequency} onChange={e => setFormData({ ...formData, cleaningFrequency: e.target.value })} className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Floor Height</label>
                  <input type="text" value={formData.floorHeight} onChange={e => setFormData({ ...formData, floorHeight: e.target.value })} className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all" />
                </div>
              </div>



              {/* Advanced Component Specifications Accordion */}
              <div className="col-span-1 md:col-span-2 space-y-6 pt-6 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSpecs(!showAdvancedSpecs)}
                  className="w-full flex items-center justify-between py-4 px-6 bg-slate-50 hover:bg-slate-100/85 rounded-[1.25rem] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-[#f6871e]" />
                    <span className="font-black text-slate-800 uppercase tracking-widest text-xs">Advanced Component Specs (Makes & Qty)</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${showAdvancedSpecs ? 'rotate-180' : ''}`} />
                </button>

                {showAdvancedSpecs && (
                  <div className="space-y-8 animate-in zoom-in-95 duration-200 p-2">

                    {/* Category 1: Primary System Components */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pb-1 border-b border-slate-100">1. Primary System Components</h4>

                      {/* Solar Panels Make & Qty */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Solar Panels Make / Brand</label>
                          <input
                            type="text"
                            list="solarBrands"
                            value={formData.solarPanelsMake}
                            onChange={e => setFormData({ ...formData, solarPanelsMake: e.target.value })}
                            placeholder="e.g. Adani/Luminous"
                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-[1.25rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Solar Panels Quantity</label>
                          <input
                            type="text"
                            value={formData.solarPanelsQty}
                            onChange={e => setFormData({ ...formData, solarPanelsQty: e.target.value })}
                            placeholder="e.g. As per capacity"
                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-[1.25rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Inverter Make & Qty */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Inverter Make / Brand</label>
                          <input
                            type="text"
                            list="inverterBrands"
                            value={formData.inverterMake}
                            onChange={e => setFormData({ ...formData, inverterMake: e.target.value })}
                            placeholder="e.g. Solis"
                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-[1.25rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Inverter Quantity</label>
                          <input
                            type="text"
                            value={formData.inverterQty}
                            onChange={e => setFormData({ ...formData, inverterQty: e.target.value })}
                            placeholder="e.g. 1 Unit"
                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-[1.25rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Mounting Structure Make & Qty */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Structure Make / Brand</label>
                          <input
                            type="text"
                            list="structureBrands"
                            value={formData.structureMake}
                            onChange={e => setFormData({ ...formData, structureMake: e.target.value })}
                            placeholder="e.g. Approved Make"
                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-[1.25rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Structure Quantity</label>
                          <input
                            type="text"
                            value={formData.structureQty}
                            onChange={e => setFormData({ ...formData, structureQty: e.target.value })}
                            placeholder="e.g. For panels"
                            className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent rounded-[1.25rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category 2: Distribution & Protection */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pb-1 border-b border-slate-100">2. Distribution & Protection</h4>

                      {/* ACDB */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ACDB (AC Distribution Box)</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={formData.acdbDetails}
                            onChange={e => setFormData({ ...formData, acdbDetails: e.target.value })}
                            placeholder="Details (e.g. For Safe AC Distribution, IP65)"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                          <input
                            type="text"
                            list="acdbBrands"
                            value={formData.acdbMake}
                            onChange={e => setFormData({ ...formData, acdbMake: e.target.value })}
                            placeholder="Make (e.g. Polycab)"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                          <input
                            type="text"
                            value={formData.acdbQty}
                            onChange={e => setFormData({ ...formData, acdbQty: e.target.value })}
                            placeholder="Qty (e.g. 1 Unit)"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                        </div>
                      </div>

                      {/* DCDB */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">DCDB (DC Distribution Box)</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={formData.dcdbDetails}
                            onChange={e => setFormData({ ...formData, dcdbDetails: e.target.value })}
                            placeholder="Details (e.g. For Safe DC Distribution, IP65)"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                          <input
                            type="text"
                            list="dcdbBrands"
                            value={formData.dcdbMake}
                            onChange={e => setFormData({ ...formData, dcdbMake: e.target.value })}
                            placeholder="Make (e.g. Polycab)"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                          <input
                            type="text"
                            value={formData.dcdbQty}
                            onChange={e => setFormData({ ...formData, dcdbQty: e.target.value })}
                            placeholder="Qty (e.g. 1 Unit)"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                        </div>
                      </div>

                      {/* Lightning Arrestor */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Lightning Arrestor</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={formData.lightningDetails}
                            onChange={e => setFormData({ ...formData, lightningDetails: e.target.value })}
                            placeholder="Details"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                          <input
                            type="text"
                            list="lightningBrands"
                            value={formData.lightningMake}
                            onChange={e => setFormData({ ...formData, lightningMake: e.target.value })}
                            placeholder="Make"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                          <input
                            type="text"
                            value={formData.lightningQty}
                            onChange={e => setFormData({ ...formData, lightningQty: e.target.value })}
                            placeholder="Qty"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category 3: Earthing, Wiring & Cables */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pb-1 border-b border-slate-100">3. Earthing, Wiring & Cables</h4>

                      {/* Earthing */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">3 Copper Earthing</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={formData.earthingDetails}
                            onChange={e => setFormData({ ...formData, earthingDetails: e.target.value })}
                            placeholder="Details"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                          <input
                            type="text"
                            list="earthingBrands"
                            value={formData.earthingMake}
                            onChange={e => setFormData({ ...formData, earthingMake: e.target.value })}
                            placeholder="Make"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                          <input
                            type="text"
                            value={formData.earthingQty}
                            onChange={e => setFormData({ ...formData, earthingQty: e.target.value })}
                            placeholder="Qty"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                        </div>
                      </div>

                      {/* Wiring */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Closed Wiring in PVC Conduit Pipe</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={formData.wiringDetails}
                            onChange={e => setFormData({ ...formData, wiringDetails: e.target.value })}
                            placeholder="Details"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                          <input
                            type="text"
                            list="wiringBrands"
                            value={formData.wiringMake}
                            onChange={e => setFormData({ ...formData, wiringMake: e.target.value })}
                            placeholder="Make"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                          <input
                            type="text"
                            value={formData.wiringQty}
                            onChange={e => setFormData({ ...formData, wiringQty: e.target.value })}
                            placeholder="Qty"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                        </div>
                      </div>

                      {/* Cables */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cables & Accessories</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={formData.cablesDetails}
                            onChange={e => setFormData({ ...formData, cablesDetails: e.target.value })}
                            placeholder="Details"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                          <input
                            type="text"
                            list="cablesBrands"
                            value={formData.cablesMake}
                            onChange={e => setFormData({ ...formData, cablesMake: e.target.value })}
                            placeholder="Make"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                          <input
                            type="text"
                            value={formData.cablesQty}
                            onChange={e => setFormData({ ...formData, cablesQty: e.target.value })}
                            placeholder="Qty"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Category 4: Labor & Installation */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pb-1 border-b border-slate-100">4. Labor & Installation</h4>

                      {/* Installation */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Installation & Labour</span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={formData.installationDetails}
                            onChange={e => setFormData({ ...formData, installationDetails: e.target.value })}
                            placeholder="Details"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                          <input
                            type="text"
                            list="installationBrands"
                            value={formData.installationMake}
                            onChange={e => setFormData({ ...formData, installationMake: e.target.value })}
                            placeholder="Make (Optional)"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                          <input
                            type="text"
                            value={formData.installationQty}
                            onChange={e => setFormData({ ...formData, installationQty: e.target.value })}
                            placeholder="Qty"
                            className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-[#f6871e] transition-all text-xs"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Datalists for recommendations */}
              <datalist id="solarBrands">
                <option value="Adani/Luminous" />
                <option value="Adani" />
                <option value="Luminous" />
                <option value="Tata Solar" />
                <option value="Waaree" />
                <option value="Vikram Solar" />
                <option value="Goldi Solar" />
              </datalist>
              <datalist id="inverterBrands">
                <option value="Solis" />
                <option value="Growatt" />
                <option value="Sofar" />
                <option value="Sungrow" />
                <option value="Fronius" />
                <option value="Polycab" />
                <option value="Havells" />
                <option value="Luminous" />
              </datalist>
              <datalist id="structureBrands">
                <option value="Approved Make" />
                <option value="HDGI Rust-free solar structure" />
                <option value="Galvanized Iron" />
              </datalist>
              <datalist id="acdbBrands">
                <option value="Polycab" />
                <option value="Schneider" />
                <option value="Havells" />
                <option value="Luminous" />
                <option value="Legrand" />
              </datalist>
              <datalist id="dcdbBrands">
                <option value="Polycab" />
                <option value="Schneider" />
                <option value="Havells" />
                <option value="Luminous" />
                <option value="Legrand" />
              </datalist>
              <datalist id="earthingBrands">
                <option value="True Power" />
                <option value="Approved Make" />
                <option value="Standard Copper" />
              </datalist>
              <datalist id="wiringBrands">
                <option value="Polycab" />
                <option value="RR Kabel" />
                <option value="Finolex" />
                <option value="Havells" />
                <option value="KEI" />
              </datalist>
              <datalist id="cablesBrands">
                <option value="Polycab" />
                <option value="RR Kabel" />
                <option value="Finolex" />
                <option value="Havells" />
                <option value="KEI" />
              </datalist>
              <datalist id="lightningBrands">
                <option value="Approved Make" />
                <option value="Standard" />
              </datalist>
              <datalist id="installationBrands">
                <option value="Eco Grid" />
                <option value="Complete Installation & Setup" />
              </datalist>
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
                  <input type="text" value={formData.loanDetails.bankName} onChange={e => setFormData({ ...formData, loanDetails: { ...formData.loanDetails, bankName: e.target.value } })} placeholder="e.g. State Bank of India" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bank Address</label>
                  <input type="text" value={formData.loanDetails.bankAddress} onChange={e => setFormData({ ...formData, loanDetails: { ...formData.loanDetails, bankAddress: e.target.value } })} placeholder="Branch location" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.loanDetails.loanAmount}
                    onChange={e => {
                      const newLoanAmt = e.target.value;
                      const tenure = formData.loanDetails.tenureMonths;
                      const rate = formData.loanDetails.interestRate;
                      let calculatedEmi = formData.loanDetails.emiAmount;
                      if (Number(newLoanAmt) > 0 && Number(tenure) > 0) {
                        calculatedEmi = calculateEmi(newLoanAmt, rate, tenure);
                      }
                      let calculatedDownPayment = formData.loanDetails.downPayment;
                      if (calculations.netPrice > 0 && Number(newLoanAmt) > 0) {
                        calculatedDownPayment = Math.max(0, Math.round(calculations.netPrice - Number(newLoanAmt))).toString();
                      }
                      setFormData({
                        ...formData,
                        loanDetails: {
                          ...formData.loanDetails,
                          loanAmount: newLoanAmt,
                          emiAmount: calculatedEmi,
                          downPayment: calculatedDownPayment
                        }
                      });
                    }}
                    placeholder="0.00"
                    className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tenure (Months)</label>
                    <input
                      type="number"
                      value={formData.loanDetails.tenureMonths}
                      onChange={e => {
                        const newTenure = e.target.value;
                        const loanAmt = formData.loanDetails.loanAmount;
                        const rate = formData.loanDetails.interestRate;
                        let calculatedEmi = formData.loanDetails.emiAmount;
                        if (Number(loanAmt) > 0 && Number(newTenure) > 0) {
                          calculatedEmi = calculateEmi(loanAmt, rate, newTenure);
                        }
                        setFormData({
                          ...formData,
                          loanDetails: {
                            ...formData.loanDetails,
                            tenureMonths: newTenure,
                            emiAmount: calculatedEmi
                          }
                        });
                      }}
                      placeholder="e.g. 60"
                      className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.loanDetails.interestRate}
                      onChange={e => {
                        const newRate = e.target.value;
                        const loanAmt = formData.loanDetails.loanAmount;
                        const tenure = formData.loanDetails.tenureMonths;
                        let calculatedEmi = formData.loanDetails.emiAmount;
                        if (Number(loanAmt) > 0 && Number(tenure) > 0) {
                          calculatedEmi = calculateEmi(loanAmt, newRate, tenure);
                        }
                        setFormData({
                          ...formData,
                          loanDetails: {
                            ...formData.loanDetails,
                            interestRate: newRate,
                            emiAmount: calculatedEmi
                          }
                        });
                      }}
                      placeholder="8.5"
                      className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">EMI Amount (₹)</label>
                  <input type="number" value={formData.loanDetails.emiAmount} onChange={e => setFormData({ ...formData, loanDetails: { ...formData.loanDetails, emiAmount: e.target.value } })} placeholder="Monthly Payment" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Processing Fees (₹)</label>
                  <input type="number" value={formData.loanDetails.processingFees} onChange={e => setFormData({ ...formData, loanDetails: { ...formData.loanDetails, processingFees: e.target.value } })} placeholder="Bank Charges" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Down Payment (₹)</label>
                  <input
                    type="number"
                    value={formData.loanDetails.downPayment}
                    onChange={e => {
                      const newDownPayment = e.target.value;
                      const netVal = calculations.netPrice || 0;
                      let calculatedLoanAmt = formData.loanDetails.loanAmount;
                      let calculatedEmi = formData.loanDetails.emiAmount;
                      if (netVal > 0 && Number(newDownPayment) >= 0) {
                        calculatedLoanAmt = Math.max(0, Math.round(netVal - Number(newDownPayment))).toString();
                        const tenure = formData.loanDetails.tenureMonths;
                        const rate = formData.loanDetails.interestRate;
                        if (Number(calculatedLoanAmt) > 0 && Number(tenure) > 0) {
                          calculatedEmi = calculateEmi(calculatedLoanAmt, rate, tenure);
                        }
                      }
                      setFormData({
                        ...formData,
                        loanDetails: {
                          ...formData.loanDetails,
                          downPayment: newDownPayment,
                          loanAmount: calculatedLoanAmt,
                          emiAmount: calculatedEmi
                        }
                      });
                    }}
                    placeholder="Paid to Bank"
                    className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Loan Remarks</label>
                  <input type="text" value={formData.loanDetails.remarks} onChange={e => setFormData({ ...formData, loanDetails: { ...formData.loanDetails, remarks: e.target.value } })} placeholder="Any specific notes" className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-emerald-500 transition-all" />
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
                  <input type="number" placeholder="0" value={formData.centralSubsidy} onChange={e => setFormData({ ...formData, centralSubsidy: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-left font-bold text-slate-900 outline-none focus:bg-white focus:border-[#f6871e] transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">State (UPNEEDA)</span>
                  <input type="number" placeholder="0" value={formData.stateSubsidy} onChange={e => setFormData({ ...formData, stateSubsidy: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 text-left font-bold text-slate-900 outline-none focus:bg-white focus:border-[#f6871e] transition-all" />
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
                    onChange={e => setFormData({ ...formData, baseAmount: e.target.value })}
                    className="w-full pl-20 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.75rem] outline-none font-black text-2xl text-slate-900 focus:bg-white focus:border-[#3f7abe] transition-all placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Early Bird Disc</label>
                  <input type="number" placeholder="0" value={formData.earlyBirdDiscount} onChange={e => setFormData({ ...formData, earlyBirdDiscount: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#3f7abe] transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Add. Discount</label>
                  <input type="number" placeholder="0" value={formData.additionalDiscount} onChange={e => setFormData({ ...formData, additionalDiscount: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[1.25rem] outline-none font-bold text-slate-900 focus:bg-white focus:border-[#3f7abe] transition-all" />
                </div>
              </div>

              <div className="flex items-center justify-between px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {formData.includeGST ? "GST Added on Top (Exclusive)" : "Included GST (Inclusive)"}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    {formData.includeGST ? "GST will be added on top (Exclusive)" : "GST is already included in price (Inclusive)"}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.includeGST}
                    onChange={e => setFormData({
                      ...formData,
                      includeGST: e.target.checked
                    })}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f6871e]"></div>
                </label>
              </div>

              <div className={`grid grid-cols-2 gap-6 p-6 rounded-[1.75rem] border animate-in zoom-in-95 duration-200 ${formData.includeGST
                  ? 'bg-slate-50 border-slate-100'
                  : 'bg-emerald-50/20 border-emerald-100/40'
                }`}>
                <div className="space-y-2">
                  <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${formData.includeGST ? 'text-[#f6871e]' : 'text-emerald-600'
                    }`}>
                    {formData.includeGST ? "GST (%) (Extra)" : "GST (%) (Included)"}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    disabled={!formData.includeGST}
                    value={formData.includeGST ? formData.gstPercentage : 8.9}
                    onChange={e => setFormData({ ...formData, gstPercentage: e.target.value })}
                    className={`w-full px-4 py-3 bg-white border-2 rounded-xl outline-none font-black text-lg transition-all ${formData.includeGST
                        ? 'border-[#f6871e]/20 text-[#f6871e] focus:border-[#f6871e]'
                        : 'border-emerald-600/20 text-emerald-600 focus:border-emerald-600 opacity-60 cursor-not-allowed bg-slate-100'
                      }`}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {formData.includeGST ? "GST Tax Amount (Extra)" : "GST Tax Amount (Inward)"}
                  </p>
                  <p className="font-black text-xl text-slate-900">
                    ₹ {calculations.gstAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              <div className="py-6 border-y-2 border-slate-50">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {formData.includeGST ? "Net Quotation Value" : "Net Price (Inclusive of 8.9% GST)"}
                    </span>
                    <p className="text-xs font-bold text-slate-500 italic">
                      {formData.includeGST ? "(Inclusive of all Taxes)" : "(GST Included)"}
                    </p>
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
                  {id ? 'Update Proposal' : 'Launch Proposal'}
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
