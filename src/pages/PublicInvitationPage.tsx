import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Invitation } from '../../types';
import { MOCK_INVITATIONS } from '../../constants';

// --- Shared Utility Components ---

const Countdown: React.FC<{ targetDate: string, color: string }> = ({ targetDate, color }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
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

const CoverSection: React.FC<{ invitation: Invitation, onOpen: () => void, isClosing: boolean, isPreview?: boolean }> = ({ invitation, onOpen, isClosing, isPreview }) => {
  const formattedDate = useMemo(() => {
    const d = invitation?.event_date ? new Date(invitation.event_date) : null;
    return !d || isNaN(d.getTime()) ? 'Tarikh Belum Ditetapkan' : d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [invitation?.event_date]);

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
          {invitation?.settings?.hero_title || 'Walimatulurus'}
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

        {!isPreview ? (
          <button
            onClick={onOpen}
            className="group mt-12 flex items-center justify-center space-x-4 px-10 py-4 bg-white/90 border border-gray-200 rounded-full shadow-2xl hover:bg-white transition-all transform active:scale-95 duration-500"
          >
            <svg className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-700">Buka</span>
            <svg className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
        ) : (
          <div className="mt-12 flex items-center justify-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400">Preview Mode - Invitation Opened</span>
          </div>
        )}
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

const Guestbook: React.FC<{ wishes: any[], primaryColor: string }> = ({ wishes, primaryColor }) => (
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
  const [activeModal, setActiveModal] = useState<'map' | 'calendar' | 'contact' | null>(null);
  const [formData, setFormData] = useState({ name: guestName || '', phone: '', pax: 1, attending: true, message: '' });
  
  // Auto-scroll to cover when at top in preview mode
  useEffect(() => {
    if (isPreview && isOpen) {
      const handleScroll = () => {
        // When scrolling up from anywhere, go back to cover
        if (window.scrollY < 100) {
          setIsOpen(false);
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isPreview, isOpen]);
  
  const primaryColor = invitation.settings.primary_color;
  const isMinimal = invitation.template_id === 'minimal-light';

  const handleOpenInvitation = () => {
    // setIsClosing(true);
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
      {!isOpen && <CoverSection invitation={invitation} onOpen={handleOpenInvitation} isClosing={false} />}
      
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
              {invitation?.itinerary.map((item, idx) => (
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

const PublicInvitationPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const guestName = searchParams.get('to');
  
  // Handle hash routing - if there's a hash with edit or manage, redirect appropriately
  if (location.hash) {
    const hashPath = location.hash.substring(1); // Remove the # character
    if (hashPath.startsWith('edit/')) {
      const invitationId = hashPath.replace('edit/', '');
      window.location.href = `#/edit/${invitationId}`;
      return null;
    }
    if (hashPath.startsWith('manage/')) {
      const invitationId = hashPath.replace('manage/', '');
      window.location.href = `#/manage/${invitationId}`;
      return null;
    }
  }
  
  const inv = MOCK_INVITATIONS.find(i => i.slug === slug);
  if (!inv) return <div className="min-h-screen flex items-center justify-center font-serif italic text-gray-400 text-xl bg-white">Undangan tidak dijumpai.</div>;
  
  return <InvitationContent invitation={inv} guestName={guestName || undefined} />;
};

export { InvitationContent };
export default PublicInvitationPage;