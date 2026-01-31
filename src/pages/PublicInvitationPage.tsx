import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Invitation } from '../../types';
import { MOCK_INVITATIONS, FONT_FAMILIES } from '../../constants';
import CoverLayout from '../../components/Invitation/CoverLayout';
import { buildApiUrl } from '../config';


// --- Font Loading ---
const GoogleFontLoader: React.FC<{ settings: any }> = ({ settings }) => {
  const fontsToLoad = useMemo(() => {
    const fonts = new Set<string>();
    if (settings.groom_font) fonts.add(settings.groom_font);
    if (settings.bride_font) fonts.add(settings.bride_font);
    if (settings.host_font) fonts.add(settings.host_font);
    if (settings.greeting_font) fonts.add(settings.greeting_font);
    if (settings.hero_font) fonts.add(settings.hero_font);
    if (settings.invitation_font) fonts.add(settings.invitation_font);
    if (settings.date_font) fonts.add(settings.date_font);
    if (settings.location_font) fonts.add(settings.location_font);
    return Array.from(fonts);
  }, [settings]);

  if (fontsToLoad.length === 0) return null;

  const fontString = fontsToLoad.map(f => f.replace(/ /g, '+')).join('|');
  const url = `https://fonts.googleapis.com/css?family=${fontString}&display=swap`;

  return <style dangerouslySetInnerHTML={{ __html: `@import url('${url}');` }} />;
};

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

const parseYoutubeStartTime = (timeStr?: string) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const min = parseInt(parts[0]);
    const sec = parseFloat(parts[1]);
    return (min * 60) + sec;
  }
  return parseFloat(timeStr) || 0;
};

const YoutubePlayer: React.FC<{ url: string, startTime?: string, autoplay?: boolean, isMuted?: boolean }> = ({ url, startTime, autoplay, isMuted = false }) => {
  const videoId = useMemo(() => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, [url]);

  if (!videoId) return null;

  const startSeconds = parseYoutubeStartTime(startTime);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&start=${Math.floor(startSeconds)}&loop=1&playlist=${videoId}&mute=${isMuted ? 1 : 0}&enablejsapi=1`;

  return (
    <div className="fixed -z-10 opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
      <iframe
        width="100%"
        height="100%"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

// --- Opening Effects & Animation Layers ---

const EffectOverlay: React.FC<{ type: string, color: string }> = ({ type, color }) => {
  if (type === 'snow') {
    return (
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full opacity-80 animate-snowfall"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              animationDuration: `${Math.random() * 3 + 4}s`,
              animationDelay: `${Math.random() * 2}s`,
              backgroundColor: color || '#fff'
            }}
          />
        ))}
      </div>
    );
  }

  if (type === 'bubble') {
    return (
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-white/40 shadow-inner animate-bubble"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-${Math.random() * 10}%`,
              width: `${Math.random() * 30 + 10}px`,
              height: `${Math.random() * 30 + 10}px`,
              animationDuration: `${Math.random() * 5 + 5}s`,
              animationDelay: `-${Math.random() * 5}s`,
              borderColor: color || 'rgba(255,255,255,0.4)'
            }}
          />
        ))}
      </div>
    );
  }

  if (type === 'stars') {
    return (
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDuration: `${Math.random() * 1.5 + 1}s`,
              animationDelay: `${Math.random() * 2}s`,
              backgroundColor: color || '#fff'
            }}
          />
        ))}
      </div>
    );
  }

  return null;
};

const CoverSection: React.FC<{ invitation: Invitation, onOpen: () => void, isClosing: boolean, isPreview?: boolean }> = ({ invitation, onOpen, isClosing, isPreview }) => {
  const formattedDate = useMemo(() => {
    const d = invitation?.event_date ? new Date(invitation.event_date) : null;
    return !d || isNaN(d.getTime()) ? 'Tarikh Belum Ditetapkan' : d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [invitation?.event_date]);

  const overlayOpacity = invitation.settings.layout_settings?.overlay_opacity ?? 0.4;
  const openingType = invitation.settings.opening_type || 'slide-up';
  const effectStyle = invitation.settings.effect_style || 'none';
  const openingColor = invitation.settings.opening_color || '#fff';
  const effectColor = invitation.settings.effect_color || '#fff';

  // Animation Styles based on type
  const getAnimationClass = () => {
    if (!isClosing) return 'translate-y-0 opacity-100';

    switch (openingType) {
      case 'slide': return 'translate-x-[150%] opacity-100 duration-1000'; // Slide Right
      case 'window': return 'scale-150 opacity-0 duration-1000'; // Expand & Fade
      case 'blur': return 'blur-xl opacity-0 duration-1000'; // Blur Out
      case 'open-letter': return 'rotate-x-90 opacity-0 duration-1000 origin-top'; // Fold Down
      case 'none': return 'hidden';
      case 'slide-up':
      default: return '-translate-y-full opacity-0 duration-1000';
    }
  };

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center text-center transition-all ease-in-out ${getAnimationClass()}`}>

      {/* Background with Blur Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] scale-110"
        style={{ backgroundImage: `url(${invitation.settings.background_image})` }}
      >
        <div className="absolute inset-0 backdrop-blur-[2px] bg-black" style={{ opacity: overlayOpacity }}></div>
      </div>

      {/* Opening Effect Overlay */}
      <EffectOverlay type={effectStyle} color={effectColor} />


      {/* Content Rendering based on Layout */}
      <CoverLayout invitation={invitation} formattedDate={formattedDate} />

      {!isPreview ? (
        <div className="relative z-30 mt-12 animate-bounce-subtle">
          <button
            onClick={onOpen}
            className="px-10 py-4 bg-white/20 backdrop-blur-md border border-white/40 text-white rounded-full font-bold text-sm hover:bg-white hover:text-gray-900 transition-all duration-500 shadow-2xl flex items-center gap-3 group"
            style={{ borderColor: openingColor !== '#ffffff' ? openingColor : undefined }}
          >
            Buka Jemputan
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-rose-500 transform transition-transform group-hover:rotate-12">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </button>
        </div>
      ) : (
        <div className="mt-12 shrink-0 flex items-center justify-center z-50">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400">Preview Mode - Invitation Opened</span>
        </div>
      )}
    </div>
  );
};


// --- Invitation Content Sections ---

const HeroSection: React.FC<{ invitation: Invitation, guestName?: string }> = ({ invitation, guestName }) => {
  const isMinimal = invitation.template_id === 'minimal-light';

  const greetingStyles = {
    color: invitation.settings.greeting_color || '#FFFFFF',
    fontFamily: invitation.settings.greeting_font || 'inherit',
    fontSize: invitation.settings.greeting_size ? `${invitation.settings.greeting_size}px` : undefined,
  };

  const heroStyles = {
    color: invitation.settings.hero_color || '#FFFFFF',
    fontFamily: invitation.settings.hero_font || 'inherit',
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
      {(wishes || []).length > 0 ? (wishes || []).map((wish) => (
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

// Function to get CSRF token from server
const getCsrfToken = async () => {
  try {
    console.log('🔄 Fetching CSRF token...');
    const response = await fetch(buildApiUrl('/health'), {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      // The CSRF token should be set in the cookie by the server
      console.log('✅ CSRF token refreshed');
      console.log('🍪 All cookies after health request:', document.cookie);

      // Small delay to ensure cookie is set
      await new Promise(resolve => setTimeout(resolve, 100));
    } else {
      console.error('❌ Failed to refresh CSRF token');
    }
  } catch (error) {
    console.error('❌ Error refreshing CSRF token:', error);
  }
};

const InvitationContent: React.FC<{ invitation: Invitation, guestName?: string, isPreview?: boolean, setInv?: React.Dispatch<React.SetStateAction<Invitation | null>> }> = ({ invitation, guestName, isPreview, setInv }) => {
  const [showRsvp, setShowRsvp] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'map' | 'calendar' | 'contact' | 'hadiah' | null>(null);
  const [formData, setFormData] = useState({
    name: guestName || '',
    phone: '',
    email: '',
    address: '',
    company: '',
    job_title: '',
    car_plate: '',
    remarks: '',
    pax: 1,
    attending: true,
    message: '',
    slot: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTier = invitation?.settings?.package_plan || 'free';

  const canAccess = (feature: string) => {
    switch (feature) {
      case 'rsvp':
      case 'wishes':
        return ['pro', 'elite'].includes(currentTier);
      case 'visual_effects':
      case 'gallery':
      case 'money_gift':
      case 'wish_list':
      case 'custom_link':
        return currentTier === 'elite';
      default:
        return true;
    }
  };

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

  /* Close / Back to Cover Logic */
  const [isClosing, setIsClosing] = useState(false);

  const handleOpenInvitation = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(true);
      setIsClosing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1000);
  };

  const handleCloseInvitation = () => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRsvpSubmit = async () => {
    // Prevent multiple submissions
    if (isSuccess || isSubmitting) return;

    try {
      setIsSubmitting(true);
      // Get invitation ID from the invitation object
      const invitationId = invitation.id;

      // First, ensure we have a CSRF token by making a request to get one
      await getCsrfToken();

      // Prepare the RSVP data
      const rsvpData = {
        invitation_id: invitationId,
        guest_name: formData.name,
        phone_number: formData.phone,
        pax: formData.pax,
        is_attending: formData.attending,
        message: formData.message
      };

      // Get CSRF token from cookie
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return undefined;
      };
      const csrfToken = getCookie('csrf-token');

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Add CSRF token if available
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      // Send the RSVP data to the backend
      const response = await fetch(buildApiUrl('/rsvps'), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(rsvpData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ RSVP submitted successfully:', result);

        // Update the invitation's wishes array with the new wish if there's a message
        if (formData.message && formData.message.trim()) {
          const newWish = {
            id: Date.now().toString(), // Temporary ID
            name: formData.name,
            message: formData.message,
            created_at: new Date().toISOString()
          };

          // Update the local state to show the new wish immediately
          if (setInv) {
            setInv({
              ...invitation,
              wishes: [...(invitation.wishes || []), newWish]
            });
          }
        }

        setIsSuccess(true);
        setTimeout(() => {
          setShowRsvp(false);
          setIsSuccess(false);
          setIsSubmitting(false);
          // Reset form
          setFormData({ name: guestName || '', phone: '', pax: 1, attending: true, message: '' });
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to submit RSVP:', errorData);
        alert(`Failed to submit RSVP: ${errorData.error || 'Unknown error'}`);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('❌ Error submitting RSVP:', error);
      alert('Error submitting RSVP. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formattedDate = useMemo(() => {
    const d = new Date(invitation.event_date);
    return isNaN(d.getTime()) ? 'Tarikh Belum Ditetapkan' : d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [invitation.event_date]);

  const invitationTextStyles = {
    color: invitation.settings.invitation_color || '#6B7280',
    fontSize: invitation.settings.invitation_size ? `${invitation.settings.invitation_size}px` : undefined,
    fontFamily: invitation.settings.invitation_font || 'inherit',
  };

  const groomStyleBody = {
    color: invitation.settings.groom_color || primaryColor,
    fontFamily: invitation.settings.groom_font || 'inherit',
    fontSize: invitation.settings.groom_size ? `${invitation.settings.groom_size}px` : undefined,
  };

  const brideStyleBody = {
    color: invitation.settings.bride_color || primaryColor,
    fontFamily: invitation.settings.bride_font || 'inherit',
    fontSize: invitation.settings.bride_size ? `${invitation.settings.bride_size}px` : undefined,
  };

  const hostStyle = {
    color: invitation.settings.host_color || '#374151',
    fontFamily: invitation.settings.host_font || 'inherit',
    fontSize: invitation.settings.host_size ? `${invitation.settings.host_size}px` : undefined,
  };

  const dateStyle = {
    color: invitation.settings.date_color || primaryColor,
    fontFamily: invitation.settings.date_font || 'inherit',
    fontSize: invitation.settings.date_size ? `${invitation.settings.date_size}px` : undefined,
  };

  const locationStyle = {
    color: invitation.settings.location_color || '#1F2937',
    fontFamily: invitation.settings.location_font || 'inherit',
    fontSize: invitation.settings.location_size ? `${invitation.settings.location_size}px` : undefined,
  };

  // Auto-scroll delay logic
  useEffect(() => {
    if (isOpen && invitation.settings.auto_scroll_delay && invitation.settings.auto_scroll_delay > 0) {
      const timer = setTimeout(() => {
        const nextSection = document.getElementById('main-invitation-content');
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, invitation.settings.auto_scroll_delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, invitation.settings.auto_scroll_delay]);

  return (
    <>
      <GoogleFontLoader settings={invitation.settings} />

      {invitation.settings.youtube_url && invitation.settings.youtube_show && (
        <YoutubePlayer
          key={isOpen ? 'playing' : 'initial'} // Force re-mount on open to trigger autoplay with user gesture
          url={invitation.settings.youtube_url}
          startTime={invitation.settings.youtube_start_time}
          autoplay={isOpen && (invitation.settings.youtube_autoplay !== false)} // Only autoplay when open
        />
      )}

      {/* Cover Section - Always rendered but hidden/animated out when open */}
      <div className={`fixed inset-0 z-[200] transition-all duration-1000 ${isOpen ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}`}>
        {!isOpen && <CoverSection invitation={{ ...invitation, settings: { ...invitation.settings, effect_style: canAccess('visual_effects') ? invitation.settings.effect_style : 'none' } }} onOpen={handleOpenInvitation} isClosing={isClosing} />}
      </div>

      {/* Explicit closing state for cover */}
      {(!isOpen || isClosing) && (
        <CoverSection invitation={{ ...invitation, settings: { ...invitation.settings, effect_style: canAccess('visual_effects') ? invitation.settings.effect_style : 'none' } }} onOpen={handleOpenInvitation} isClosing={isClosing} />
      )}

      {/* Main Content Wrapper */}
      <div id="main-invitation-content" className={`relative min-h-screen bg-white transition-opacity duration-1000 ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>

        {/* Floating Back to Cover Button */}
        {isOpen && !isPreview && (
          <button
            onClick={handleCloseInvitation}
            className="fixed bottom-6 left-6 z-[100] bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black/70 transition shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>
            Tutup
          </button>
        )}

        <div className={`relative min-h-screen font-sans text-gray-900 bg-white transition-opacity duration-1000 ${activeModal ? 'overflow-hidden' : ''} ${isMinimal ? 'bg-gray-50/30' : ''} ${!isOpen ? 'opacity-0 h-screen overflow-hidden' : 'opacity-100'}`}>
          <HeroSection invitation={invitation} guestName={guestName} />


          <div className={`relative ${isMinimal ? 'bg-transparent' : '-mt-12 bg-white rounded-t-[3.5rem] shadow-2xl'} z-20 px-8 py-16 text-center transition-all duration-700`}>
            {/* Order: Nama Tuan Rumah -> Teks Jemputan -> Couple Names -> Date */}

            <div className="mb-14 space-y-6">
              <p className="text-xl font-serif italic text-gray-700 font-bold" style={hostStyle}>
                {invitation.host_names}
              </p>

              <p className="leading-relaxed font-light max-w-[300px] mx-auto italic" style={invitationTextStyles}>
                {invitation.settings.invitation_text || `Dengan penuh kesyukuran ke hadrat Ilahi, kami menjemput anda ke majlis perkahwinan anakanda kami yang tercinta:`}
              </p>
            </div>

            <div className="space-y-4 mb-14 animate-fade-in px-4">
              <h3 className="text-5xl md:text-6xl font-cursive font-bold" style={groomStyleBody}>
                {invitation.groom_name}
              </h3>
              <p className="text-gray-300 font-serif italic text-xl">&</p>
              <h3 className="text-5xl md:text-6xl font-cursive font-bold" style={brideStyleBody}>
                {invitation.bride_name}
              </h3>
            </div>

            <div className="mb-16">
              <p className="text-2xl font-serif italic mb-4 font-bold" style={dateStyle}>
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
                <span className="font-bold text-gray-800 text-lg tracking-tight" style={locationStyle}>{invitation.location_name}</span>
                <p className="text-[10px] text-gray-400 font-medium px-4">{invitation.address}</p>
              </div>
            </div>

            {canAccess('rsvp') && (() => {
              const rsvpSettings = invitation.rsvp_settings || { response_mode: 'rsvp_and_wish' };
              if (rsvpSettings.response_mode === 'none') return null;

              const isClosed = rsvpSettings.closing_date && new Date(rsvpSettings.closing_date) < new Date();

              return (
                <div className="flex flex-col gap-4 sticky bottom-8 z-30 px-2 drop-shadow-2xl">
                  <button
                    onClick={() => {
                      if (isClosed) {
                        alert('RSVP telah ditutup.');
                        return;
                      }
                      if (rsvpSettings.response_mode === 'external' && rsvpSettings.external_url) {
                        window.open(rsvpSettings.external_url, '_blank');
                      } else {
                        setShowRsvp(true);
                      }
                    }}
                    disabled={isClosed}
                    className={`w-full py-5 text-white font-bold rounded-3xl shadow-2xl transition transform active:scale-95 hover:brightness-110 tracking-[0.2em] text-xs uppercase ${isClosed ? 'opacity-70 cursor-not-allowed grayscale' : ''}`}
                    style={{ backgroundColor: isClosed ? '#6B7280' : primaryColor }}
                  >
                    {isClosed ? 'RSVP Ditutup' : 'Sahkan Kehadiran'}
                  </button>
                </div>
              );
            })()}

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
                {invitation?.itinerary && invitation.itinerary.length > 0 ? (
                  invitation.itinerary.map((item, idx) => (
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
                  ))
                ) : (
                  <p className="text-gray-400 italic text-sm py-10">Tiada atur cara majlis ditetapkan.</p>
                )}
              </div>
            </div>

            {canAccess('gallery') && invitation.settings.show_gallery && invitation.gallery && invitation.gallery.length > 0 && (
              <div className="mt-24 text-center">
                <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 mb-10 border-b pb-2 inline-block font-serif">Kenangan Abadi</h4>
                <div className="grid grid-cols-2 gap-4">
                  {(invitation.gallery || []).map((img, idx) => {
                    const imgSrc = typeof img === 'string' ? img : (img as any).image_url;
                    if (!imgSrc) return null;

                    return (
                      <div key={idx} className="aspect-square rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-white">
                        <img src={imgSrc} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {canAccess('wishes') && <Guestbook wishes={invitation.wishes} primaryColor={primaryColor} />}
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
              {canAccess('gallery') && (invitation.money_gift_details?.enabled || invitation.wishlist_details?.enabled) && (
                <>
                  <div className="w-px h-6 bg-gray-200/50" />
                  <button onClick={() => setActiveModal('hadiah')} className="flex flex-col items-center gap-1 group outline-none">
                    <div className="p-2 rounded-full group-hover:bg-rose-50 transition-colors" style={{ color: primaryColor }}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-rose-600">Hadiah</span>
                  </button>
                </>
              )}
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
                      {(invitation.contacts || []).length > 0 ? (invitation.contacts || []).map((contact) => (
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

                {activeModal === 'hadiah' && (
                  <div className="space-y-12 py-4">
                    {invitation.money_gift_details?.enabled && (
                      <div className="text-center">
                        <h3 className="text-2xl font-serif italic font-bold text-gray-800 mb-2">{invitation.money_gift_details?.gift_title || 'Hadiah & Ingatan'}</h3>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{invitation.money_gift_details?.gift_subtitle || 'Khas buat mempelai'}</p>
                      </div>
                    )}

                    {/* Hadiah Section (Money Gift) */}
                    {invitation.money_gift_details?.enabled && (
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 flex flex-col items-center space-y-6">
                          {invitation.money_gift_details?.qr_url && (
                            <div className="w-48 h-48 bg-white p-4 rounded-3xl shadow-inner border border-gray-100">
                              <img src={invitation.money_gift_details.qr_url} alt="QR Code" className="w-full h-full object-contain" />
                            </div>
                          )}
                          <div className="text-center space-y-2">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{invitation.money_gift_details?.bank_name}</p>
                            <p className="text-2xl font-bold tracking-tighter text-gray-800 font-mono">{invitation.money_gift_details?.account_no}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{invitation.money_gift_details?.account_holder}</p>
                          </div>
                          <button
                            onClick={() => {
                              if (invitation.money_gift_details?.account_no) {
                                navigator.clipboard.writeText(invitation.money_gift_details.account_no);
                                alert('Nombor akaun disalin!');
                              }
                            }}
                            className="px-8 py-3 bg-white border border-gray-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition shadow-sm"
                          >
                            Salin No. Akaun
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Wishlist Section */}
                    {invitation.wishlist_details?.enabled && (
                      <div className="space-y-10">
                        <div className="text-center" style={{ borderColor: primaryColor }}>
                          <div>
                            <h3 className="text-2xl font-serif italic font-bold text-gray-800 mb-2">{invitation.wishlist_details?.wishlist_title || 'Physical Wishlist'}</h3>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{invitation.wishlist_details?.wishlist_subtitle || 'Gifts requested'}</p>
                          </div>
                        </div>

                        <div className="bg-rose-50/50 p-8 rounded-[2.5rem] border border-rose-100/50 space-y-6">
                          <div className="space-y-2">
                            <p className="text-[9px] font-bold text-rose-300 uppercase tracking-widest">No. Telefon Penerima</p>
                            <p className="text-sm font-bold text-gray-700 font-mono">{invitation.wishlist_details?.receiver_phone || 'Belum disediakan'}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[9px] font-bold text-rose-300 uppercase tracking-widest">Alamat Penghantaran</p>
                            <p className="text-sm text-gray-600 leading-relaxed font-medium">{invitation.wishlist_details?.receiver_address || 'Belum disediakan'}</p>
                          </div>
                        </div>

                        {/* Items Listing */}
                        {invitation.wishlist_details?.items && invitation.wishlist_details.items.length > 0 && (
                          <div className="space-y-6">
                            <div className="flex items-center space-x-4 border-l-4 pl-4" style={{ borderColor: primaryColor }}>
                              <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Physical Gift Request</p>
                                <p className="text-lg font-bold text-gray-800 font-serif italic">Permintaan Hadiah</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                              {invitation.wishlist_details.items.map((item) => (
                                <div key={item.id} className="p-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex items-center space-x-6 group hover:shadow-md transition">
                                  <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                                    {item.item_image ? (
                                      <img src={item.item_image} alt={item.item_name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 pr-4">
                                    <p className="text-sm font-bold text-gray-800 mb-1">{item.item_name}</p>
                                    {item.item_link && (
                                      <a
                                        href={item.item_link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center text-[9px] font-bold uppercase tracking-widest text-rose-400 hover:text-rose-600 transition"
                                      >
                                        Beli Secara Online
                                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}


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
                      {/* Note from Host */}
                      {invitation.rsvp_settings?.note && (
                        <div className="bg-rose-50 p-4 rounded-xl text-xs text-rose-700 font-medium italic mb-4">
                          Note: {invitation.rsvp_settings.note}
                        </div>
                      )}

                      <div className="space-y-4 text-left">
                        {/* Always show Name if mode is not none */}
                        <div className="relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute -top-2 left-5 px-1 bg-white z-10">Nama Tetamu*</label>
                          <input
                            placeholder="Masukkan nama penuh"
                            className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-rose-100 focus:bg-white transition-all duration-300 text-sm outline-none font-medium"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>

                        {/* Phone - Conditional */}
                        {(invitation.rsvp_settings?.fields?.phone ?? true) && (
                          <div className="relative animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute -top-2 left-5 px-1 bg-white z-10">No. Telefon</label>
                            <input
                              placeholder="No. telefon"
                              className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-rose-100 focus:bg-white transition-all duration-300 text-sm outline-none font-medium"
                              value={formData.phone}
                              onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                          </div>
                        )}

                        {/* Email - Conditional */}
                        {invitation.rsvp_settings?.fields?.email && (
                          <div className="relative animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute -top-2 left-5 px-1 bg-white z-10">Alamat Emel</label>
                            <input
                              type="email"
                              placeholder="example@mail.com"
                              className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-rose-100 focus:bg-white transition-all duration-300 text-sm outline-none font-medium"
                              value={formData.email}
                              onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                          </div>
                        )}

                        {/* Address - Conditional */}
                        {invitation.rsvp_settings?.fields?.address && (
                          <div className="relative animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute -top-2 left-5 px-1 bg-white z-10">Alamat Rumah</label>
                            <textarea
                              rows={2}
                              placeholder="Alamat penuh..."
                              className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-rose-100 focus:bg-white transition-all duration-300 text-sm outline-none font-medium"
                              value={formData.address}
                              onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                          </div>
                        )}

                        {/* Company - Conditional */}
                        {invitation.rsvp_settings?.fields?.company && (
                          <div className="relative animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute -top-2 left-5 px-1 bg-white z-10">Nama Syarikat</label>
                            <input
                              type="text"
                              placeholder="Nama Syarikat"
                              className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-rose-100 focus:bg-white transition-all duration-300 text-sm outline-none font-medium"
                              value={formData.company}
                              onChange={e => setFormData({ ...formData, company: e.target.value })}
                            />
                          </div>
                        )}

                        {/* Job Title - Conditional */}
                        {invitation.rsvp_settings?.fields?.job_title && (
                          <div className="relative animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute -top-2 left-5 px-1 bg-white z-10">Jawatan</label>
                            <input
                              type="text"
                              placeholder="Jawatan"
                              className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-rose-100 focus:bg-white transition-all duration-300 text-sm outline-none font-medium"
                              value={formData.job_title}
                              onChange={e => setFormData({ ...formData, job_title: e.target.value })}
                            />
                          </div>
                        )}

                        {/* Car Plate - Conditional */}
                        {invitation.rsvp_settings?.fields?.car_plate && (
                          <div className="relative animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute -top-2 left-5 px-1 bg-white z-10">No. Plat Kenderaan</label>
                            <input
                              type="text"
                              placeholder="ABC 1234"
                              className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-rose-100 focus:bg-white transition-all duration-300 text-sm outline-none font-medium"
                              value={formData.car_plate}
                              onChange={e => setFormData({ ...formData, car_plate: e.target.value })}
                            />
                          </div>
                        )}

                        {/* Remarks - Conditional */}
                        {invitation.rsvp_settings?.fields?.remarks && (
                          <div className="relative animate-slide-up" style={{ animationDelay: '0.15s' }}>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute -top-2 left-5 px-1 bg-white z-10">Catatan</label>
                            <textarea
                              rows={2}
                              placeholder="Catatan tambahan..."
                              className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-rose-100 focus:bg-white transition-all duration-300 text-sm outline-none font-medium"
                              value={formData.remarks}
                              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                            />
                          </div>
                        )}

                        {/* Attendance Toggle - Hide if wish_only */}
                        {invitation.rsvp_settings?.response_mode !== 'wish_only' && (
                          <>
                            <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[2rem] animate-slide-up" style={{ animationDelay: '0.2s' }}>
                              <button
                                onClick={() => setFormData({ ...formData, attending: true })}
                                className={`flex-1 py-4 rounded-[1.5rem] font-bold text-[10px] uppercase tracking-widest transition-all duration-500 transform active:scale-95 ${formData.attending ? 'bg-green-600 text-white shadow-xl translate-y-[-2px]' : 'text-gray-400 hover:text-gray-600'}`}
                              >
                                Hadir
                              </button>
                              <button
                                onClick={() => setFormData({ ...formData, attending: false })}
                                className={`flex-1 py-4 rounded-[1.5rem] font-bold text-[10px] uppercase tracking-widest transition-all duration-500 transform active:scale-95 ${!formData.attending ? 'bg-rose-600 text-white shadow-xl translate-y-[-2px]' : 'text-gray-400 hover:text-gray-600'}`}
                              >
                                Maaf
                              </button>
                            </div>

                            <div className="overflow-hidden">
                              {formData.attending ? (
                                <div className="animate-scale-in pt-2 space-y-4">

                                  {(invitation.rsvp_settings?.has_slots && (invitation.rsvp_settings?.slots_options || []).length > 0) && (
                                    <div className="relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute -top-2 left-5 px-1 bg-white z-10">Pilih Slot / Kategori</label>
                                      <div className="relative">
                                        <select
                                          className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-rose-100 focus:bg-white transition-all duration-300 text-sm outline-none font-medium appearance-none"
                                          value={formData.slot || ''}
                                          onChange={e => setFormData({ ...formData, slot: e.target.value })}
                                        >
                                          <option value="" disabled>Sila pilih satu...</option>
                                          {(invitation.rsvp_settings?.slots_options || []).map((slot, i) => (
                                            <option key={i} value={slot}>{slot}</option>
                                          ))}
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-[1.5rem] px-6 py-5 justify-between shadow-inner">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bilangan Tetamu</span>
                                    <div className="flex items-center space-x-6">
                                      <button
                                        onClick={() => setFormData({ ...formData, pax: Math.max(1, formData.pax - 1) })}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-rose-500 font-bold text-xl hover:bg-rose-50 transition active:scale-90"
                                      >
                                        -
                                      </button>
                                      <span className="font-bold text-lg w-6 text-center">{formData.pax}</span>
                                      <button
                                        onClick={() => setFormData({ ...formData, pax: Math.min(invitation.rsvp_settings?.pax_limit_per_rsvp || 10, formData.pax + 1) })}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-rose-500 font-bold text-xl hover:bg-rose-50 transition active:scale-90"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-[9px] text-gray-400 text-right px-2">Max {invitation.rsvp_settings?.pax_limit_per_rsvp || 10} orang</p>
                                </div>
                              ) : (
                                <div className="animate-fade-in pt-2">
                                  <p className="text-[10px] text-gray-400 italic text-center leading-relaxed">Kami mendoakan yang terbaik untuk urusan anda.</p>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {/* Wish / Message */}
                        {(invitation.rsvp_settings?.fields?.wish ?? true) && (
                          <div className="relative pt-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest absolute top-0 left-5 px-1 bg-white z-10">Titipkan Ucapan</label>
                            <textarea
                              placeholder="Selamat pengantin baru..."
                              rows={3}
                              className="w-full px-6 py-5 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:ring-4 focus:ring-rose-100 focus:bg-white transition-all duration-300 text-sm outline-none font-medium italic"
                              value={formData.message}
                              onChange={e => setFormData({ ...formData, message: e.target.value })}
                            />
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleRsvpSubmit}
                        disabled={isSubmitting || isSuccess}
                        className={`w-full py-5 text-white font-bold rounded-[1.5rem] shadow-2xl transition-all duration-500 transform active:scale-95 hover:brightness-110 tracking-[0.2em] text-[10px] uppercase animate-slide-up shadow-rose-100 ${(isSubmitting || isSuccess) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ backgroundColor: primaryColor, animationDelay: '0.4s' }}
                      >
                        {isSubmitting ? 'Menghantar...' : isSuccess ? 'Terkirim!' : 'Hantar RSVP'}
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
            <div className="mt-16 flex flex-col items-center gap-4 opacity-70 hover:opacity-100 transition duration-500">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Powered by</p>
              <Link to="/" className="group relative">
                <div className="relative h-14 w-14 rounded-full overflow-hidden border border-gray-100 shadow-inner bg-white">
                  <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_12px_rgba(0,0,0,0.15)] rounded-full"></div>
                  <img
                    src="/logo.png"
                    alt="RaikanBersama Logo"
                    className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
              </Link>
            </div>
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
    const hashPath = location.hash.substring(1);
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

  const [inv, setInv] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!slug) return;

      try {
        const response = await fetch(buildApiUrl(`/invitations/slug/${slug}`), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setInv({
            ...data.data,
            wishes: data.data.guestWishes || data.data.wishes || []
          });
        } else {
          const mockInv = MOCK_INVITATIONS.find(i => i.slug === slug);
          if (mockInv) setInv(mockInv);
        }
      } catch (error) {
        const mockInv = MOCK_INVITATIONS.find(i => i.slug === slug);
        if (mockInv) setInv(mockInv);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-serif italic text-gray-400 text-xl bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
        <p className="mt-4">Loading invitation...</p>
      </div>
    );
  }

  if (!inv) return <div className="min-h-screen flex items-center justify-center font-serif italic text-gray-400 text-xl bg-white">Undangan tidak dijumpai.</div>;

  return <InvitationContent invitation={inv} guestName={guestName || undefined} setInv={setInv} />;
};

export { InvitationContent };
export default PublicInvitationPage;