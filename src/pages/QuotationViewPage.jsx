import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Loader2, FileDown, X, Phone, Mail, Globe, Zap, Cpu, Calendar, Layers, Droplet, Building, Wifi, Home } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Assets
import logoImg from '../assets/Logo.jpeg';
import coverEngineerImg from '../assets/cover_engineer.png';
import structureImg from '../assets/structure_diagram.png';
import solarRoof1 from '../assets/solar_roof_1.png';
import solarRoof2 from '../assets/solar_roof_2.png';
import solarRoof3 from '../assets/solar_roof_3.png';
import solarRail from '../assets/solar_rail.png';
import endEngineerImg from '../assets/end_engineer.png';

const TopRightTriangle = () => (
  <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '250px', zIndex: 0 }}>
    <svg width="100%" height="100%" viewBox="0 0 400 250" preserveAspectRatio="none">
      <polygon points="400,0 400,250 100,0" fill="#1b315b" />
      <polygon points="400,250 200,250 400,100" fill="#788fa6" />
    </svg>
  </div>
);

const BottomTriangles = () => (
  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '180px', zIndex: 0 }}>
    <svg width="100%" height="100%" viewBox="0 0 1000 180" preserveAspectRatio="none">
      <polygon points="0,180 350,180 0,0" fill="#788fa6" />
      <polygon points="0,180 500,180 200,50" fill="#1b315b" />
      <polygon points="1000,180 650,180 1000,0" fill="#788fa6" />
      <polygon points="1000,180 500,180 800,50" fill="#1b315b" />
    </svg>
  </div>
);

const BottomBand = () => (
  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '180px', zIndex: 0 }}>
    <svg width="100%" height="100%" viewBox="0 0 1000 180" preserveAspectRatio="none">
      <polygon points="0,180 1000,180 1000,0 0,180" fill="#1b315b" />
      <polygon points="0,180 300,180 0,0" fill="#788fa6" />
    </svg>
  </div>
);

const LogoHeader = ({ logo }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 10 }}>
    {logo && <img src={logo} alt="Logo" style={{ height: '50px', borderRadius: '50%' }} />}
    <div>
      <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#1b315b', lineHeight: '1.1' }}>Solar</h2>
      <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '400', color: '#111827', lineHeight: '1.1' }}>Eco Grid</h2>
    </div>
  </div>
);

const QuotationViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [logoBase64, setLogoBase64] = useState('');
  
  // Base64 images for html2canvas
  const [imagesBase64, setImagesBase64] = useState({});
  const pagesRef = useRef([]);

  const handleDownload = async () => {
    if (!quotation) return;
    setIsDownloading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const totalPages = quotation.loanDetails?.required ? 10 : 9;

      for (let i = 0; i < totalPages; i++) {
        const page = pagesRef.current[i];
        if (!page) continue;

        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#f1f5f9'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        await new Promise(r => setTimeout(r, 100));
      }
      pdf.save(`Proposal-${quotation.quotationNo}.pdf`);
      
      const params = new URLSearchParams(location.search);
      if (params.get('download') === 'true') {
        setTimeout(() => navigate(-1), 1000);
      }
    } catch (err) {
      console.error(err);
      alert('Download Failed: ' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const toBase64 = async (url) => {
          const res = await fetch(url);
          const blob = await res.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        };
        
        const logoB64 = await toBase64(logoImg);
        setLogoBase64(logoB64);

        const imgs = {
          cover: await toBase64(coverEngineerImg),
          structure: await toBase64(structureImg),
          roof1: await toBase64(solarRoof1),
          roof2: await toBase64(solarRoof2),
          roof3: await toBase64(solarRoof3),
          rail: await toBase64(solarRail),
          end: await toBase64(endEngineerImg)
        };
        setImagesBase64(imgs);
      } catch (err) { console.error('Error loading assets', err); }
    };
    fetchAssets();

    const fetchQuotation = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/quotations`, config);
        const found = data.find(q => q._id === id);
        setQuotation(found);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchQuotation();
  }, [id, user.token]);

  useEffect(() => {
    if (!loading && quotation) {
      const params = new URLSearchParams(location.search);
      if (params.get('download') === 'true') {
        setTimeout(handleDownload, 2000);
      }
    }
  }, [loading, quotation, location.search]);

  if (loading) return <div className="flex flex-col items-center justify-center h-screen gap-4"><Loader2 className="w-12 h-12 text-[#1b315b] animate-spin" /><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Generating Proposal...</p></div>;
  if (!quotation) return <div className="flex flex-col items-center justify-center h-screen gap-6 text-center"><div style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', margin: '0 auto' }}><X size={40} /></div><h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' }}>Proposal Not Found</h2></div>;

  const basePrice = quotation.baseAmount || 0;
  const netPrice = quotation.netPrice || 0;
  const netEffective = quotation.netEffectivePrice || 0;
  const year = new Date(quotation.date || Date.now()).getFullYear();

  const pageStyle = { width: '210mm', height: '297mm', backgroundColor: '#f9fafb', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0, fontFamily: 'Arial, sans-serif' };

  return (
    <div className="space-y-8 pb-20 font-sans bg-slate-100 p-8">
      <div className="flex items-center justify-between max-w-5xl mx-auto px-4 print:hidden">
        <button onClick={() => navigate('/dashboard/quotations')} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-all text-slate-500">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button disabled={isDownloading} onClick={handleDownload} className="flex items-center gap-2 px-10 py-5 bg-[#1b315b] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#1b315b]/30 hover:bg-[#11203d] transition-all">
          {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
          {isDownloading ? 'Downloading...' : 'Download Full Proposal'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>
        
        {/* PAGE 1: COVER */}
        <div ref={el => pagesRef.current[0] = el} style={pageStyle}>
          <div style={{ display: 'flex', height: '100%' }}>
            {/* Left Image */}
            <div style={{ width: '45%', height: '100%', position: 'relative' }}>
              {imagesBase64.cover && <img src={imagesBase64.cover} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Cover" />}
            </div>
            {/* Right Content */}
            <div style={{ width: '55%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
              {/* Top Navy Box */}
              <div style={{ backgroundColor: '#1b315b', padding: '60px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {logoBase64 && <img src={logoBase64} alt="Logo" style={{ height: '70px', borderRadius: '50%' }} />}
                </div>
                <h1 style={{ color: 'white', fontSize: '40px', fontWeight: '900', margin: '20px 0 0 0', textAlign: 'center', lineHeight: '1.1' }}>SOLAR<br/>ECOGRID</h1>
              </div>

              {/* Center Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', margin: '0 0 40px 0' }}>Price Estimate</h2>
                <h1 style={{ fontSize: '90px', fontWeight: '900', color: '#1b315b', margin: '0' }}>{year}</h1>
              </div>

              {/* Bottom Details */}
              <div style={{ padding: '40px', textAlign: 'center', zIndex: 10 }}>
                <p style={{ color: '#1b315b', fontSize: '14px', marginBottom: '15px' }}>+91-9889555339</p>
                <p style={{ color: '#1b315b', fontSize: '14px', marginBottom: '15px' }}>+91-6388908096</p>
                <p style={{ color: '#1b315b', fontSize: '14px', marginBottom: '15px' }}>info@ecogridinfra.in</p>
                <p style={{ color: '#1b315b', fontSize: '14px', marginBottom: '40px' }}>www.solarecogrid.com</p>
                <p style={{ color: '#111827', fontSize: '18px', fontWeight: '600' }}>Eco Grid Infra Pvt. Ltd.</p>
              </div>

              {/* Bottom Triangles */}
              <BottomTriangles />
              <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
                <span style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>www.solarecogrid.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 2: PROPOSAL STRUCTURE */}
        <div ref={el => pagesRef.current[1] = el} style={{ ...pageStyle, padding: '50px' }}>
          <TopRightTriangle />
          <LogoHeader logo={logoBase64} />
          
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1b315b', marginTop: '40px', marginBottom: '20px', position: 'relative', zIndex: 10 }}>Proposal - On-Grid Solar Power System</h1>
          
          <div style={{ flex: 1, backgroundColor: 'white', border: '5px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10, overflow: 'hidden' }}>
             {imagesBase64.structure && <img src={imagesBase64.structure} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Structure" />}
          </div>

          <BottomBand />
          <div style={{ position: 'absolute', bottom: '30px', left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
            <span style={{ fontSize: '18px', color: 'white', fontWeight: '500' }}>www.solarecogrid.com</span>
          </div>
        </div>

        {/* PAGE 3: RELIABLE SOLUTIONS */}
        <div ref={el => pagesRef.current[2] = el} style={{ ...pageStyle, padding: '50px' }}>
          <TopRightTriangle />
          <LogoHeader logo={logoBase64} />
          
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1b315b', textAlign: 'center', marginTop: '60px', marginBottom: '40px', position: 'relative', zIndex: 10, padding: '0 40px' }}>
            Reliable Solar Solutions For Residential & Commercial Needs.
          </h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', position: 'relative', zIndex: 10 }}>
            <div style={{ height: '240px', backgroundColor: 'white', padding: '5px' }}>{imagesBase64.roof1 && <img src={imagesBase64.roof1} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}</div>
            <div style={{ height: '240px', backgroundColor: 'white', padding: '5px' }}>{imagesBase64.roof2 && <img src={imagesBase64.roof2} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}</div>
            <div style={{ height: '240px', backgroundColor: 'white', padding: '5px' }}>{imagesBase64.roof3 && <img src={imagesBase64.roof3} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}</div>
            <div style={{ height: '240px', backgroundColor: 'white', padding: '5px' }}>{imagesBase64.rail && <img src={imagesBase64.rail} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}</div>
          </div>

          <BottomBand />
          <div style={{ position: 'absolute', bottom: '30px', left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
            <span style={{ fontSize: '18px', color: 'white', fontWeight: '500' }}>www.solarecogrid.com</span>
          </div>
        </div>

        {/* PAGE 4: ABOUT */}
        <div ref={el => pagesRef.current[3] = el} style={{ ...pageStyle, padding: '50px' }}>
          <TopRightTriangle />
          <LogoHeader logo={logoBase64} />
          
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#1b315b', textAlign: 'center', marginTop: '100px', marginBottom: '40px', position: 'relative', zIndex: 10 }}>
            About
          </h1>
          
          <div style={{ backgroundColor: '#1b315b', padding: '60px 50px', position: 'relative', zIndex: 10, margin: '0 40px' }}>
            <p style={{ color: 'white', fontSize: '18px', lineHeight: '1.6', margin: 0, textAlign: 'justify' }}>
              Solar Eco Grid is dedicated to powering a cleaner, brighter, and more sustainable future. 
              We provide affordable solar solutions with zero investment options, seamless installation, and 
              monthly maintenance. Our mission is to help every household and business reduce electricity 
              bills while embracing renewable energy. With trusted service, expert support, and government 
              subsidies, we make the shift to solar easy, reliable, and rewarding.
            </p>
          </div>

          <BottomBand />
          <div style={{ position: 'absolute', bottom: '30px', left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
            <span style={{ fontSize: '18px', color: 'white', fontWeight: '500' }}>www.solarecogrid.com</span>
          </div>
        </div>

        {/* PAGE 5: WHAT WE OFFER */}
        <div ref={el => pagesRef.current[4] = el} style={{ ...pageStyle, padding: '50px' }}>
          <div style={{ position: 'absolute', top: '50px', right: '50px', width: '200px', height: '100px', display: 'flex' }}>
             <div style={{ flex: 1, backgroundColor: '#1b315b' }}></div>
             <div style={{ flex: 1, backgroundColor: '#788fa6' }}></div>
          </div>
          <LogoHeader logo={logoBase64} />
          
          <div style={{ display: 'flex', marginTop: '60px', position: 'relative', zIndex: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ backgroundColor: '#a78bfa', padding: '30px', color: 'white', height: '220px' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 5px 0' }}>1</h3>
                 <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 20px 0' }}>Free Consultation</h2>
                 <div style={{ height: '3px', width: '100%', backgroundColor: '#111827', marginBottom: '20px' }}></div>
                 <p style={{ fontSize: '12px', lineHeight: '1.5', margin: 0 }}>Discover how solar can work for you. Our experts provide a free, no-obligation consultation to assess your needs and recommend the best solution.</p>
              </div>
              <div style={{ backgroundColor: '#f87171', padding: '30px', color: 'white', height: '220px' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 5px 0' }}>2</h3>
                 <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 20px 0' }}>Seamless financing</h2>
                 <div style={{ height: '3px', width: '100%', backgroundColor: '#111827', marginBottom: '20px' }}></div>
                 <p style={{ fontSize: '12px', lineHeight: '1.5', margin: 0 }}>We offer flexible and hassle-free financing options to make switching to solar easy and affordable. Power your future without financial stress!</p>
              </div>
              <div style={{ backgroundColor: '#94a3b8', padding: '30px', color: 'white', height: '220px' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 5px 0' }}>3</h3>
                 <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 20px 0' }}>Paper work handling</h2>
                 <div style={{ height: '3px', width: '100%', backgroundColor: '#111827', marginBottom: '20px' }}></div>
                 <p style={{ fontSize: '12px', lineHeight: '1.5', margin: 0 }}>We will take care government processes for you like name change on connection, load change, face change, net metering and solar commissioning.</p>
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ padding: '30px', height: '220px' }}>
                 <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#1b315b', lineHeight: '1', margin: 0 }}>WHAT<br/>WE<br/>OFFER</h1>
              </div>
              <div style={{ backgroundColor: '#e2e8f0', padding: '30px', color: '#111827', height: '220px' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#ef4444', margin: '0 0 5px 0' }}>4</h3>
                 <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444', margin: '0 0 20px 0' }}>Installation</h2>
                 <div style={{ height: '3px', width: '100%', backgroundColor: '#111827', marginBottom: '20px' }}></div>
                 <p style={{ fontSize: '12px', lineHeight: '1.5', margin: 0 }}>Our expert team ensures fast, reliable, and high-quality solar panel installation for homes and businesses. We handle everything from planning to setup.</p>
              </div>
              <div style={{ backgroundColor: '#fb923c', padding: '30px', color: 'white', height: '220px' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 5px 0' }}>5</h3>
                 <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 20px 0' }}>Maintenance</h2>
                 <div style={{ height: '3px', width: '100%', backgroundColor: '#111827', marginBottom: '20px' }}></div>
                 <p style={{ fontSize: '12px', lineHeight: '1.5', margin: 0 }}>We provide regular maintenance services to keep your solar power plant running at peak performance. From system checks and repairs.</p>
              </div>
              <div style={{ backgroundColor: '#fdba74', padding: '30px', color: 'white', height: '220px' }}>
                 <h3 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 5px 0' }}>6</h3>
                 <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 20px 0' }}>Roof Damage Cover</h2>
                 <p style={{ fontSize: '12px', lineHeight: '1.5', margin: 0, marginTop: '20px' }}>We prioritize the safety of your roof during solar installation. Our services include insurance coverage for any water leakage or wear and tear caused during installation.</p>
              </div>
            </div>
          </div>

          <BottomTriangles />
          <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
            <span style={{ fontSize: '18px', color: '#111827', fontWeight: '500' }}>www.solarecogrid.com</span>
          </div>
        </div>

        {/* PAGE 6: COMMERCIALS */}
        <div ref={el => pagesRef.current[5] = el} style={{ 
          ...pageStyle, 
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
          padding: '40px 30px', 
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          
          {/* Header Title */}
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '900', 
            textAlign: 'center', 
            marginTop: '10px', 
            marginBottom: '20px', 
            color: 'white',
            letterSpacing: '-0.5px'
          }}>
            Our offer for <span style={{ color: '#fde047' }}>you</span>
          </h1>

          {/* Glassmorphic/White Card */}
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: '24px', 
            padding: '24px 20px', 
            color: '#1e1b4b',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            maxHeight: '750px',
            overflow: 'hidden'
          }}>
            {/* Customer Details */}
            <div style={{ marginBottom: '15px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#4f46e5', margin: '0 0 4px 0' }}>
                {quotation.lead?.name || 'Customer'}
              </h2>
              <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#6b7280', margin: 0 }}>
                {quotation.lead?.phone || 'N/A'} - {quotation.lead?.address || 'N/A'}
              </p>
            </div>

            {/* Technical Specifications Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px 20px',
              backgroundColor: '#f5f3ff',
              padding: '16px',
              borderRadius: '16px',
              marginBottom: '15px'
            }}>
              {/* Item 1: System Size */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  backgroundColor: '#818cf8', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Zap size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>System size</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e1b4b' }}>{quotation.systemSize}</div>
                </div>
              </div>

              {/* Item 2: Solar Panels */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  backgroundColor: '#818cf8', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '9px',
                  flexShrink: 0
                }}>
                  ZS
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>Solar Panels</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e1b4b', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={quotation.solarPanels}>
                    {quotation.solarPanels}
                  </div>
                </div>
              </div>

              {/* Item 3: Inverter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  backgroundColor: '#818cf8', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Cpu size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>Inverter</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e1b4b', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={quotation.inverter}>
                    {quotation.inverter}
                  </div>
                </div>
              </div>

              {/* Item 4: Quotation Date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  backgroundColor: '#818cf8', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Calendar size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>Quotation Date</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e1b4b' }}>
                    {new Date(quotation.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Item 5: Structure Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  backgroundColor: '#818cf8', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Layers size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>Structure type</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e1b4b', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={quotation.structureType}>
                    {quotation.structureType || 'Approved Make'}
                  </div>
                </div>
              </div>

              {/* Item 6: Cleaning Frequency */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  backgroundColor: '#818cf8', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Droplet size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>Cleaning frequency</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e1b4b' }}>{quotation.cleaningFrequency || 'NO'}</div>
                </div>
              </div>

              {/* Item 7: Offering */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  backgroundColor: '#818cf8', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '9px',
                  flexShrink: 0
                }}>
                  S
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>Offering</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e1b4b' }}>{quotation.offering || 'EcoGrid'}</div>
                </div>
              </div>

              {/* Item 8: Floor Height */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  backgroundColor: '#818cf8', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Building size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>Floor Height</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e1b4b' }}>{quotation.floorHeight || 'G+0'}</div>
                </div>
              </div>

              {/* Item 9: GSM Based */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  backgroundColor: '#818cf8', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Wifi size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>GSM Based</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e1b4b' }}>{quotation.gsmBased || 'No'}</div>
                </div>
              </div>

              {/* Item 10: Inverter Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ 
                  backgroundColor: '#818cf8', 
                  borderRadius: '50%', 
                  width: '28px', 
                  height: '28px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: 'white',
                  flexShrink: 0
                }}>
                  <Home size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' }}>Inverter Location</div>
                  <div style={{ fontSize: '11px', fontWeight: '900', color: '#1e1b4b' }}>{quotation.inverterLocation || 'Ground'}</div>
                </div>
              </div>
            </div>

            {/* Price Estimator Table */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '6px 4px', fontWeight: '900', color: '#4f46e5', textTransform: 'uppercase', fontSize: '10px' }}>Price</th>
                    <th style={{ textAlign: 'right', padding: '6px 4px', fontWeight: '900', color: '#4f46e5', textTransform: 'uppercase', fontSize: '10px' }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 4px', fontWeight: 'bold', color: '#374151' }}>Rooftop System</td>
                    <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold', color: '#111827' }}>₹ {basePrice.toLocaleString('en-IN')}</td>
                  </tr>
                  
                  {quotation.earlyBirdDiscount > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', color: '#6b7280' }}>Early bird discount</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>- ₹ {quotation.earlyBirdDiscount.toLocaleString('en-IN')}</td>
                    </tr>
                  )}

                  {quotation.additionalDiscount > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', color: '#6b7280' }}>Discount</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>- ₹ {quotation.additionalDiscount.toLocaleString('en-IN')}</td>
                    </tr>
                  )}

                  {quotation.isGstInclusive ? (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', fontWeight: 'bold', color: '#374151' }}>
                        Net Price (Inclusive of {quotation.gstPercentage}% GST)
                      </td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: '900', color: '#111827' }}>
                        ₹ {netPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {quotation.gstPercentage > 0 && (
                        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 4px', color: '#6b7280' }}>
                            GST ({quotation.gstPercentage}% Extra)
                          </td>
                          <td style={{ padding: '6px 4px', textAlign: 'right', color: '#111827', fontWeight: 'bold' }}>
                            + ₹ {(quotation.gstAmount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </td>
                        </tr>
                      )}
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 4px', fontWeight: 'bold', color: '#374151' }}>
                          Net Price (Inclusive of all Taxes)
                        </td>
                        <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: '900', color: '#111827' }}>
                          ₹ {netPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                      </tr>
                    </>
                  )}

                  {quotation.centralSubsidy > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', color: '#6b7280' }}>Central Govt. Direct Benefit Transfer</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>- ₹ {quotation.centralSubsidy.toLocaleString('en-IN')}</td>
                    </tr>
                  )}

                  {quotation.stateSubsidy > 0 && (
                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '6px 4px', color: '#6b7280' }}>UPNEEDA Subsidy</td>
                      <td style={{ padding: '6px 4px', textAlign: 'right', color: '#059669', fontWeight: 'bold' }}>- ₹ {quotation.stateSubsidy.toLocaleString('en-IN')}</td>
                    </tr>
                  )}

                  {/* Net Effective Price Highlight Row */}
                  <tr style={{ 
                    background: 'linear-gradient(90deg, #fef08a 0%, #fde047 100%)', 
                    borderRadius: '8px', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}>
                    <td style={{ padding: '8px 10px', fontWeight: '900', color: '#78350f', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                      Net Effective Price*
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '900', color: '#78350f', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '12px' }}>
                      ₹ {netEffective.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Note Section */}
            <div style={{ 
              marginTop: '15px', 
              fontSize: '7.5px', 
              color: '#6b7280', 
              lineHeight: '1.4', 
              borderTop: '1px solid #e2e8f0', 
              paddingTop: '8px' 
            }}>
              <b>Note</b><br/>
              1. Once the commissioning is completed by MNRE, the subsidy amount will be directly transferred to the beneficiary's account.<br/>
              2. The applicable subsidy amount is determined according to the MNRE declaration. For more details regarding the MNRE subsidy.
            </div>
          </div>

          {/* Footer Website link */}
          <div style={{ textAlign: 'center', marginTop: '15px', zIndex: 10 }}>
            <span style={{ fontSize: '14px', color: 'white', fontWeight: '700', letterSpacing: '0.5px' }}>
              www.solarecogrid.com
            </span>
          </div>

        </div>

        {/* PAGE 7: TECHNICAL SPECS TABLE */}
        <div ref={el => pagesRef.current[6] = el} style={{ ...pageStyle, padding: '50px' }}>
          <TopRightTriangle />
          <LogoHeader logo={logoBase64} />
          
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1b315b', marginTop: '30px', marginBottom: '20px', position: 'relative', zIndex: 10 }}>
            Details about the System {quotation.systemSize} On-Grid
          </h2>
          
          <div style={{ position: 'relative', zIndex: 10, flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', border: '1px solid black' }}>
              <thead style={{ backgroundColor: '#cbd5e1' }}>
                <tr>
                  <th style={{ border: '1px solid black', padding: '12px', fontSize: '12px', width: '25%' }}>Item/Component</th>
                  <th style={{ border: '1px solid black', padding: '12px', fontSize: '12px', width: '40%' }}>Details</th>
                  <th style={{ border: '1px solid black', padding: '12px', fontSize: '12px', width: '15%' }}>Make</th>
                  <th style={{ border: '1px solid black', padding: '12px', fontSize: '12px', width: '20%' }}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>Solar Panels<br/>30 Year Performance<br/>Warranty</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.solarPanels}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>{quotation.solarPanelsMake || 'Adani/Luminous'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.solarPanelsQty || 'As per capacity'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>Inverter (On-Grid)<br/>10 / 7 Year Warranty</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>{quotation.inverter}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.inverterMake || 'Solis'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.inverterQty || '1 Unit'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>Solar panel<br/>mounting structure</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.structureType || 'HDGI Rust-free solar structure- strong, durable, and weather-resistance'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.structureMake || 'Approved Make'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.structureQty || 'For panels'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>ACDB (AC Distribution<br/>Box)</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>{quotation.acdbDetails || 'For Safe AC Distribution, IP65'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.acdbMake || 'Polycab'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.acdbQty || '1 Unit'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>DCDB (DC Distribution<br/>Box)</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>{quotation.dcdbDetails || 'For Safe DC Distribution, IP65'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.dcdbMake || 'Polycab'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.dcdbQty || '1 Unit'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>3 Copper Earthing</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>{quotation.earthingDetails || 'Standard earthing for electrical safety'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.earthingMake || 'True Power'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.earthingQty || '3 Unit'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>Closed Wiring in PVC<br/>Conduit Pipe</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>{quotation.wiringDetails || 'For safe and secure wiring'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.wiringMake || ''}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.wiringQty || 'As per Requirement'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>Cables & Accessories</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>{quotation.cablesDetails || 'Cu wire 4mm'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.cablesMake || 'Polycab'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.cablesQty || '1 Set'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>Lightning Arrestor</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>{quotation.lightningDetails || 'Safely grounds lighting, protecting structure and equipment.'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.lightningMake || 'Approved Make'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.lightningQty || '1 Set'}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>Installation & Labour</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px', fontWeight: 'bold' }}>{quotation.installationDetails || 'Complete Installation & Setup'}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.installationMake || ''}</td>
                  <td style={{ border: '1px solid black', padding: '10px', fontSize: '11px' }}>{quotation.installationQty || 'Each'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <BottomBand />
          <div style={{ position: 'absolute', bottom: '30px', left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
            <span style={{ fontSize: '18px', color: 'white', fontWeight: '500' }}>www.solarecogrid.com</span>
          </div>
        </div>

        {/* PAGE 8: WARRANTY */}
        <div ref={el => pagesRef.current[7] = el} style={{ ...pageStyle, padding: '50px' }}>
          <TopRightTriangle />
          <LogoHeader logo={logoBase64} />
          
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#1b315b', marginTop: '60px', marginBottom: '30px', position: 'relative', zIndex: 10 }}>
            Warranty and Services
          </h1>
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #e2e8f0', padding: '15px', textAlign: 'left', color: '#1b315b', fontSize: '14px', width: '50%' }}>What You Get</th>
                  <th style={{ border: '1px solid #e2e8f0', padding: '15px', textAlign: 'left', color: '#1b315b', fontSize: '14px', width: '50%' }}>What Is Not Included</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '10px', color: '#475569' }}>
                    <b>Zero paper cost guarantee:</b> Solar Eco Grid selects the most suitable components that go in your solar plant. you don't have to pay out of your pocket for any repairs, replacements or spare parts that are required during regular maintenance over the next 5 year.
                  </td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '10px', color: '#475569' }}>
                    Any external damage due to human intervention or unpredictable nature events will make the warranty void.
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '10px', color: '#475569' }}>
                    <b>Solar Panel Door 2 Door warranty</b><br/>No question asked solar panel replacement with no dependency on OEM.
                  </td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '10px', color: '#475569' }}>
                    Any external damage due to human intervention or unpredictable nature events will make the warranty void.
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '10px', color: '#475569' }}>
                    <b>Anti Cyclone:</b><br/>Your structures are certified for high wind speeds of upto 200 KMPH. In case there is any damage to your plant due to weather conditions like cyclones below this threshold, Solar Eco Grid will repair/replace your plant for free.
                  </td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '10px', color: '#475569' }}>
                    Any external damage due to human intervention
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '10px', color: '#475569' }}>
                    <b>Upto Rs. 1 Lac water leakage coverage:</b><br/>We use Seal to safeguard you against any water seepage issues on your roof. Hence we provide a water leakage cover of upto INR 1 Lac in case of any damages.
                  </td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '10px', color: '#475569' }}>
                    Any seepage in non-solar area due to pre-existing condition or any other non-related work.
                  </td>
                </tr>
              </tbody>
            </table>

            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #e2e8f0', padding: '15px', textAlign: 'left', color: '#1b315b', fontSize: '14px', width: '70%' }}>Components</th>
                  <th style={{ border: '1px solid #e2e8f0', padding: '15px', textAlign: 'left', color: '#1b315b', fontSize: '14px', width: '30%' }}>Years</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '12px', color: '#1b315b' }}>Solar Panel (production)</td><td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '12px', color: '#1b315b' }}>30 years</td></tr>
                <tr><td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '12px', color: '#1b315b' }}>Solar Panel (product)</td><td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '12px', color: '#1b315b' }}>12 years</td></tr>
                <tr><td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '12px', color: '#1b315b' }}>Inverter</td><td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '12px', color: '#1b315b' }}>7 years</td></tr>
                <tr><td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '12px', color: '#1b315b' }}>Other components</td><td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '12px', color: '#1b315b' }}>5 years</td></tr>
                <tr><td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '12px', color: '#1b315b' }}>Plant performance guarantee</td><td style={{ border: '1px solid #e2e8f0', padding: '15px', fontSize: '12px', color: '#1b315b' }}>Applicable</td></tr>
              </tbody>
            </table>

            <div style={{ fontSize: '10px', color: '#1b315b', lineHeight: '1.4' }}>
              Terms and Conditions<br/>
              1. Please note that additional charges may apply for changes to your electricity bill, such as load, name, or phase adjustments.<br/>
              2. To process your application, please provide all necessary documents, including PAN card, Aadhaar card, and electricity bill.<br/>
              3. Customers opting for financing may need to submit extra documents.<br/>
              4. Delays due to missing or incomplete documents are not Solar Eco Grid's responsibility.<br/>
              5. Our Solar system will generate average of 4 units per kw of electricity depending upon service and maintenance.
            </div>
          </div>
        </div>

        {/* PAGE 9: END PAGE */}
        <div ref={el => pagesRef.current[8] = el} style={pageStyle}>
          <div style={{ padding: '60px', position: 'relative', zIndex: 10 }}>
            <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1b315b', textAlign: 'center', marginBottom: '40px' }}>
              Start your solar journey with us
            </h1>
          </div>

          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {imagesBase64.end && <img src={imagesBase64.end} style={{ width: '80%', height: '400px', objectFit: 'cover' }} alt="End" />}
            
            <div style={{ backgroundColor: '#1b315b', padding: '40px', width: '60%', position: 'absolute', bottom: '150px', left: '0' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', color: 'white' }}>
                 <div style={{ backgroundColor: 'white', color: '#1b315b', padding: '8px', borderRadius: '50%' }}><Phone size={16} /></div>
                 <span style={{ fontSize: '16px' }}>+91-9889555339</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', color: 'white' }}>
                 <div style={{ backgroundColor: 'white', color: '#1b315b', padding: '8px', borderRadius: '50%' }}><Mail size={16} /></div>
                 <span style={{ fontSize: '16px' }}>info@ecogridinfra.in</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: 'white' }}>
                 <div style={{ backgroundColor: 'white', color: '#1b315b', padding: '8px', borderRadius: '50%' }}><Globe size={16} /></div>
                 <span style={{ fontSize: '16px' }}>www.solarecogrid.com</span>
               </div>
            </div>
          </div>

          <BottomTriangles />
          <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
            <span style={{ fontSize: '20px', color: '#111827', fontWeight: '500' }}>Eco Grid Infra Pvt. Ltd</span>
          </div>
        </div>

        {/* PAGE 10: FINANCING (Only if required) */}
        {quotation.loanDetails?.required && (
          <div ref={el => pagesRef.current[9] = el} style={{ ...pageStyle, padding: '50px' }}>
            <TopRightTriangle />
            <LogoHeader logo={logoBase64} />
            
            <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#1b315b', textAlign: 'center', marginTop: '60px', marginBottom: '40px', position: 'relative', zIndex: 10 }}>
              Financing & Loan Structure
            </h1>
            
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ backgroundColor: 'white', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ color: '#1b315b', fontSize: '18px', fontWeight: '900', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px' }}>Bank Information</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>BANK NAME</p>
                    <p style={{ margin: 0, fontSize: '18px', color: '#111827', fontWeight: '900' }}>{quotation.loanDetails.bankName}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>BRANCH</p>
                    <p style={{ margin: 0, fontSize: '18px', color: '#111827', fontWeight: '900' }}>{quotation.loanDetails.bankAddress}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '30px' }}>
                <div style={{ flex: 1, backgroundColor: 'white', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>LOAN AMOUNT</p>
                  <p style={{ margin: 0, fontSize: '28px', color: '#1b315b', fontWeight: '900' }}>₹{quotation.loanDetails.loanAmount?.toLocaleString()}</p>
                </div>
                <div style={{ flex: 1, backgroundColor: 'white', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>MONTHLY EMI</p>
                  <p style={{ margin: 0, fontSize: '28px', color: '#1b315b', fontWeight: '900' }}>₹{quotation.loanDetails.emiAmount?.toLocaleString()}</p>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ color: '#1b315b', fontSize: '18px', fontWeight: '900', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '20px' }}>Repayment Terms</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>TENURE</span>
                  <span style={{ fontSize: '14px', color: '#111827', fontWeight: '900' }}>{quotation.loanDetails.tenureMonths} MONTHS</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>INTEREST RATE</span>
                  <span style={{ fontSize: '14px', color: '#111827', fontWeight: '900' }}>{quotation.loanDetails.interestRate}% P.A.</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>DOWN PAYMENT</span>
                  <span style={{ fontSize: '14px', color: '#111827', fontWeight: '900' }}>₹{quotation.loanDetails.downPayment?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'bold' }}>PROCESSING FEES</span>
                  <span style={{ fontSize: '14px', color: '#111827', fontWeight: '900' }}>₹{quotation.loanDetails.processingFees?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <BottomBand />
            <div style={{ position: 'absolute', bottom: '30px', left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
              <span style={{ fontSize: '18px', color: 'white', fontWeight: '500' }}>www.solarecogrid.com</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default QuotationViewPage;
