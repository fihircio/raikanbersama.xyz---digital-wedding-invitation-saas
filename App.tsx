
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter, Routes, Route, useParams, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import TabButton from './components/Editor/TabButton';
import CatalogPage from './components/Catalog/CatalogPage';
import PricingPage from './components/Pricing/PricingPage';
import { Invitation, ItineraryItem, ContactPerson, RSVP, GuestWish } from './types';
import { MOCK_INVITATIONS, MOCK_RSVPS, THEME_COLORS } from './constants';
import { generatePantun, generateStory } from './services/geminiService';

// --- Shared Utility Components ---

const Countdown: React.FC<{ targetDate: string, color: string }> = ({ targetDate, color }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex justify-center gap-3 my-10">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center shadow-sm border border-white/40 mb-1">
            <span className="text-xl font-bold font-serif" style={{ color }}>{value}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">{label}</span>
        </div>
      ))}
    </div>
  );
};

const SimpleCalendar: React.FC<{ date: string, color: string }> = ({ date, color }) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return <div className="p-10 text-center text-gray-400 font-serif italic">Sila pilih tarikh yang sah.</div>;
  
  const month = d.getMonth();
  const year = d.getFullYear();
  const dayOfMonth = d.getDate();

  const monthName = d.toLocaleString('ms-MY', { month: 'long' });
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-inner text-center">
      <div className="mb-6">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">{monthName}</p>
        <p className="text-xs font-bold text-gray-300 tracking-widest">{year}</p>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['A', 'I', 'S', 'R', 'K', 'J', 'S'].map(d => (
          <div key={d} className="text-[9px] font-bold text-gray-300 py-2">{d}</div>
        ))}
        {blanks.map(b => (
          <div key={`blank-${b}`} className="w-8 h-8" />
        ))}
        {days.map(day => (
          <div 
            key={day} 
            className={`w-8 h-8 flex items-center justify-center rounded-full text-[10px] font-bold transition-all ${day === dayOfMonth ? 'text-white shadow-xl scale-110 z-10' : 'text-gray-400'}`}
            style={day === dayOfMonth ? { backgroundColor: color } : {}}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Cover Section (Splash Screen) ---

const CoverSection: React.FC<{ invitation: Invitation, onOpen: () => void, isClosing: boolean }> = ({ invitation, onOpen, isClosing }) => {
  const formattedDate = useMemo(() => {
    const d = new Date(invitation.event_date);
    return isNaN(d.getTime()) ? 'Tarikh Belum Ditetapkan' : d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [invitation.event_date]);

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center text-center px-10 transition-all duration-1000 ease-in-out ${isClosing ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
      {/* Background with Blur Overlay */}
      <div 
        className="absolute inset-0 z-[-1]"
        style={{ 
          backgroundImage: `url(${invitation.settings.background_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/60"></div>
      </div>

      <div className="animate-fade-in space-y-10">
        <p className="uppercase tracking-[0.4em] text-[10px] font-bold text-gray-600 mb-2">
          {invitation.settings.hero_title || 'Walimatulurus'}
        </p>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-cursive font-bold text-gray-800" style={{ color: invitation.settings.groom_color }}>
            {invitation.groom_name}
          </h1>
          <p className="text-3xl font-serif italic text-gray-400">&</p>
          <h1 className="text-5xl md:text-6xl font-cursive font-bold text-gray-800" style={{ color: invitation.settings.bride_color }}>
            {invitation.bride_name}
          </h1>
        </div>

        <div className="space-y-2 pt-4">
          <p className="text-sm font-serif font-bold text-gray-500 tracking-wide uppercase">{formattedDate}</p>
          <div className="w-12 h-px bg-gray-300 mx-auto" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{invitation.location_name}</p>
        </div>

        <button 
          onClick={onOpen}
          className="group mt-12 flex items-center space-x-4 px-10 py-4 bg-white/90 border border-gray-200 rounded-full shadow-2xl hover:bg-white transition-all transform active:scale-95 duration-500"
        >
          <svg className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-700">Buka</span>
          <svg className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// --- Invitation Content Sections ---

const HeroSection: React.FC<{ invitation: Invitation, guestName?: string }> = ({ invitation, guestName }) => {
  const isMinimal = invitation.template_id === 'minimal-light';

  const greetingStyles = {
    color: invitation.settings.greeting_color || '#FFFFFF',
    fontSize: invitation.settings.greeting_size ? `${invitation.settings.greeting_size}px` : undefined,
  };

  const heroStyles = {
    color: invitation.settings.hero_color || '#FFFFFF',
    fontSize: invitation.settings.hero_size ? `${invitation.settings.hero_size}px` : undefined,
  };

  if (isMinimal) {
    return (
      <div className="pt-24 pb-8 px-8 text-center bg-gray-50/50">
        <div className="max-w-[320px] mx-auto mb-10 animate-fade-in">
           <div className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
             <img src={invitation.settings.background_image} alt="Couple" className="w-full h-full object-cover" />
           </div>
        </div>
        <div className="animate-slide-up space-y-4">
          <h2 className="font-serif italic font-bold leading-tight" style={greetingStyles}>
             {invitation.settings.greeting_text || 'Assalammualaikum W.B.T'}
           </h2>
           <p className="uppercase tracking-[0.4em] font-bold" style={heroStyles}>
            {invitation.settings.hero_title || 'Raikan Cinta Kami'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[60vh] relative flex items-center justify-center text-center p-8 overflow-hidden">
      <div 
        className="absolute inset-0 z-0 scale-105 brightness-75 transition-all duration-1000"
        style={{ 
          backgroundImage: `url(${invitation.settings.background_image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-1"></div>
      <div className="relative z-10 text-white animate-fade-in px-4">
        {guestName && (
          <div className="inline-block mb-8 animate-slide-up">
             <p className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/30 shadow-2xl">
              Khas buat <span className="text-rose-200">{guestName}</span>
            </p>
          </div>
        )}
        <div className="space-y-6">
          <h2 className="font-serif font-bold italic drop-shadow-2xl leading-tight" style={greetingStyles}>
            {invitation.settings.greeting_text || 'Assalammualaikum W.B.T'}
          </h2>
          <p className="uppercase tracking-[0.4em] font-bold opacity-90 block" style={heroStyles}>
            {invitation.settings.hero_title || 'Raikan Cinta Kami'}
          </p>
        </div>
        <div className="w-12 h-px bg-white/50 mx-auto mt-10" />
      </div>
    </div>
  );
};

const Guestbook: React.FC<{ wishes: GuestWish[], primaryColor: string }> = ({ wishes, primaryColor }) => (
  <div className="mt-24 text-center px-4 pb-48">
    <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-10 border-b pb-2 inline-block font-serif">Ucapan & Doa</h4>
    <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar py-4 px-2">
      {wishes.length > 0 ? wishes.map((wish) => (
        <div key={wish.id} className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm text-left relative overflow-hidden group hover:shadow-md transition">
          <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: primaryColor }} />
          <p className="text-sm font-bold text-gray-800 mb-2 font-serif italic">{wish.name}</p>
          <p className="text-sm text-gray-500 font-light italic leading-relaxed">"{wish.message}"</p>
          <p className="text-[9px] text-gray-300 font-bold uppercase tracking-tighter mt-4">{new Date(wish.created_at).toLocaleDateString()}</p>
        </div>
      )) : (
        <p className="text-gray-400 italic text-sm py-10">Belum ada ucapan. Jadilah yang pertama!</p>
      )}
    </div>
  </div>
);

// --- Template Renderer ---

const InvitationContent: React.FC<{ invitation: Invitation, guestName?: string, isPreview?: boolean }> = ({ invitation, guestName, isPreview }) => {
  const [showRsvp, setShowRsvp] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeModal, setActiveModal] = useState<'map' | 'calendar' | 'contact' | null>(null);
  const [formData, setFormData] = useState({ name: guestName || '', phone: '', pax: 1, attending: true, message: '' });
  
  const primaryColor = invitation.settings.primary_color;
  const isMinimal = invitation.template_id === 'minimal-light';

  const handleOpenInvitation = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(true);
    }, 1000); // Duration matches animation
  };

  const handleRsvpSubmit = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setShowRsvp(false);
      setIsSuccess(false);
    }, 2000);
  };

  const formattedDate = useMemo(() => {
    const d = new Date(invitation.event_date);
    return isNaN(d.getTime()) ? 'Tarikh Belum Ditetapkan' : d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [invitation.event_date]);

  const invitationTextStyles = {
    color: invitation.settings.invitation_color || '#6B7280',
    fontSize: invitation.settings.invitation_size ? `${invitation.settings.invitation_size}px` : undefined,
  };

  return (
    <>
      {!isOpen && <CoverSection invitation={invitation} onOpen={handleOpenInvitation} isClosing={isClosing} />}
      
      <div className={`relative min-h-screen font-sans text-gray-900 bg-white transition-opacity duration-1000 ${activeModal ? 'overflow-hidden' : ''} ${isMinimal ? 'bg-gray-50/30' : ''} ${!isOpen ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100'}`}>
        <HeroSection invitation={invitation} guestName={guestName} />

        <div className={`relative ${isMinimal ? 'bg-transparent' : '-mt-12 bg-white rounded-t-[3.5rem] shadow-2xl'} z-20 px-8 py-16 text-center transition-all duration-700`}>
          {/* Order: Nama Tuan Rumah -> Teks Jemputan -> Couple Names -> Date */}
          
          <div className="mb-14 space-y-6">
            <p className="text-xl font-serif italic text-gray-700 font-bold" style={{ color: invitation.settings.host_color }}>
              {invitation.host_names}
            </p>
            
            <p className="leading-relaxed font-light max-w-[300px] mx-auto italic" style={invitationTextStyles}>
              {invitation.settings.invitation_text || `Dengan penuh kesyukuran ke hadrat Ilahi, kami menjemput anda ke majlis perkahwinan anakanda kami yang tercinta:`}
            </p>
          </div>
          
          <div className="space-y-4 mb-14 animate-fade-in">
            <h3 className="text-5xl md:text-6xl font-cursive font-bold" style={{ color: invitation.settings.groom_color || primaryColor }}>
              {invitation.groom_name}
            </h3>
            <p className="text-gray-300 font-serif italic text-xl">&</p>
            <h3 className="text-5xl md:text-6xl font-cursive font-bold" style={{ color: invitation.settings.bride_color || primaryColor }}>
              {invitation.bride_name}
            </h3>
          </div>

          <div className="mb-16">
            <p className="text-2xl font-serif italic mb-4 font-bold" style={{ color: invitation.settings.date_color || primaryColor }}>
              {formattedDate}
            </p>
            {invitation.settings.show_countdown && (
              <Countdown targetDate={invitation.event_date} color={invitation.settings.date_color || primaryColor} />
            )}
          </div>

          {invitation.settings.pantun && (
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] italic text-gray-500 font-serif leading-relaxed text-sm mb-16 border border-gray-100 shadow-inner">
              "{invitation.settings.pantun}"
            </div>
          )}

          <div className={`space-y-6 p-8 bg-white rounded-[2.5rem] border border-gray-100 mb-16 shadow-sm ${isMinimal ? 'max-w-[320px] mx-auto' : ''}`}>
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-gray-50 rounded-full shadow-sm" style={{ color: primaryColor }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <span className="font-bold text-gray-800 text-lg tracking-tight">{invitation.start_time} - {invitation.end_time}</span>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em]">Waktu Majlis</span>
            </div>
            
            <div className="w-full h-px bg-gray-200/50" />

            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-gray-50 rounded-full shadow-sm" style={{ color: primaryColor }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <span className="font-bold text-gray-800 text-lg tracking-tight">{invitation.location_name}</span>
              <p className="text-[10px] text-gray-400 font-medium px-4">{invitation.address}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sticky bottom-8 z-30 px-2 drop-shadow-2xl">
            <button 
              onClick={() => setShowRsvp(true)} 
              className="w-full py-5 text-white font-bold rounded-3xl shadow-2xl transition transform active:scale-95 hover:brightness-110 tracking-[0.2em] text-xs uppercase" 
              style={{ backgroundColor: primaryColor }}
            >
              Sahkan Kehadiran
            </button>
          </div>

          {invitation.settings.our_story && (
            <div className="mt-24 text-left">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 border-b pb-2">
                {invitation.settings.story_title || 'Kisah Cinta Kami'}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed italic font-light">
                {invitation.settings.our_story}
              </p>
            </div>
          )}

          <div className="mt-24 text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-10 border-b pb-2">Atur Cara Majlis</h4>
            <div className="space-y-8">
              {invitation.itinerary.map((item, idx) => (
                <div key={item.id} className="flex space-x-6">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: primaryColor }} />
                    {idx !== invitation.itinerary.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-2 mb-2" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-bold text-gray-800 font-serif italic">{item.time}</p>
                    <p className="text-sm text-gray-500 font-light">{item.activity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {invitation.settings.show_gallery && invitation.gallery && invitation.gallery.length > 0 && (
            <div className="mt-24 text-center">
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-10 border-b pb-2 inline-block font-serif">Kenangan Abadi</h4>
              <div className="grid grid-cols-2 gap-4">
                {invitation.gallery.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Guestbook wishes={invitation.wishes} primaryColor={primaryColor} />
        </div>

        {/* Floating Bottom Nav */}
        <div className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-[80] w-[85%] max-w-[340px] transition-all duration-500 ${activeModal ? 'translate-y-32 opacity-0' : 'translate-y-0 opacity-100'}`}>
          <div className="glass rounded-full px-6 py-4 flex justify-between items-center shadow-2xl border border-white/40 ring-2 ring-rose-50/50">
            <button onClick={() => setActiveModal('map')} className="flex flex-col items-center gap-1 group outline-none">
              <div className="p-2 rounded-full group-hover:bg-rose-50 transition-colors" style={{ color: primaryColor }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-rose-600">Lokasi</span>
            </button>
            <div className="w-px h-6 bg-gray-200/50" />
            <button onClick={() => setActiveModal('calendar')} className="flex flex-col items-center gap-1 group outline-none">
              <div className="p-2 rounded-full group-hover:bg-rose-50 transition-colors" style={{ color: primaryColor }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-rose-600">Kalendar</span>
            </button>
            <div className="w-px h-6 bg-gray-200/50" />
            <button onClick={() => setActiveModal('contact')} className="flex flex-col items-center gap-1 group outline-none">
              <div className="p-2 rounded-full group-hover:bg-rose-50 transition-colors" style={{ color: primaryColor }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-rose-600">Hubungi</span>
            </button>
          </div>
        </div>

        {/* Feature Modals */}
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-[400px] rounded-t-[3rem] sm:rounded-[3.5rem] p-10 shadow-2xl relative animate-slide-up max-h-[80vh] overflow-y-auto no-scrollbar">
              <button 
                onClick={() => setActiveModal(null)} 
                className="absolute top-6 right-8 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-rose-600 transition shadow-inner outline-none"
              >
                &times;
              </button>

              {activeModal === 'map' && (
                <div className="space-y-8 py-4">
                  <div className="text-center">
                    <h3 className="text-2xl font-serif italic font-bold text-gray-800 mb-2">Lokasi Majlis</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{invitation.location_name}</p>
                  </div>
                  <div className="aspect-video w-full rounded-3xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm relative group">
                    {invitation.google_maps_url ? (
                      <iframe 
                        title="location-map"
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        style={{ border: 0 }} 
                        src={invitation.google_maps_url.includes('embed') ? invitation.google_maps_url : `https://www.google.com/maps/embed/v1/place?key=MAPS_API_KEY&q=${encodeURIComponent(invitation.address)}`} 
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 font-serif italic text-sm p-10 text-center space-y-2">
                        <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                        <p>Tiada Peta Ditetapkan</p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <a href={invitation.google_maps_url} target="_blank" rel="noreferrer" className="py-4 bg-gray-50 rounded-2xl text-center text-[10px] font-bold uppercase tracking-widest text-gray-700 hover:bg-white border border-gray-100 transition shadow-sm">G-Maps</a>
                    <a href={invitation.waze_url} target="_blank" rel="noreferrer" className="py-4 bg-gray-50 rounded-2xl text-center text-[10px] font-bold uppercase tracking-widest text-gray-700 hover:bg-white border border-gray-100 transition shadow-sm">Waze App</a>
                  </div>
                </div>
              )}

              {activeModal === 'calendar' && (
                <div className="space-y-8 py-4">
                  <div className="text-center">
                    <h3 className="text-2xl font-serif italic font-bold text-gray-800 mb-2">Simpan Tarikh</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Raikan Bersama Kami</p>
                  </div>
                  <SimpleCalendar date={invitation.event_date} color={primaryColor} />
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waktu Mula</span>
                      <span className="text-sm font-bold text-gray-700">{invitation.start_time}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200/50 pt-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waktu Tamat</span>
                      <span className="text-sm font-bold text-gray-700">{invitation.end_time}</span>
                    </div>
                  </div>
                  <button 
                    className="w-full py-5 text-white font-bold rounded-2xl shadow-xl transition transform active:scale-95 uppercase text-[10px] tracking-widest"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Tambah Ke Kalendar
                  </button>
                </div>
              )}

              {activeModal === 'contact' && (
                <div className="space-y-8 py-4">
                  <div className="text-center">
                    <h3 className="text-2xl font-serif italic font-bold text-gray-800 mb-2">Hubungi Keluarga</h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Pertanyaan & Bantuan</p>
                  </div>
                  <div className="space-y-4">
                    {invitation.contacts.length > 0 ? invitation.contacts.map((contact) => (
                      <a key={contact.id} href={`https://wa.me/${contact.phone}`} className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100 hover:shadow-lg transition group">
                          <div>
                            <p className="text-sm font-bold text-gray-800">{contact.name}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{contact.relation}</p>
                          </div>
                          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition shadow-inner">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.274 1.507 4.99 1.508 5.403.002 9.802-4.398 9.804-9.802.002-5.402-4.398-9.803-9.805-9.803-5.404 0-9.803 4.399-9.805 9.803-.001 1.815.512 3.518 1.481 4.92l-.934 3.415 3.469-.911z"></path></svg>
                          </div>
                      </a>
                    )) : (
                      <div className="py-10 text-center text-gray-400 font-serif italic text-sm">Tiada kenalan ditetapkan.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {showRsvp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all animate-fade-in">
            <div className="bg-white w-full max-w-[360px] rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden transition-all duration-500 ease-in-out">
              {isSuccess ? (
                <div className="text-center py-10 animate-scale-in">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-gray-800 mb-2 italic">Alhamdulillah!</h3>
                  <p className="text-sm text-gray-400 leading-relaxed px-4">Terima kasih atas maklum balas anda. Jumpa nanti!</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-serif font-bold text-gray-800 italic">Sahkan Kehadiran</h3>
                    <button onClick={() => setShowRsvp(false)} className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-300 transform active:rotate-90">
                      &times;
                    </button>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-4 text-left">
                      <div className="relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute -top-2 left-5 px-1 bg-white z-10">Nama Tetamu</label>
                        <input 
                          placeholder="Masukkan nama penuh" 
                          className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-rose-100 focus:bg-white transition-all duration-300 text-sm outline-none font-medium" 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                        />
                      </div>
                      
                      <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[2rem] animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <button 
                          onClick={() => setFormData({...formData, attending: true})} 
                          className={`flex-1 py-4 rounded-[1.5rem] font-bold text-[10px] uppercase tracking-widest transition-all duration-500 transform active:scale-95 ${formData.attending ? 'bg-green-600 text-white shadow-xl translate-y-[-2px]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Hadir
                        </button>
                        <button 
                          onClick={() => setFormData({...formData, attending: false})} 
                          className={`flex-1 py-4 rounded-[1.5rem] font-bold text-[10px] uppercase tracking-widest transition-all duration-500 transform active:scale-95 ${!formData.attending ? 'bg-rose-600 text-white shadow-xl translate-y-[-2px]' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          Maaf
                        </button>
                      </div>

                      <div className="overflow-hidden">
                        {formData.attending ? (
                          <div className="animate-scale-in pt-2">
                            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[1.5rem] px-6 py-5 justify-between shadow-inner">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bilangan Tetamu</span>
                              <div className="flex items-center space-x-6">
                                <button 
                                  onClick={() => setFormData({...formData, pax: Math.max(1, formData.pax-1)})} 
                                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-rose-500 font-bold text-xl hover:bg-rose-50 transition active:scale-90"
                                >
                                  -
                                </button>
                                <span className="font-bold text-lg w-6 text-center">{formData.pax}</span>
                                <button 
                                  onClick={() => setFormData({...formData, pax: formData.pax+1})} 
                                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-rose-500 font-bold text-xl hover:bg-rose-50 transition active:scale-90"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="animate-fade-in pt-2">
                            <p className="text-[10px] text-gray-400 italic text-center leading-relaxed">Kami mendoakan yang terbaik untuk urusan anda.</p>
                          </div>
                        )}
                      </div>

                      <div className="relative pt-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute top-0 left-5 px-1 bg-white z-10">Titipkan Ucapan</label>
                        <textarea 
                          placeholder="Selamat pengantin baru..." 
                          rows={3} 
                          className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-rose-100 focus:bg-white transition-all duration-300 text-sm outline-none font-medium leading-relaxed" 
                          value={formData.message} 
                          onChange={e => setFormData({...formData, message: e.target.value})} 
                        />
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleRsvpSubmit} 
                      className="w-full py-5 text-white font-bold rounded-[1.5rem] shadow-2xl transition-all duration-500 transform active:scale-95 hover:brightness-110 tracking-[0.2em] text-[10px] uppercase animate-slide-up shadow-rose-100" 
                      style={{ backgroundColor: primaryColor, animationDelay: '0.4s' }}
                    >
                      Hantar RSVP
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="py-24 text-center bg-gray-50">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em] mb-4">Ikhlas Daripada</p>
          <p className="text-xl font-serif italic text-gray-600 px-10">{invitation.host_names}</p>
          <div className="mt-16 opacity-40 hover:opacity-100 transition duration-500">
            <p className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">Powered by</p>
            <p className="text-sm font-serif font-bold text-rose-600">RaikanBersama.xyz</p>
          </div>
        </div>
      </div>
    </>
  );
};

// --- Dashboard & Analytics Components ---

const ManageInvitation = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('guests');
  const [magicGuest, setMagicGuest] = useState('');
  const [magicLink, setMagicLink] = useState('');

  const invitation = MOCK_INVITATIONS.find(i => i.id === id);
  const rsvps = MOCK_RSVPS.filter(r => r.invitation_id === id);

  const stats = useMemo(() => {
    const totalPax = rsvps.reduce((acc, curr) => acc + (curr.is_attending ? curr.pax : 0), 0);
    const attendingCount = rsvps.filter(r => r.is_attending).length;
    const notAttendingCount = rsvps.filter(r => !r.is_attending).length;
    return { totalPax, attendingCount, notAttendingCount };
  }, [rsvps]);

  if (!invitation) return <div className="pt-32 text-center font-serif italic text-gray-400">Invitation not found.</div>;

  const handleGenerateMagic = () => {
    if (!magicGuest) return;
    const encoded = encodeURIComponent(magicGuest);
    const baseUrl = window.location.origin + window.location.pathname;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    setMagicLink(`${cleanBase}#/i/${invitation.slug}?to=${encoded}`);
  };

  const shareSpecificLink = (guestName: string) => {
    const encoded = encodeURIComponent(guestName);
    const baseUrl = window.location.origin + window.location.pathname;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const link = `${cleanBase}#/i/${invitation.slug}?to=${encoded}`;
    const text = `Assalamualaikum! Ini kad jemputan khas buat anda: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Link to="/dashboard" className="text-rose-600 font-bold text-xs uppercase tracking-widest hover:underline">&larr; Dashboard</Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Analytics & Guests</span>
            </div>
            <h2 className="text-4xl font-serif font-bold text-gray-900 italic">{invitation.groom_name} & {invitation.bride_name}</h2>
          </div>
          <div className="flex space-x-2">
            <Link to={`/edit/${invitation.id}`} className="bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-50 transition">Editor Studio</Link>
            <Link to={`/i/${invitation.slug}`} className="bg-rose-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-rose-200 hover:bg-rose-700 transition">View Live Page</Link>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Kad Dibuka', value: invitation.views, icon: '👁️', color: 'bg-blue-50 text-blue-600' },
            { label: 'Jumlah Pax', value: stats.totalPax, icon: '👥', color: 'bg-green-50 text-green-600' },
            { label: 'Hadir', value: stats.attendingCount, icon: '✅', color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Ucapan', value: invitation.wishes.length, icon: '💌', color: 'bg-purple-50 text-purple-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-md transition">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl mb-4 ${stat.color}`}>{stat.icon}</div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Dashboard Tabs */}
        <div className="flex border-b border-gray-200 mb-8 space-x-10">
          <button onClick={() => setActiveTab('guests')} className={`pb-4 text-[11px] font-bold uppercase tracking-[0.2em] border-b-2 transition ${activeTab === 'guests' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Guest List</button>
          <button onClick={() => setActiveTab('wishes')} className={`pb-4 text-[11px] font-bold uppercase tracking-[0.2em] border-b-2 transition ${activeTab === 'wishes' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Wishes</button>
          <button onClick={() => setActiveTab('magic')} className={`pb-4 text-[11px] font-bold uppercase tracking-[0.2em] border-b-2 transition ${activeTab === 'magic' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Magic Generator</button>
        </div>

        {/* Tab Content: Guest List */}
        {activeTab === 'guests' && (
          <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
            <div className="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-serif italic font-bold text-xl">Senarai RSVP</h3>
                <div className="flex space-x-2">
                   <button className="text-[10px] font-bold text-rose-600 bg-rose-50 px-4 py-2 rounded-full hover:bg-rose-100 transition">Export CSV</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <tr>
                      <th className="px-8 py-4">Nama Tetamu</th>
                      <th className="px-8 py-4 text-center">Kehadiran</th>
                      <th className="px-8 py-4 text-center">Pax</th>
                      <th className="px-8 py-4">Magic Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {rsvps.map((rsvp) => (
                      <tr key={rsvp.id} className="hover:bg-gray-50 transition group">
                        <td className="px-8 py-6">
                          <p className="font-bold text-gray-800 text-sm">{rsvp.guest_name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{rsvp.phone_number}</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${rsvp.is_attending ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                            {rsvp.is_attending ? 'Hadir' : 'Maaf'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center text-sm font-bold text-gray-600">{rsvp.pax}</td>
                        <td className="px-8 py-6">
                          <button onClick={() => shareSpecificLink(rsvp.guest_name)} className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase tracking-tighter flex items-center gap-1 group-hover:scale-105 transition">
                            Share WhatsApp &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="w-full lg:w-[350px] space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Recent Activity
                </h4>
                <div className="space-y-6">
                   {rsvps.slice(0, 4).map((r, i) => (
                     <div key={i} className="flex gap-4 items-start">
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${r.is_attending ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                          {r.guest_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-800 leading-tight">
                            <span className="text-rose-600">{r.guest_name}</span> has RSVP'd {r.is_attending ? 'Yes' : 'No'}
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Recently</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Wishes */}
        {activeTab === 'wishes' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
             {invitation.wishes.length > 0 ? invitation.wishes.map((wish) => (
               <div key={wish.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative group hover:shadow-md transition">
                  <p className="text-sm font-bold text-gray-800 mb-3 font-serif italic">{wish.name}</p>
                  <p className="text-sm text-gray-500 leading-relaxed italic">"{wish.message}"</p>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-6">{new Date(wish.created_at).toLocaleDateString()}</p>
               </div>
             )) : (
               <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                  <p className="text-gray-400 italic">Belum ada ucapan lagi.</p>
               </div>
             )}
          </div>
        )}

        {/* Tab Content: Magic Invite Tool */}
        {activeTab === 'magic' && (
          <div className="max-w-2xl animate-fade-in">
            <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100">
              <h3 className="font-serif italic font-bold text-2xl mb-4">Magic Link Laboratory</h3>
              <p className="text-gray-400 text-sm mb-12 leading-relaxed">
                Hasilkan link khas untuk setiap tetamu. Nama mereka akan terpapar secara automatik apabila mereka membuka kad jemputan.
              </p>
              
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Nama Penuh Tetamu</label>
                  <div className="flex gap-3">
                    <input 
                      placeholder="E.g. Ahmad Suhairi" 
                      className="flex-1 px-8 py-5 bg-gray-50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-rose-200 transition text-sm font-bold"
                      value={magicGuest}
                      onChange={e => setMagicGuest(e.target.value)}
                    />
                    <button 
                      onClick={handleGenerateMagic}
                      className="bg-rose-600 text-white px-10 py-5 rounded-3xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-rose-100 hover:bg-rose-700 transition"
                    >
                      Jana Link
                    </button>
                  </div>
                </div>

                {magicLink && (
                  <div className="pt-8 animate-slide-up">
                    <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 relative">
                      <label className="text-[10px] font-bold text-rose-300 uppercase tracking-widest absolute -top-2 left-6 px-2 bg-white rounded-full border border-gray-50">Link Sedia Dikongsi</label>
                      <p className="text-[11px] font-mono text-gray-400 break-all mb-8 leading-loose">{magicLink}</p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => { navigator.clipboard.writeText(magicLink); alert('Link disalin!'); }}
                          className="bg-white text-gray-700 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-sm border border-gray-100 hover:bg-gray-50 transition"
                        >
                          Salin Link
                        </button>
                        <a href={`https://wa.me/?text=${encodeURIComponent('Assalamualaikum! Ini kad jemputan khas buat anda: ' + magicLink)}`} target="_blank" rel="noreferrer" className="bg-green-500 text-white py-4 rounded-2xl text-center text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:bg-green-600 transition">
                          Hantar WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [invitations] = useState<Invitation[]>(MOCK_INVITATIONS);
  
  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-serif italic tracking-tight">Design Studio</h2>
            <p className="text-gray-500 text-sm">Uruskan semua jemputan digital anda di sini.</p>
          </div>
          <button className="bg-rose-600 text-white px-8 py-3.5 rounded-full font-bold flex items-center space-x-2 hover:bg-rose-700 shadow-2xl shadow-rose-200 transition transform active:scale-95 uppercase text-[10px] tracking-widest">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Bina Baru</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {invitations.map((inv) => (
            <div key={inv.id} className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-700">
              <div className="h-64 bg-gray-200 relative overflow-hidden">
                <img src={inv.settings.background_image} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" />
                <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                  <span className="bg-white/90 backdrop-blur-md text-gray-700 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm">Live</span>
                  <div className="bg-rose-600 text-white px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> {inv.views} Views
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-1 font-serif italic text-gray-800">{inv.groom_name} & {inv.bride_name}</h3>
                <p className="text-xs text-gray-400 mb-10 tracking-widest font-bold uppercase">{new Date(inv.event_date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <div className="flex flex-col gap-3">
                  <div className="flex space-x-3">
                    <Link to={`/manage/${inv.id}`} className="flex-1 text-center py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-100 transition">Urus Tetamu</Link>
                    <Link to={`/edit/${inv.id}`} className="flex-1 text-center py-4 bg-gray-50 text-gray-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition">Ubah Reka</Link>
                  </div>
                  <Link to={`/i/${inv.slug}`} className="w-full text-center py-3 border border-gray-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:text-rose-600 hover:border-rose-100 transition duration-300">Buka Link Utama</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Editor = () => {
  const { id } = useParams<{ id: string }>();
  const [inv, setInv] = useState<Invitation | null>(null);
  const [activeTab, setActiveTab] = useState('utama');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const found = MOCK_INVITATIONS.find(item => item.id === id);
    if (found) {
      // Check for selected background from catalog
      const selectedBackground = sessionStorage.getItem('selectedBackground');
      if (selectedBackground) {
        const background = JSON.parse(selectedBackground);
        setInv({
          ...found,
          settings: {
            ...found.settings,
            background_image: background.url
          }
        });
        // Clear from sessionStorage after applying
        sessionStorage.removeItem('selectedBackground');
      } else {
        setInv(found);
      }
    }
  }, [id]);

  if (!inv) return <div className="pt-32 text-center font-serif italic text-gray-400 text-xl">Loading Studio...</div>;

  const handleAiPantun = async () => {
    setIsGenerating(true);
    const result = await generatePantun(inv.bride_name, inv.groom_name);
    setInv({ ...inv, settings: { ...inv.settings, pantun: result } });
    setIsGenerating(false);
  };

  const handleAiStory = async () => {
    setIsGenerating(true);
    const result = await generateStory(inv.bride_name, inv.groom_name, "Romantic & Modern");
    setInv({ ...inv, settings: { ...inv.settings, our_story: result } });
    setIsGenerating(false);
  };

  const updateField = (field: keyof Invitation, value: any) => {
    if (!inv) return;
    setInv({ ...inv, [field]: value });
  };

  const updateSettings = (field: keyof Invitation['settings'], value: any) => {
    if (!inv) return;
    setInv({ ...inv, settings: { ...inv.settings, [field]: value } });
  };

  const updateMoneyGift = (field: keyof Invitation['money_gift_details'], value: any) => {
    if (!inv) return;
    setInv({ ...inv, money_gift_details: { ...inv.money_gift_details, [field]: value } });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateField('gallery', [...(inv.gallery || []), base64String]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateMoneyGift('qr_url', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pt-16 h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-full md:w-[480px] bg-white border-r border-gray-200 flex flex-col h-full shadow-2xl z-20">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-bold font-serif italic text-gray-800 tracking-tight">Design Studio</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Crafting perfection</p>
          </div>
          <button className="bg-rose-600 text-white px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition shadow-lg shadow-rose-100">Save Changes</button>
        </div>
        
        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar bg-gray-50/50 px-2 sticky top-0">
          <TabButton label="Utama" isActive={activeTab === 'utama'} onClick={() => setActiveTab('utama')} />
          <TabButton label="Butiran" isActive={activeTab === 'butiran'} onClick={() => setActiveTab('butiran')} />
          <TabButton label="Media" isActive={activeTab === 'media'} onClick={() => setActiveTab('media')} />
          <TabButton label="Tetamu" isActive={activeTab === 'tetamu'} onClick={() => setActiveTab('tetamu')} />
          <TabButton label="Hadiah" isActive={activeTab === 'hadiah'} onClick={() => setActiveTab('hadiah')} />
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
          {activeTab === 'utama' && (
            <div className="space-y-10">
              <section className="space-y-8">
                <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Identiti Utama</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                        <span>Lelaki</span>
                        <input type="color" value={inv.settings.groom_color || '#000000'} onChange={(e) => updateSettings('groom_color', e.target.value)} className="w-4 h-4 rounded-full overflow-hidden border-none p-0 cursor-pointer" />
                      </label>
                      <input type="text" value={inv.groom_name} onChange={(e) => updateField('groom_name', e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                        <span>Perempuan</span>
                        <input type="color" value={inv.settings.bride_color || '#000000'} onChange={(e) => updateSettings('bride_color', e.target.value)} className="w-4 h-4 rounded-full overflow-hidden border-none p-0 cursor-pointer" />
                      </label>
                      <input type="text" value={inv.bride_name} onChange={(e) => updateField('bride_name', e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                      <span>Nama Tuan Rumah</span>
                      <input type="color" value={inv.settings.host_color || '#4B5563'} onChange={(e) => updateSettings('host_color', e.target.value)} className="w-4 h-4 rounded-full overflow-hidden border-none p-0 cursor-pointer" />
                    </label>
                    <input type="text" value={inv.host_names} onChange={(e) => updateField('host_names', e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-bold" />
                  </div>
                </div>
              </section>

              <section className="space-y-8 pt-10 border-t border-gray-100">
                <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Kustomasi Wording</h3>
                <div className="space-y-6">
                  {/* Greeting Swapped to Top */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kata Aluan (Greeting)</label>
                      <div className="flex gap-4">
                        <input type="color" value={inv.settings.greeting_color || '#FFFFFF'} onChange={(e) => updateSettings('greeting_color', e.target.value)} className="w-4 h-4 rounded-full border-none p-0 cursor-pointer" />
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] font-bold text-gray-400">Size</span>
                          <input type="range" min="10" max="60" value={inv.settings.greeting_size || '36'} onChange={(e) => updateSettings('greeting_size', e.target.value)} className="w-16 accent-rose-600" />
                        </div>
                      </div>
                    </div>
                    <input type="text" placeholder="Contoh: Assalammualaikum W.B.T" value={inv.settings.greeting_text || ''} onChange={(e) => updateSettings('greeting_text', e.target.value)} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-300 transition text-sm outline-none" />
                  </div>

                  {/* Hero Title */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Wording Utama (Hero)</label>
                      <div className="flex gap-4">
                        <input type="color" value={inv.settings.hero_color || '#FFFFFF'} onChange={(e) => updateSettings('hero_color', e.target.value)} className="w-4 h-4 rounded-full border-none p-0 cursor-pointer" />
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] font-bold text-gray-400">Size</span>
                          <input type="range" min="10" max="40" value={inv.settings.hero_size || '12'} onChange={(e) => updateSettings('hero_size', e.target.value)} className="w-16 accent-rose-600" />
                        </div>
                      </div>
                    </div>
                    <input type="text" placeholder="Contoh: Raikan Cinta Kami" value={inv.settings.hero_title || ''} onChange={(e) => updateSettings('hero_title', e.target.value)} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-300 transition text-sm outline-none" />
                  </div>

                  {/* Invitation Text */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Teks Jemputan</label>
                      <div className="flex gap-4">
                        <input type="color" value={inv.settings.invitation_color || '#6B7280'} onChange={(e) => updateSettings('invitation_color', e.target.value)} className="w-4 h-4 rounded-full border-none p-0 cursor-pointer" />
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] font-bold text-gray-400">Size</span>
                          <input type="range" min="10" max="24" value={inv.settings.invitation_size || '14'} onChange={(e) => updateSettings('invitation_size', e.target.value)} className="w-16 accent-rose-600" />
                        </div>
                      </div>
                    </div>
                    <textarea rows={3} placeholder="Wording jemputan..." value={inv.settings.invitation_text || ''} onChange={(e) => updateSettings('invitation_text', e.target.value)} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-300 transition text-sm outline-none italic leading-relaxed" />
                  </div>
                </div>
              </section>

              <section className="space-y-8 pt-10 border-t border-gray-100">
                <div className="flex items-center justify-between p-6 bg-rose-50 rounded-[2.5rem] border border-rose-100 shadow-inner group transition-all hover:shadow-md">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-rose-800 tracking-tight italic">Papar Undur Masa</span>
                    <span className="text-[9px] text-rose-300 uppercase font-bold tracking-widest">Show Countdown timer</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={inv.settings.show_countdown} 
                    onChange={(e) => updateSettings('show_countdown', e.target.checked)} 
                    className="w-6 h-6 accent-rose-600 cursor-pointer transition-transform hover:scale-110" 
                  />
                </div>
              </section>

              <section className="space-y-8 pt-10 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">AI Assistant</h3>
                  <div className="flex space-x-2">
                    <button onClick={handleAiPantun} disabled={isGenerating} className="text-[9px] bg-rose-50 text-rose-600 px-4 py-2 rounded-full font-bold hover:bg-rose-100 transition disabled:opacity-50 uppercase tracking-tighter">Magic Pantun</button>
                    <button onClick={handleAiStory} disabled={isGenerating} className="text-[9px] bg-rose-50 text-rose-600 px-4 py-2 rounded-full font-bold hover:bg-rose-100 transition disabled:opacity-50 uppercase tracking-tighter">Magic Story</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pantun / Kata Aluan</label>
                  <textarea rows={4} value={inv.settings.pantun} onChange={(e) => updateSettings('pantun', e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-3xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-medium italic leading-relaxed" />
                </div>
              </section>
            </div>
          )}

          {activeTab === 'butiran' && (
            <div className="space-y-10">
              <section className="space-y-8">
                <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Masa & Tarikh Majlis</h3>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                    <span>Tarikh Majlis</span>
                    <input type="color" value={inv.settings.date_color || '#1F2937'} onChange={(e) => updateSettings('date_color', e.target.value)} className="w-4 h-4 rounded-full overflow-hidden border-none p-0 cursor-pointer" />
                  </label>
                  <input 
                    type="date" 
                    value={inv.event_date} 
                    onChange={(e) => updateField('event_date', e.target.value)} 
                    className="w-full px-6 py-5 bg-white border-2 border-rose-100 rounded-2xl outline-none transition text-sm font-bold shadow-sm focus:border-rose-400 focus:ring-4 focus:ring-rose-50" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Jam Mula</label>
                    <input 
                      type="time" 
                      value={inv.start_time} 
                      onChange={(e) => updateField('start_time', e.target.value)} 
                      className="w-full px-6 py-5 bg-white border-2 border-rose-100 rounded-2xl outline-none text-sm font-bold shadow-sm transition-all focus:border-rose-400 focus:ring-4 focus:ring-rose-50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Jam Tamat</label>
                    <input 
                      type="time" 
                      value={inv.end_time} 
                      onChange={(e) => updateField('end_time', e.target.value)} 
                      className="w-full px-6 py-5 bg-white border-2 border-rose-100 rounded-2xl outline-none text-sm font-bold shadow-sm transition-all focus:border-rose-400 focus:ring-4 focus:ring-rose-50" 
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-8 pt-10 border-t border-gray-100">
                <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Lokasi & Peta</h3>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lokasi</label>
                  <input type="text" value={inv.location_name} onChange={(e) => updateField('location_name', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Alamat Penuh</label>
                  <textarea rows={2} value={inv.address} onChange={(e) => updateField('address', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    Google Maps URL 
                    <span className="text-[8px] bg-rose-50 text-rose-400 px-2 py-0.5 rounded-full border border-rose-100 font-bold">Use Embed Link</span>
                  </label>
                  <input type="text" value={inv.google_maps_url} placeholder="https://www.google.com/maps/embed?..." onChange={(e) => updateField('google_maps_url', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-[10px] font-mono outline-none transition-all focus:ring-2 focus:ring-rose-200" />
                </div>
              </section>

              <section className="space-y-8 pt-10 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Atur Cara Majlis</h3>
                  <button 
                    onClick={() => {
                      const newItem = { id: Date.now().toString(), time: '12:00 PM', activity: 'New Activity' };
                      updateField('itinerary', [...inv.itinerary, newItem]);
                    }}
                    className="text-[10px] bg-gray-100 px-6 py-2.5 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-4">
                  {inv.itinerary.map((item, index) => (
                    <div key={item.id} className="p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm space-y-4 group relative hover:shadow-md transition">
                      <button 
                        onClick={() => {
                          const newList = inv.itinerary.filter(i => i.id !== item.id);
                          updateField('itinerary', newList);
                        }}
                        className="absolute top-4 right-4 text-gray-300 hover:text-rose-500 transition text-2xl"
                      >
                        &times;
                      </button>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Waktu</label>
                          <input 
                            type="text" 
                            value={item.time} 
                            onChange={(e) => {
                              const newList = [...inv.itinerary];
                              newList[index].time = e.target.value;
                              updateField('itinerary', newList);
                            }}
                            className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl text-xs font-bold outline-none"
                            placeholder="Contoh: 12:00 PM"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Aktiviti / Acara</label>
                          <input 
                            type="text" 
                            value={item.activity} 
                            onChange={(e) => {
                              const newList = [...inv.itinerary];
                              newList[index].activity = e.target.value;
                              updateField('itinerary', newList);
                            }}
                            className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl text-xs font-bold outline-none"
                            placeholder="Contoh: Jamuan Makan Siang"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-12">
              <section className="space-y-8">
                 <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Aesthetics</h3>
                 
                 <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block">Template Layout</label>
                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { id: 'modern-classic', label: 'Modern Classic' },
                         { id: 'minimal-light', label: 'Minimal Light' }
                       ].map(t => (
                         <button 
                           key={t.id}
                           onClick={() => updateField('template_id', t.id)}
                           className={`p-5 rounded-[2rem] border-2 transition text-[10px] font-bold uppercase tracking-widest ${inv.template_id === t.id ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-xl' : 'border-gray-100 bg-gray-50 text-gray-400 opacity-60'}`}
                         >
                           {t.label}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block">Primary Theme Color</label>
                  <div className="flex flex-wrap gap-4">
                    {THEME_COLORS.map(color => (
                      <button 
                        key={color.value} 
                        onClick={() => updateSettings('primary_color', color.value)} 
                        style={{ backgroundColor: color.value }} 
                        className={`w-12 h-12 rounded-full border-4 transition transform hover:scale-125 shadow-xl ${inv.settings.primary_color === color.value ? 'border-white ring-4 ring-rose-500 scale-110' : 'border-transparent opacity-80'}`} 
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Background Image URL</label>
                  <input type="text" value={inv.settings.background_image} onChange={(e) => updateSettings('background_image', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-rose-200" />
                </div>
              </section>

              <section className="space-y-8 pt-10 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Kisah Cinta (Our Story)</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Story Title</label>
                    <input type="text" placeholder="Contoh: Kisah Cinta Kami" value={inv.settings.story_title || ''} onChange={(e) => updateSettings('story_title', e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Story Subtext / Description</label>
                    <textarea rows={4} value={inv.settings.our_story} onChange={(e) => updateSettings('our_story', e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-3xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-medium italic leading-relaxed" />
                  </div>
                </div>
              </section>

              <section className="space-y-8 pt-10 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Gallery Images</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 mr-4">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Show Gallery</span>
                      <input type="checkbox" checked={inv.settings.show_gallery} onChange={(e) => updateSettings('show_gallery', e.target.checked)} className="w-5 h-5 accent-rose-600" />
                    </div>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] bg-rose-50 text-rose-600 px-6 py-2.5 rounded-full font-bold uppercase tracking-widest hover:bg-rose-100 transition"
                    >
                      + Add Photo
                    </button>
                    <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                   {(inv.gallery || []).map((img, idx) => (
                     <div key={idx} className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100 group">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => {
                            const newGallery = [...(inv.gallery || [])];
                            newGallery.splice(idx, 1);
                            updateField('gallery', newGallery);
                          }}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                        >
                          <span className="text-white text-xs font-bold uppercase tracking-widest">Remove</span>
                        </button>
                     </div>
                   ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'tetamu' && (
            <div className="space-y-10">
              <section className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Hubungi Keluarga</h3>
                  <button 
                    onClick={() => {
                      const newContact: ContactPerson = { id: Date.now().toString(), name: 'Nama Baru', relation: 'Hubungan', phone: '01XXXXXXXX' };
                      updateField('contacts', [...inv.contacts, newContact]);
                    }}
                    className="text-[10px] bg-gray-100 px-6 py-2.5 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition"
                  >
                    + Add New
                  </button>
                </div>
                <div className="space-y-6">
                  {inv.contacts.map((contact, index) => (
                    <div key={contact.id} className="p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm space-y-4 group relative hover:shadow-md transition">
                      <button 
                        onClick={() => {
                          const newList = inv.contacts.filter(c => c.id !== contact.id);
                          updateField('contacts', newList);
                        }}
                        className="absolute top-4 right-4 text-gray-300 hover:text-rose-500 transition text-2xl"
                      >
                        &times;
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama</label>
                          <input 
                            type="text" 
                            value={contact.name} 
                            onChange={(e) => {
                              const newList = [...inv.contacts];
                              newList[index].name = e.target.value;
                              updateField('contacts', newList);
                            }}
                            className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl text-xs font-bold outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Hubungan</label>
                          <input 
                            type="text" 
                            value={contact.relation} 
                            onChange={(e) => {
                              const newList = [...inv.contacts];
                              newList[index].relation = e.target.value;
                              updateField('contacts', newList);
                            }}
                            className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl text-xs font-bold outline-none"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">No. Telefon</label>
                          <input 
                            type="text" 
                            value={contact.phone} 
                            onChange={(e) => {
                              const newList = [...inv.contacts];
                              newList[index].phone = e.target.value;
                              updateField('contacts', newList);
                            }}
                            className="w-full px-4 py-2.5 bg-gray-50 rounded-2xl text-xs font-bold outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'hadiah' && (
            <div className="space-y-10">
              <section className="space-y-8">
                <div className="flex items-center justify-between p-8 bg-rose-50 rounded-[3rem] border border-rose-100 shadow-inner">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-rose-800 tracking-tight italic">E-Angpow (DuitNow)</span>
                    <span className="text-[10px] text-rose-300 uppercase font-bold tracking-widest">Enable digital gifts</span>
                  </div>
                  <input type="checkbox" checked={inv.money_gift_details.enabled} onChange={(e) => updateMoneyGift('enabled', e.target.checked)} className="w-7 h-7 accent-rose-600 cursor-pointer" />
                </div>
                
                {inv.money_gift_details.enabled && (
                  <div className="space-y-8 animate-slide-up">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Bank Name</label>
                      <input type="text" value={inv.money_gift_details.bank_name} onChange={(e) => updateMoneyGift('bank_name', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account No.</label>
                      <input type="text" value={inv.money_gift_details.account_no} onChange={(e) => updateMoneyGift('account_no', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none font-mono" />
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t border-gray-100">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">QR Code (DuitNow/TNG)</label>
                      {inv.money_gift_details.qr_url ? (
                        <div className="relative w-full aspect-square max-w-[200px] mx-auto rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group">
                          <img src={inv.money_gift_details.qr_url} className="w-full h-full object-contain p-4 bg-white" />
                          <button 
                            onClick={() => updateMoneyGift('qr_url', '')}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                          >
                             <span className="text-white text-xs font-bold uppercase tracking-widest">Remove QR</span>
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => qrInputRef.current?.click()}
                          className="w-full py-10 border-2 border-dashed border-gray-200 rounded-[2.5rem] text-gray-400 hover:border-rose-200 hover:text-rose-400 transition flex flex-col items-center justify-center space-y-2"
                        >
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                          <span className="text-xs font-bold uppercase tracking-widest">Upload QR Code</span>
                        </button>
                      )}
                      <input type="file" hidden ref={qrInputRef} accept="image/*" onChange={handleQrUpload} />
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 px-6 py-2 bg-white/90 backdrop-blur-md rounded-full border border-white/50 shadow-xl text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center space-x-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>Live Preview</span>
        </div>
        
        <div className="w-full max-w-[393px] h-[852px] bg-white rounded-[4.5rem] border-[14px] border-gray-900 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.4)] overflow-hidden relative scale-90 md:scale-[0.82] lg:scale-[0.88] xl:scale-[0.95] transition-all duration-700 origin-center ring-8 ring-gray-100">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-3xl z-[110]"></div>
          <div className="absolute inset-0 overflow-y-auto no-scrollbar bg-white">
            <InvitationContent invitation={inv} isPreview={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

const PublicInvitation = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const guestName = searchParams.get('to');
  
  const inv = MOCK_INVITATIONS.find(i => i.slug === slug);
  if (!inv) return <div className="min-h-screen flex items-center justify-center font-serif italic text-gray-400 text-xl bg-white">Undangan tidak dijumpai.</div>;
  
  return <InvitationContent invitation={inv} guestName={guestName || undefined} />;
};

const Home = () => (
  <div className="pt-24 min-h-screen bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
      <div className="inline-block bg-rose-50 text-rose-600 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-12 animate-bounce border border-rose-100 shadow-sm font-sans">
        Digital Invitation SaaS Malaysia
      </div>
      <h1 className="text-6xl md:text-9xl font-serif font-bold text-gray-900 mb-10 tracking-tighter leading-[0.9]">
        Raikan Cinta <br />
        <span className="text-rose-600 italic">Secara Elegan.</span>
      </h1>
      <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-16 font-light leading-relaxed font-sans">
        Platform premium untuk kad jemputan digital. Bina sendiri kad idaman anda dengan editor real-time & AI Assisant kami.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-6">
        <Link 
          to="/dashboard" 
          className="bg-rose-600 text-white px-12 py-6 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-rose-700 shadow-2xl shadow-rose-200 transition transform hover:-translate-y-2 active:scale-95"
        >
          Mula Bina Percuma
        </Link>
        <Link 
          to="/" 
          className="bg-white border border-gray-100 text-gray-700 px-12 py-6 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-50 transition shadow-xl"
        >
          Lihat Katalog
        </Link>
      </div>
      
      <div className="mt-40 grid md:grid-cols-3 gap-12">
        {[
          { title: 'Editor Studio', desc: 'Reka kad jemputan digital anda sendiri dalam masa 5 minit.' },
          { title: 'Analytics Real-time', desc: 'Pantau jumlah tetamu & view kad anda secara langsung.' },
          { title: 'Sistem RSVP', desc: 'Uruskan maklum balas tetamu & e-Angpow dengan mudah.' }
        ].map((feat, i) => (
          <div key={i} className="bg-gray-50/50 p-12 rounded-[3.5rem] border border-gray-100 hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition duration-700 text-left group">
            <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-8 group-hover:rotate-12 transition shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 font-serif italic tracking-tight">{feat.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light font-sans">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<><Navbar /><Home /></>} />
          <Route path="/catalog" element={<><Navbar /><CatalogPage /></>} />
          <Route path="/pricing" element={<><Navbar /><PricingPage /></>} />
          <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
          <Route path="/edit/:id" element={<><Navbar /><Editor /></>} />
          <Route path="/manage/:id" element={<><Navbar /><ManageInvitation /></>} />
          <Route path="/i/:slug" element={<PublicInvitation />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
