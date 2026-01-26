import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import TabButton from '../../components/Editor/TabButton';
import { Invitation, ContactPerson, MembershipTier, RSVP, RsvpSettings } from '../../types';
import { MOCK_INVITATIONS, THEME_COLORS, FONT_FAMILIES, PACKAGE_PLANS, OPENING_TYPES, EFFECT_STYLES } from '../../constants';
import { generatePantun, generateStory } from '../../services/geminiService';

const FontPicker: React.FC<{ value?: string, onChange: (font: string) => void, label: string }> = ({ value, onChange, label }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:border-rose-300 focus:bg-white transition text-xs outline-none font-medium"
      style={{ fontFamily: value || 'inherit' }}
    >
      <option value="">Default Font</option>
      {FONT_FAMILIES.map(group => (
        <optgroup key={group.group} label={group.group}>
          {group.fonts.map(font => (
            <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
          ))}
        </optgroup>
      ))}
    </select>
  </div>
);

import { InvitationContent } from './PublicInvitationPage';
import { useAuth } from '../contexts/AuthContext';

const LockedOverlay: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 rounded-3xl animate-fade-in">
      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-white/5 shadow-2xl">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-2 font-serif italic">Fungsi Terhad (Demo)</h3>
      <p className="text-gray-300 text-sm mb-8 max-w-[240px] leading-relaxed">Sila log masuk atau daftar akaun percuma untuk mengubah suai bahagian ini & simpan kad anda.</p>
      <div className="flex flex-col gap-3 w-full max-w-[200px]">
        <button onClick={() => navigate('/login')} className="w-full py-3 bg-rose-600 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition shadow-lg">Log Masuk</button>
        <button onClick={() => navigate('/register')} className="w-full py-3 bg-white/10 text-white border border-white/20 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition">Daftar Sekarang</button>
      </div>
    </div>
  );
};

const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [inv, setInv] = useState<Invitation | null>(null);
  const [activeTab, setActiveTab] = useState('utama');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPackageDropdownOpen, setIsPackageDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const wishlistItemInputRef = useRef<HTMLInputElement>(null);
  const [currentWishlistItemIdx, setCurrentWishlistItemIdx] = useState<number | null>(null);

  const isDemo = id === 'demo' || !user;

  useEffect(() => {
    const fetchInvitation = async () => {
      // HANDLE GUEST-TO-MEMBER CONVERSION
      if (id === 'demo' && token && sessionStorage.getItem('pending_guest_invitation')) {
        try {
          console.log('🔄 Handoff: Converting guest data to user invitation...');
          const cachedRaw = sessionStorage.getItem('pending_guest_invitation');
          sessionStorage.removeItem('pending_guest_invitation'); // Clear early to prevent loops

          if (!cachedRaw) return;
          const cachedData = JSON.parse(cachedRaw);

          // Prepare for POST request
          const { id: _, ...payload } = cachedData; // Explicitly remove id if present
          const newInvitation = {
            ...payload,
            slug: `invitation-${Date.now()}`
          };

          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          };

          const response = await fetch('http://localhost:3001/api/invitations', {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(newInvitation)
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Handoff: Conversion successful!', data);
            navigate(`/edit/${data.data.id}`, { replace: true });
            return;
          } else {
            const errorData = await response.json();
            console.error('❌ Handoff: Conversion failed', errorData);
            alert('Draft digital anda gagal disimpan ke akaun anda. Sila bina baru di Catalog.');
            navigate('/catalog', { replace: true });
            return;
          }
        } catch (error) {
          console.error('❌ Handoff: Error during conversion:', error);
          navigate('/catalog', { replace: true });
          return;
        }
      }

      if (id === 'demo' || !token) {
        if (id === 'demo') {
          // Initialize demo data from URL or defaults
          const bg_url = searchParams.get('bg_url') || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80';
          const layout = searchParams.get('layout') || 'standard';
          const font = searchParams.get('font') || 'serif';

          const demoInv: Invitation = {
            id: 'demo',
            user_id: 'guest',
            slug: 'demo-invitation',
            template_id: 'modern-classic',
            event_type: 'Walimatulurus',
            bride_name: 'Pengantin Perempuan',
            groom_name: 'Pengantin Lelaki',
            host_names: 'Keluarga Pengantin',
            event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            start_time: '11:00',
            end_time: '16:00',
            location_name: 'Dewan Majlis',
            address: 'Alamat Majlis, Bandar Baru, Kuala Lumpur',
            google_maps_url: '',
            waze_url: '',
            settings: {
              music_url: '',
              background_image: bg_url,
              primary_color: '#8B4513',
              show_countdown: true,
              show_gallery: true,
              is_published: false,
              layout_settings: {
                cover_layout: layout as any,
                font_family: font
              },
              hero_title: 'Raikan Cinta Kami',
              greeting_text: 'Assalammualaikum W.B.T',
              invitation_text: 'Dengan penuh kesyukuran, kami menjemput anda ke majlis perkahwinan kami:',
              story_title: 'Kisah Cinta Kita',
              our_story: 'Kisah cinta kami bermula di sebuah perpustakaan lama...',
              pantun: 'Tuai padi antara nampak, Esok jangan layu-layuan; Intai kami antara nampak, Esok jangan rindu-rinduan.',
              groom_color: '#8B4513',
              bride_color: '#8B4513',
              host_color: '#4B5563',
              date_color: '#1F2937',
              greeting_color: '#FFFFFF',
              greeting_size: '36',
              hero_color: '#FFFFFF',
              hero_size: '12',
              invitation_color: '#6B7280',
              invitation_size: '14',
            },
            money_gift_details: { enabled: false, bank_name: '', account_no: '', account_holder: '', qr_url: '', gift_title: 'Hadiah & Ingatan', gift_subtitle: 'Khas buat mempelai' },
            wishlist_details: { enabled: false, receiver_phone: '', receiver_address: '', items: [] },
            rsvp_settings: {
              response_mode: 'rsvp_and_wish',
              fields: { name: true, phone: true, email: false, address: false, company: false, job_title: false, car_plate: false, remarks: true, wish: true },
              has_children_policy: false,
              pax_limit_per_rsvp: 10,
              total_guest_limit: 500,
              has_slots: false,
              slots_options: []
            },
            contacts: [],
            itinerary: [],
            gallery: [],
            wishes: [],
            views: 0,
            rsvps: []
          };
          setInv(demoInv);
        } else if (!token) {
          // If trying to access a real ID but no token, guest can only use demo.
          navigate('/catalog');
        }
        return;
      }

      try {
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return null;
        };
        const csrfToken = getCookie('csrf-token');

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        if (csrfToken) {
          headers['X-CSRF-Token'] = csrfToken;
        }

        const response = await fetch(`http://localhost:3001/api/invitations/${id}`, {
          method: 'GET',
          headers,
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Editor: API Response received', data);
          let invitationData = data.data;

          if (!invitationData.wishlist_details) {
            invitationData.wishlist_details = {
              enabled: false,
              receiver_phone: '',
              receiver_address: '',
              items: []
            };
          }
          if (!invitationData.money_gift_details) {
            invitationData.money_gift_details = {
              enabled: false,
              bank_name: '',
              account_no: '',
              account_holder: '',
              qr_url: '',
              gift_title: 'Hadiah & Ingatan',
              gift_subtitle: 'Khas buat mempelai'
            };
          }

          setInv(invitationData);
        } else {
          console.error('❌ Editor: Failed to fetch invitation:', response.statusText);
          const found = MOCK_INVITATIONS.find(item => item.id === id);
          if (found) {
            setInv(found);
          } else {
            alert(`Invitation with ID "${id}" not found.`);
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('❌ Editor: Error fetching invitation:', error);
        const found = MOCK_INVITATIONS.find(item => item.id === id);
        if (found) {
          setInv(found);
        }
      }
    };

    if (!id) {
      // If no ID is present, we shouldn't be here. 
      // Redirect to catalog to pick a design.
      navigate('/catalog');
    } else {
      fetchInvitation();
    }
  }, [id, token, user, navigate]);

  // Save invitation data to backend
  const saveInvitation = async () => {
    if (isDemo) {
      // For guests, cache data to sessionStorage and redirect to login
      sessionStorage.setItem('pending_guest_invitation', JSON.stringify(inv));
      navigate(`/login?redirect=${encodeURIComponent('/edit/demo')}`);
      return;
    }

    try {
      // Get CSRF token from cookie
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      const csrfToken = getCookie('csrf-token');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Add CSRF token if available
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const response = await fetch(`http://localhost:3001/api/invitations/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(inv)
      });

      if (response.ok) {
        console.log('Invitation saved successfully!');
        alert('Changes saved successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to save invitation:', errorData);
        alert(`Failed to save invitation: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving invitation:', error);
      alert('Error saving invitation. Please try again.');
    }
  };

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
    setInv({
      ...inv,
      settings: {
        ...inv.settings,
        [field]: value
      }
    });
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getYoutubeThumbnail = (url: string) => {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  };

  const updateMoneyGift = (field: keyof Invitation['money_gift_details'], value: any) => {
    if (!inv) return;
    setInv({ ...inv, money_gift_details: { ...inv.money_gift_details, [field]: value } });
  };

  const updateWishlist = (field: keyof Invitation['wishlist_details'], value: any) => {
    if (!inv) return;
    setInv({ ...inv, wishlist_details: { ...inv.wishlist_details, [field]: value } });
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

  const handleWishlistItemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentWishlistItemIdx !== null) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newItems = [...(inv?.wishlist_details.items || [])];
        newItems[currentWishlistItemIdx].item_image = base64String;
        updateWishlist('items', newItems);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateRsvpSettings = (field: keyof RsvpSettings | string, value: any) => {
    if (!inv) return;
    const newSettings = { ...inv.rsvp_settings };

    const fieldName = String(field);

    if (fieldName.includes('.')) {
      const [parent, child] = fieldName.split('.');
      if (parent === 'fields') {
        newSettings.fields = {
          ...newSettings.fields,
          [child]: value
        };
      }
    } else {
      (newSettings as any)[fieldName] = value;
    }

    updateField('rsvp_settings', newSettings);
  };
  if (!inv) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white z-[300]">
        <div className="text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-rose-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-rose-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-serif italic text-gray-500 animate-pulse">Menghidupkan Studio Rekaan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-full md:w-[480px] bg-white border-r border-gray-200 flex flex-col h-full shadow-2xl z-20">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-bold font-serif italic text-gray-800 tracking-tight">Design Studio</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Crafting perfection</p>
          </div>
          <button
            onClick={saveInvitation}
            disabled={isDemo ? false : (!id || !token)}
            className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-rose-100 hover:bg-rose-700 transition transform active:scale-95 disabled:opacity-50"
          >
            {isDemo ? 'Save & Unlock All (Login)' : 'Save Changes'}
          </button>
        </div>

        <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar bg-gray-50/50 px-2 sticky top-0">
          <TabButton label="Pembukaan" isActive={activeTab === 'pembukaan'} onClick={() => setActiveTab('pembukaan')} />
          <TabButton label="Media" isActive={activeTab === 'media'} onClick={() => setActiveTab('media')} />
          <TabButton label="Utama" isActive={activeTab === 'utama'} onClick={() => setActiveTab('utama')} />
          <TabButton label="Butiran" isActive={activeTab === 'butiran'} onClick={() => setActiveTab('butiran')} />
          <TabButton label="Keluarga" isActive={activeTab === 'tetamu'} onClick={() => setActiveTab('tetamu')} />

          {(user?.membership_tier === MembershipTier.PREMIUM || user?.membership_tier === MembershipTier.ELITE) && (
            <>
              <TabButton label="Hadiah" isActive={activeTab === 'hadiah'} onClick={() => setActiveTab('hadiah')} />
              <TabButton label="Wishlist" isActive={activeTab === 'wishlist'} onClick={() => setActiveTab('wishlist')} />
              <TabButton label="RSVP" isActive={activeTab === 'rsvp'} onClick={() => setActiveTab('rsvp')} />
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
          {activeTab === 'pembukaan' && (
            <div className="space-y-10 relative">
              {isDemo && <LockedOverlay />}
              <section className="space-y-8">
                <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Pakej & Konsep</h3>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilihan Pakej</label>
                  <div className="relative">
                    {/* Trigger Button */}
                    <button
                      onClick={() => setIsPackageDropdownOpen(!isPackageDropdownOpen)}
                      className="w-full bg-white border-2 border-rose-100 rounded-3xl p-5 flex items-center justify-between hover:border-rose-300 transition-all shadow-sm group"
                    >
                      <div className="text-left">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Pelan Semasa</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-gray-900 capitalize">{PACKAGE_PLANS.find(p => p.id === (inv.settings.package_plan || 'free'))?.label || 'Basic (Free)'}</span>
                        </div>
                        <span className="text-xs text-rose-500 font-bold mt-1 inline-block group-hover:underline">Tukar Pakej</span>
                      </div>
                      <div className={`w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center transition-transform duration-300 ${isPackageDropdownOpen ? 'rotate-180' : ''}`}>
                        <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </button>

                    {/* Dropdown Content */}
                    {isPackageDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-4 z-50 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-4 max-h-[600px] overflow-y-auto no-scrollbar space-y-4 animate-scale-in origin-top">
                        {[
                          {
                            id: 'lite',
                            name: 'Lite',
                            price: 'RM29',
                            description: 'The essential wedding invitation',
                            features: ['Tiada Had Pelawat', 'Lifetime Access', 'Gallery (1 Image)'],
                            isPopular: false
                          },
                          {
                            id: 'pro',
                            name: 'Pro',
                            price: 'RM49',
                            description: 'The preferred choice',
                            features: ['Maklumat Boleh Tukar (120 Hari)', 'Gallery (5 Images)', 'Money Gift (E-Angpow)'],
                            isPopular: true
                          },
                          {
                            id: 'elite',
                            name: 'Elite',
                            price: 'RM69',
                            description: 'The ultimate experience',
                            features: ['Lifetime Edit', 'Unlimited Gallery', 'Video Embed', 'Physical Wishlist'],
                            isPopular: false
                          }
                        ].map(plan => (
                          <button
                            key={plan.id}
                            onClick={() => {
                              updateSettings('package_plan', plan.id);
                              setIsPackageDropdownOpen(false);
                            }}
                            className={`w-full relative p-6 rounded-3xl border text-left transition-all group ${inv.settings.package_plan === plan.id
                              ? 'border-rose-500 bg-rose-50 shadow-md ring-1 ring-rose-200'
                              : 'border-gray-100 bg-white hover:border-rose-300 hover:shadow-md'
                              }`}
                          >
                            {plan.isPopular && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm">
                                  Most Popular
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className={`text-xs font-bold uppercase tracking-widest ${inv.settings.package_plan === plan.id ? 'text-rose-600' : 'text-gray-500'}`}>
                                  {plan.name}
                                </span>
                                <div className="mt-1 flex items-baseline gap-1">
                                  <span className="text-xl font-bold text-gray-900">{plan.price}</span>
                                </div>
                              </div>
                              {inv.settings.package_plan === plan.id && (
                                <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                              )}
                            </div>

                            <p className="text-[10px] text-gray-400 mb-4 font-medium italic">{plan.description}</p>

                            <ul className="space-y-1.5 border-t border-dashed border-gray-200 pt-3 mt-3">
                              {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start text-[10px] text-gray-600">
                                  <svg className="w-3 h-3 text-green-500 mr-1.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilihan Design Katalog</label>
                    <button onClick={() => navigate('/catalog')} className="text-[10px] font-bold text-rose-500 hover:text-rose-600 underline">Browse All</button>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                    <p className="text-xs text-gray-400 font-medium mb-3">Tukar design kad anda dari koleksi kami.</p>
                    <button
                      onClick={() => navigate('/catalog')}
                      className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 shadow-sm hover:bg-gray-50 transition"
                    >
                      Pilih Design Baru
                    </button>
                  </div>
                </div>
              </section>

              <section className="space-y-8 pt-10 border-t border-gray-100">
                <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Animasi Pembukaan</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                      <span>Jenis Animasi</span>
                      <input
                        type="color"
                        value={inv.settings.opening_color || '#ffffff'}
                        onChange={(e) => updateSettings('opening_color', e.target.value)}
                        className="w-4 h-4 rounded-full overflow-hidden border-none p-0 cursor-pointer"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {OPENING_TYPES.map(type => (
                        <button
                          key={type.id}
                          onClick={() => updateSettings('opening_type', type.id)}
                          className={`p-3 rounded-xl border text-center transition-all ${(inv.settings.opening_type || 'none') === type.id
                            ? 'border-rose-400 bg-rose-50 text-rose-600'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-rose-200'
                            }`}
                        >
                          <span className="text-xs font-bold">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-8 pt-10 border-t border-gray-100">
                <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Effect & Hiasan</h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                      <span>Jenis Effect</span>
                      <input
                        type="color"
                        value={inv.settings.effect_color || '#ffffff'}
                        onChange={(e) => updateSettings('effect_color', e.target.value)}
                        className="w-4 h-4 rounded-full overflow-hidden border-none p-0 cursor-pointer"
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {EFFECT_STYLES.map(style => (
                        <button
                          key={style.id}
                          onClick={() => updateSettings('effect_style', style.id)}
                          className={`p-3 rounded-xl border text-center transition-all ${(inv.settings.effect_style || 'none') === style.id
                            ? 'border-rose-400 bg-rose-50 text-rose-600'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-rose-200'
                            }`}
                        >
                          <span className="text-xs font-bold">{style.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-10 relative">
              {isDemo && <LockedOverlay />}
              <section className="space-y-8">
                <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Video & Muzik Youtube</h3>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pautan Lagu Youtube (jika ada)</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={inv.settings.youtube_url || ''}
                        onChange={(e) => updateSettings('youtube_url', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-medium"
                      />
                      {inv.settings.youtube_url && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <button
                            onClick={() => window.open(inv.settings.youtube_url, '_blank')}
                            className="p-2 bg-white rounded-full shadow-sm text-rose-500 hover:text-rose-600 transition active:scale-90"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mula Dari (mm:ss.ms)</label>
                      <input
                        type="text"
                        placeholder="00:58"
                        value={inv.settings.youtube_start_time || ''}
                        onChange={(e) => updateSettings('youtube_start_time', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tunjukkan & Autoplay</label>
                      <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-transparent hover:border-rose-100 transition">
                        <button
                          onClick={() => updateSettings('youtube_show', !inv.settings.youtube_show)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${inv.settings.youtube_show ? 'bg-rose-500' : 'bg-gray-300'}`}
                        >
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${inv.settings.youtube_show ? 'translate-x-6' : ''}`} />
                        </button>
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Aktifkan</span>
                      </div>
                    </div>
                  </div>

                  {inv.settings.youtube_url && (
                    <div className="p-6 bg-rose-50/30 rounded-[2.5rem] border border-rose-100/50 space-y-4">
                      <div className="aspect-video rounded-2xl overflow-hidden bg-gray-200 shadow-inner relative group">
                        {getYoutubeThumbnail(inv.settings.youtube_url) ? (
                          <img
                            src={getYoutubeThumbnail(inv.settings.youtube_url)!}
                            alt="Youtube Thumbnail"
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/480x270?text=Thumbnail+Not+Available')}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Video Tidak Sah</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-rose-600 uppercase tracking-widest flex items-center gap-2">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
                            Pratonton Thumbnail
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 bg-white/80 rounded-2xl border border-rose-100/30">
                          <p className="text-[10px] text-gray-500 leading-relaxed italic">
                            <b>Nota:</b> Isu thumbnail tidak keluar terjadi jika YouTube player diakses terlalu kerap. Tunggu beberapa minit atau log masuk ke akaun Google.
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 p-4 bg-gray-50/50 rounded-2xl">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Sokongan Autoplay:</span>
                          <span className="text-[9px] text-gray-500 leading-relaxed font-medium">
                            Menyokong peranti terkini (Chrome, Safari, Edge, dll.). Tidak menyokong In-App Browser (FB/IG/Telegram).
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-8 pt-10 border-t border-gray-100">
                <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Tetapan Navigasi</h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-800 tracking-tight">Delay Auto Skrol (saat)</label>
                      <p className="text-[9px] text-gray-400 font-medium">Auto-skrol dari Paparan Utama selepas dibuka.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 border border-rose-100/50">
                        <input
                          type="number"
                          min="0"
                          max="60"
                          value={inv.settings.auto_scroll_delay || 0}
                          onChange={(e) => updateSettings('auto_scroll_delay', parseInt(e.target.value))}
                          className="w-12 bg-transparent text-center font-bold text-rose-600 outline-none"
                        />
                        <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">Saat</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'utama' && (
            <div className="space-y-10">
              {/* Couple Names Section - Public */}
              <section className="space-y-8">
                <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Identiti Utama</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                          <span>Lelaki</span>
                          <input type="color" value={inv.settings.groom_color || '#000000'} onChange={(e) => updateSettings('groom_color', e.target.value)} className="w-4 h-4 rounded-full overflow-hidden border-none p-0 cursor-pointer" />
                        </label>
                        <input type="text" value={inv.groom_name} onChange={(e) => updateField('groom_name', e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-bold" />
                      </div>
                      <FontPicker label="Font Lelaki" value={inv.settings.groom_font} onChange={(font) => updateSettings('groom_font', font)} />
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">
                          <span>Saiz</span>
                          <span>{inv.settings.groom_size || '48'}px</span>
                        </div>
                        <input type="range" min="20" max="80" value={inv.settings.groom_size || '48'} onChange={(e) => updateSettings('groom_size', e.target.value)} className="w-full accent-rose-600 h-1" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                          <span>Perempuan</span>
                          <input type="color" value={inv.settings.bride_color || '#000000'} onChange={(e) => updateSettings('bride_color', e.target.value)} className="w-4 h-4 rounded-full overflow-hidden border-none p-0 cursor-pointer" />
                        </label>
                        <input type="text" value={inv.bride_name} onChange={(e) => updateField('bride_name', e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-bold" />
                      </div>
                      <FontPicker label="Font Perempuan" value={inv.settings.bride_font} onChange={(font) => updateSettings('bride_font', font)} />
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">
                          <span>Saiz</span>
                          <span>{inv.settings.bride_size || '48'}px</span>
                        </div>
                        <input type="range" min="20" max="80" value={inv.settings.bride_size || '48'} onChange={(e) => updateSettings('bride_size', e.target.value)} className="w-full accent-rose-600 h-1" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                        <span>Nama Tuan Rumah</span>
                        <input type="color" value={inv.settings.host_color || '#4B5563'} onChange={(e) => updateSettings('host_color', e.target.value)} className="w-4 h-4 rounded-full overflow-hidden border-none p-0 cursor-pointer" />
                      </label>
                      <input type="text" value={inv.host_names} onChange={(e) => updateField('host_names', e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FontPicker label="Font Tuan Rumah" value={inv.settings.host_font} onChange={(font) => updateSettings('host_font', font)} />
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1 pt-1">
                          <span>Saiz</span>
                          <span>{inv.settings.host_size || '16'}px</span>
                        </div>
                        <input type="range" min="10" max="40" value={inv.settings.host_size || '16'} onChange={(e) => updateSettings('host_size', e.target.value)} className="w-full accent-rose-600 h-1" />
                      </div>
                    </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                      <input type="text" placeholder="Contoh: Assalammualaikum W.B.T" value={inv.settings.greeting_text || ''} onChange={(e) => updateSettings('greeting_text', e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-300 transition text-sm outline-none" />
                      <FontPicker label="Font Greeting" value={inv.settings.greeting_font} onChange={(font) => updateSettings('greeting_font', font)} />
                    </div>
                  </div>

                  {/* Hero Title */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Wording Utama (Hero)</label>
                      <div className="flex gap-4">
                        <input type="color" value={inv.settings.hero_color || '#FFFFFF'} onChange={(e) => updateSettings('hero_color', e.target.value)} className="w-4 h-4 rounded-full border-none p-0 cursor-pointer" />
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] font-bold text-gray-400">Size</span>
                          <input type="range" min="10" max="60" value={inv.settings.hero_size || '12'} onChange={(e) => updateSettings('hero_size', e.target.value)} className="w-16 accent-rose-600" />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                      <input type="text" placeholder="Contoh: Raikan Cinta Kami" value={inv.settings.hero_title || ''} onChange={(e) => updateSettings('hero_title', e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-300 transition text-sm outline-none" />
                      <FontPicker label="Font Hero" value={inv.settings.hero_font} onChange={(font) => updateSettings('hero_font', font)} />
                    </div>
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
                    <div className="space-y-3">
                      <textarea rows={3} placeholder="Wording jemputan..." value={inv.settings.invitation_text || ''} onChange={(e) => updateSettings('invitation_text', e.target.value)} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-300 transition text-sm outline-none italic leading-relaxed" />
                      <FontPicker label="Font Teks Jemputan" value={inv.settings.invitation_font} onChange={(font) => updateSettings('invitation_font', font)} />
                    </div>
                  </div>

                </div>
              </section>

              <section className="space-y-8 pt-10 border-t border-gray-100 relative">
                {isDemo && <LockedOverlay />}
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
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Kisah Cinta Kita</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tajuk Kisah</label>
                    <input type="text" placeholder="Contoh: Kisah Cinta Kami" value={inv.settings.story_title || ''} onChange={(e) => updateSettings('story_title', e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kandungan Kisah</label>
                    <textarea rows={4} value={inv.settings.our_story} onChange={(e) => updateSettings('our_story', e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-3xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-medium italic leading-relaxed" />
                  </div>
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
            <div className="space-y-10 relative">
              {isDemo && <LockedOverlay />}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <FontPicker label="Font Tarikh" value={inv.settings.date_font} onChange={(font) => updateSettings('date_font', font)} />
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">
                        <span>Saiz Tarikh</span>
                        <span>{inv.settings.date_size || '16'}px</span>
                      </div>
                      <input type="range" min="10" max="40" value={inv.settings.date_size || '16'} onChange={(e) => updateSettings('date_size', e.target.value)} className="w-full accent-rose-600 h-1" />
                    </div>
                  </div>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                      <span>Nama Lokasi</span>
                      <input type="color" value={inv.settings.location_color || '#1F2937'} onChange={(e) => updateSettings('location_color', e.target.value)} className="w-4 h-4 rounded-full overflow-hidden border-none p-0 cursor-pointer" />
                    </label>
                    <input type="text" value={inv.location_name} onChange={(e) => updateField('location_name', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <FontPicker label="Font Lokasi" value={inv.settings.location_font} onChange={(font) => updateSettings('location_font', font)} />
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">
                        <span>Saiz Lokasi</span>
                        <span>{inv.settings.location_size || '14'}px</span>
                      </div>
                      <input type="range" min="10" max="40" value={inv.settings.location_size || '14'} onChange={(e) => updateSettings('location_size', e.target.value)} className="w-full accent-rose-600 h-1" />
                    </div>
                  </div>
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
                      updateField('itinerary', [...(inv.itinerary || []), newItem]);
                    }}
                    className="text-[10px] bg-gray-100 px-6 py-2.5 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-4">
                  {(inv.itinerary || []).map((item, index) => (
                    <div key={item.id} className="p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm space-y-4 group relative hover:shadow-md transition">
                      <button
                        onClick={() => {
                          const newList = (inv.itinerary || []).filter(i => i.id !== item.id);
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
                              const newList = [...(inv.itinerary || [])];
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
                              const newList = [...(inv.itinerary || [])];
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
            <div className="space-y-10 relative">
              {isDemo && <LockedOverlay />}
              <section className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Hubungi Keluarga</h3>
                  <button
                    onClick={() => {
                      const newContact: ContactPerson = { id: Date.now().toString(), name: 'Nama Baru', relation: 'Hubungan', phone: '01XXXXXXXX' };
                      updateField('contacts', [...(inv.contacts || []), newContact]);
                    }}
                    className="text-[10px] bg-gray-100 px-6 py-2.5 rounded-full font-bold uppercase tracking-widest hover:bg-gray-200 transition"
                  >
                    + Add New
                  </button>
                </div>
                <div className="space-y-6">
                  {(inv.contacts || []).map((contact, index) => (
                    <div key={contact.id} className="p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm space-y-4 group relative hover:shadow-md transition">
                      <button
                        onClick={() => {
                          const newList = (inv.contacts || []).filter(c => c.id !== contact.id);
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
                              const newList = [...(inv.contacts || [])];
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
                              const newList = [...(inv.contacts || [])];
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
                              const newList = [...(inv.contacts || [])];
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
            <div className="space-y-10 relative">
              {isDemo && <LockedOverlay />}
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
                    <div className="space-y-4 pb-6 border-b border-gray-100">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Section Title</label>
                        <input type="text" value={inv.money_gift_details.gift_title || 'Hadiah & Ingatan'} onChange={(e) => updateMoneyGift('gift_title', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none" placeholder="Default: Hadiah & Ingatan" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Section Subtitle</label>
                        <input type="text" value={inv.money_gift_details.gift_subtitle || 'Khas buat mempelai'} onChange={(e) => updateMoneyGift('gift_subtitle', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none" placeholder="Default: Khas buat mempelai" />
                      </div>
                    </div>

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

          {activeTab === 'wishlist' && (
            <div className="space-y-10 relative">
              {isDemo && <LockedOverlay />}
              <section className="space-y-8">
                <div className="flex items-center justify-between p-8 bg-rose-50 rounded-[3rem] border border-rose-100 shadow-inner">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-rose-800 tracking-tight italic">Physical Wishlist</span>
                    <span className="text-[10px] text-rose-300 uppercase font-bold tracking-widest">Gifts requested</span>
                  </div>
                  <input type="checkbox" checked={inv.wishlist_details?.enabled || false} onChange={(e) => updateWishlist('enabled', e.target.checked)} className="w-7 h-7 accent-rose-600 cursor-pointer" />
                </div>

                {inv.wishlist_details?.enabled && (
                  <div className="space-y-10 animate-slide-up">
                    <div className="space-y-4 pb-6 border-b border-gray-100">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Section Title</label>
                        <input type="text" value={inv.wishlist_details?.wishlist_title ?? ''} onChange={(e) => updateWishlist('wishlist_title', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none" placeholder="Physical Wishlist" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Section Subtitle</label>
                        <input type="text" value={inv.wishlist_details?.wishlist_subtitle ?? ''} onChange={(e) => updateWishlist('wishlist_subtitle', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none" placeholder="Gifts requested" />
                      </div>
                    </div>

                    <div className="space-y-8 pt-4">
                      <h4 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Maklumat Penerima</h4>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">No. Telefon Penerima</label>
                          <input type="text" value={inv.wishlist_details?.receiver_phone || ''} onChange={(e) => updateWishlist('receiver_phone', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none font-mono" placeholder="Contoh: 0123456789" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Alamat Penghantaran</label>
                          <textarea rows={3} value={inv.wishlist_details?.receiver_address || ''} onChange={(e) => updateWishlist('receiver_address', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none font-medium leading-relaxed" placeholder="Alamat penuh untuk pengeposan hadiah..." />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8 pt-6 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Permintaan Hadiah</h4>
                        <button
                          onClick={() => {
                            const newItem = { id: Date.now().toString(), item_name: 'Barangan Baru', item_link: '', item_image: '' };
                            updateWishlist('items', [...(inv.wishlist_details?.items || []), newItem]);
                          }}
                          className="text-[10px] bg-rose-50 text-rose-600 px-6 py-2.5 rounded-full font-bold uppercase tracking-widest hover:bg-rose-100 transition"
                        >
                          + Tambah Item
                        </button>
                      </div>

                      <div className="space-y-6">
                        {(inv.wishlist_details?.items || []).map((item, idx) => (
                          <div key={item.id} className="p-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm space-y-4 group relative hover:shadow-md transition">
                            <button
                              onClick={() => {
                                const newItems = (inv.wishlist_details.items || []).filter(i => i.id !== item.id);
                                updateWishlist('items', newItems);
                              }}
                              className="absolute top-4 right-4 text-gray-300 hover:text-rose-500 transition text-2xl"
                            >
                              &times;
                            </button>
                            <div className="flex gap-6">
                              <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100 flex-shrink-0 group-item">
                                {item.item_image ? (
                                  <img src={item.item_image} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                  </div>
                                )}
                                <button
                                  onClick={() => {
                                    setCurrentWishlistItemIdx(idx);
                                    wishlistItemInputRef.current?.click();
                                  }}
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                                >
                                  <span className="text-white text-[8px] font-bold uppercase tracking-widest">Upload</span>
                                </button>
                              </div>
                              <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Barang</label>
                                  <input
                                    type="text"
                                    value={item.item_name}
                                    onChange={(e) => {
                                      const newItems = [...(inv.wishlist_details.items || [])];
                                      newItems[idx].item_name = e.target.value;
                                      updateWishlist('items', newItems);
                                    }}
                                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-xs font-bold outline-none"
                                    placeholder="Contoh: Airfryer Philips"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Link (Shopee/Lazada)</label>
                                  <input
                                    type="text"
                                    value={item.item_link}
                                    onChange={(e) => {
                                      const newItems = [...(inv.wishlist_details.items || [])];
                                      newItems[idx].item_link = e.target.value;
                                      updateWishlist('items', newItems);
                                    }}
                                    className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl text-[9px] font-mono outline-none"
                                    placeholder="https://shopee.com.my/..."
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <input type="file" hidden ref={wishlistItemInputRef} accept="image/*" onChange={handleWishlistItemImageUpload} />
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'rsvp' && (user?.membership_tier === MembershipTier.PREMIUM || user?.membership_tier === MembershipTier.ELITE) && (
            <div className="space-y-10 relative">
              {isDemo && <LockedOverlay />}
              <section className="space-y-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Tetapan RSVP</h3>
                </div>

                {/* Response Mode */}
                <div className="space-y-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block">Mod Pilihan RSVP</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'rsvp_and_wish', label: 'RSVP + Ucapan' },
                        { id: 'wish_only', label: 'Ucapan Sahaja' },
                        { id: 'external', label: 'Pihak Ketiga (Google Form dll)' },
                        { id: 'none', label: 'Tiada RSVP' }
                      ].map((mode) => (
                        <button
                          key={mode.id}
                          onClick={() => updateRsvpSettings('response_mode', mode.id)}
                          className={`px-4 py-3 rounded-xl text-xs font-bold transition text-left border ${(inv.rsvp_settings?.response_mode || 'rsvp_and_wish') === mode.id
                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                            : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {inv.rsvp_settings?.response_mode === 'external' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Puktan Luar (URL)</label>
                      <input
                        type="text"
                        value={inv.rsvp_settings?.external_url || ''}
                        onChange={(e) => updateRsvpSettings('external_url', e.target.value)}
                        placeholder="https://forms.google.com/..."
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-xs outline-none font-bold"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nota Tambahan RSVP (jika ada)</label>
                    <textarea
                      rows={2}
                      value={inv.rsvp_settings?.note || ''}
                      onChange={(e) => updateRsvpSettings('note', e.target.value)}
                      placeholder="Contoh: Sila sahkan kehadiran selewat-lewatnya seminggu sebelum majlis."
                      className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-xs outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tarikh Tutup RSVP</label>
                    <input
                      type="date"
                      value={inv.rsvp_settings?.closing_date ? new Date(inv.rsvp_settings.closing_date).toISOString().split('T')[0] : ''}
                      onChange={(e) => updateRsvpSettings('closing_date', e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-xs outline-none font-bold text-gray-600"
                    />
                    <div className="flex justify-end">
                      <button onClick={() => updateRsvpSettings('closing_date', null)} className="text-[9px] text-rose-400 font-bold uppercase hover:text-rose-600">Reset</button>
                    </div>
                  </div>
                </div>

                {/* Fields Configuration */}
                {(inv.rsvp_settings?.response_mode || 'rsvp_and_wish') === 'rsvp_and_wish' && (
                  <div className="space-y-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Pilih Input Borang</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'name', label: 'Nama' },
                        { id: 'phone', label: 'Telefon' },
                        { id: 'email', label: 'Alamat Emel' },
                        { id: 'address', label: 'Alamat Rumah' },
                        { id: 'company', label: 'Nama Syarikat' },
                        { id: 'job_title', label: 'Jawatan' },
                        { id: 'car_plate', label: 'No. Plat Kenderaan' },
                        { id: 'remarks', label: 'Catatan' },
                        { id: 'wish', label: 'Ucapan' },
                      ].map((field) => (
                        <label key={field.id} className={`flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition ${field.id === 'name' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <input
                            type="checkbox"
                            checked={field.id === 'name' ? true : (inv.rsvp_settings?.fields?.[field.id as keyof typeof inv.rsvp_settings.fields] ?? (['name', 'phone', 'wish'].includes(field.id)))}
                            onChange={(e) => field.id !== 'name' && updateRsvpSettings(`fields.${field.id}`, e.target.checked)}
                            disabled={field.id === 'name'}
                            className="w-4 h-4 accent-rose-600 rounded"
                          />
                          <span className="text-xs font-bold text-gray-600">{field.label} {field.id === 'name' && '(Wajib)'}</span>
                        </label>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">Asingkan Kehadiran Kanak-kanak</span>
                        <input
                          type="checkbox"
                          checked={inv.rsvp_settings?.has_children_policy}
                          onChange={(e) => updateRsvpSettings('has_children_policy', e.target.checked)}
                          className="w-5 h-5 accent-rose-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Had Tetamu per RSVP</label>
                          <input
                            type="number"
                            min="1"
                            value={inv.rsvp_settings?.pax_limit_per_rsvp}
                            onChange={(e) => updateRsvpSettings('pax_limit_per_rsvp', parseInt(e.target.value))}
                            className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-xs outline-none font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Jumlah Keseluruhan</label>
                          <input
                            type="number"
                            min="1"
                            value={inv.rsvp_settings?.total_guest_limit}
                            onChange={(e) => updateRsvpSettings('total_guest_limit', parseInt(e.target.value))}
                            className="w-full px-5 py-3 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-xs outline-none font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">Slot / Kategori</span>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => updateRsvpSettings('has_slots', true)}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition ${inv.rsvp_settings?.has_slots ? 'bg-white shadow-sm text-rose-600' : 'text-gray-400'}`}
                          >Ada</button>
                          <button
                            onClick={() => updateRsvpSettings('has_slots', false)}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold transition ${!inv.rsvp_settings?.has_slots ? 'bg-white shadow-sm text-gray-600' : 'text-gray-400'}`}
                          >Tiada</button>
                        </div>
                      </div>

                      {inv.rsvp_settings?.has_slots && (
                        <div className="bg-gray-50 p-4 rounded-2xl space-y-3 animate-fade-in">
                          <p className="text-[10px] text-gray-400 italic">Tetamu perlu memilih satu daripada senarai ini:</p>
                          <div className="flex gap-2">
                            <input
                              id="new-slot-input"
                              placeholder="Cth: Keluarga Lelaki"
                              className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-rose-300"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const val = e.currentTarget.value.trim();
                                  if (val) {
                                    const current = inv.rsvp_settings?.slots_options || [];
                                    updateRsvpSettings('slots_options', [...current, val]);
                                    e.currentTarget.value = '';
                                  }
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                const input = document.getElementById('new-slot-input') as HTMLInputElement;
                                if (input && input.value.trim()) {
                                  const current = inv.rsvp_settings?.slots_options || [];
                                  updateRsvpSettings('slots_options', [...current, input.value.trim()]);
                                  input.value = '';
                                }
                              }}
                              className="bg-rose-600 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700"
                            >
                              Tambah
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {(inv.rsvp_settings?.slots_options || []).map((slot, idx) => (
                              <div key={idx} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2 group hover:border-red-200 transition">
                                <span className="text-xs font-bold text-gray-600 group-hover:text-red-400">{slot}</span>
                                <button
                                  onClick={() => {
                                    const current = inv.rsvp_settings?.slots_options || [];
                                    updateRsvpSettings('slots_options', current.filter((_, i) => i !== idx));
                                  }}
                                  className="text-gray-300 hover:text-red-500 font-bold"
                                >
                                  &times;
                                </button>
                              </div>
                            ))}
                            {(inv.rsvp_settings?.slots_options || []).length === 0 && (
                              <span className="text-[10px] text-gray-400 italic">Tiada slot ditambah.</span>
                            )}
                          </div>
                        </div>
                      )}
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
            {/* Live preview content */}
            <InvitationContent invitation={inv} isPreview={true} />
          </div>
        </div>
      </div>
    </div >
  );
};

export default EditorPage;