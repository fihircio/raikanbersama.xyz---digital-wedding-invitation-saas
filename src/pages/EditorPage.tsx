import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import PaymentModal from '../../components/Pricing/PaymentModal';
import { Invitation, ContactPerson, MembershipTier, RSVP, RsvpSettings, Plan } from '../../types';
import { MOCK_INVITATIONS, THEME_COLORS, FONT_FAMILIES, PACKAGE_PLANS, OPENING_TYPES, EFFECT_STYLES } from '../../constants';
import { buildApiUrl } from '../config';

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

const UploadGuide: React.FC<{ ratio?: string; note?: string }> = ({ ratio = 'Sistem akan semak saiz fail dan auto-compress imej yang disokong selepas upload.', note }) => (
  <div className="rounded-2xl border border-rose-100/60 bg-white/80 p-3 text-[9px] font-medium leading-relaxed text-gray-500">
    <p><span className="font-bold text-rose-500">Panduan upload:</span> {ratio}</p>
    {note && <p className="mt-1 text-gray-400">{note}</p>}
  </div>
);

import { InvitationContent } from './PublicInvitationPage';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import {
  PlusIcon,
  TagIcon,
  CalendarIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  TrashIcon,
  PencilSquareIcon,
  CurrencyDollarIcon,
  EyeIcon,
  XMarkIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, user, isLoading: authLoading } = useAuth();
  const { showNotification } = useNotification();
  const [inv, setInv] = useState<Invitation | null>(null);
  const [activeTab, setActiveTab] = useState('pembukaan');
  const [isPackageDropdownOpen, setIsPackageDropdownOpen] = useState(false);
  const [isDesignDropdownOpen, setIsDesignDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);
  const invitationBackgroundFileInputRef = useRef<HTMLInputElement>(null);
  const openingButtonBgFileInputRef = useRef<HTMLInputElement>(null);
  const footerLogoFileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);
  const wishlistItemInputRef = useRef<HTMLInputElement>(null);
  const [currentWishlistItemIdx, setCurrentWishlistItemIdx] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<Plan | null>(null);
  const [initialPackagePlan, setInitialPackagePlan] = useState<string>('free');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [showEditorOnboarding, setShowEditorOnboarding] = useState(false);
  const [editorOnboardingIndex, setEditorOnboardingIndex] = useState(0);
  const [uploadingVisualAsset, setUploadingVisualAsset] = useState<string | null>(null);
  const [backgrounds, setBackgrounds] = useState<any[]>([]);
  const [bgPagination, setBgPagination] = useState({ page: 1, hasNext: false, isLoading: false });

  const isGuest = !authLoading && !user;
  const isDemo = id === 'demo' || isGuest;

  const buildGuestInvitationPayload = (draft: Invitation, slug: string) => {
    const {
      id: _id,
      user_id: _userId,
      views: _views,
      wishes: _wishes,
      rsvps: _rsvps,
      created_at: _createdAt,
      updated_at: _updatedAt,
      ...rest
    } = draft as Invitation & { created_at?: string; updated_at?: string };

    return {
      ...rest,
      slug,
      template_id: draft.template_id || 'modern-classic',
      event_type: draft.event_type || 'Walimatulurus',
      bride_name: draft.bride_name || 'Pengantin Perempuan',
      groom_name: draft.groom_name || 'Pengantin Lelaki',
      host_names: draft.host_names || 'Keluarga Pengantin',
      event_date: draft.event_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      start_time: draft.start_time || '11:00',
      end_time: draft.end_time || '16:00',
      location_name: draft.location_name || 'Dewan Majlis',
      address: draft.address || 'Alamat Majlis, Bandar Baru, Kuala Lumpur',
      google_maps_url: draft.google_maps_url || '',
      waze_url: draft.waze_url || '',
      settings: {
        ...(draft.settings || {}),
        is_published: false,
        is_paid: false
      }
    };
  };

  const fetchBackgrounds = async (page = 1, append = false) => {
    setBgPagination(prev => ({ ...prev, isLoading: true }));
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(buildApiUrl(`/backgrounds?page=${page}&limit=12`), {
        headers
      });
      if (response.ok) {
        const res = await response.json();
        const newData = res.data || [];
        const meta = res.pagination || {};

        setBackgrounds(prev => append ? [...prev, ...newData] : newData);
        setBgPagination({
          page: meta.page,
          hasNext: meta.hasNext,
          isLoading: false
        });
      } else {
        setBgPagination(prev => ({ ...prev, isLoading: false }));
      }
    } catch (err) {
      console.error('Failed to fetch backgrounds', err);
      setBgPagination(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    if (!authLoading) fetchBackgrounds(1);
  }, [authLoading, token]);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (authLoading) return;

      // HANDLE GUEST-TO-MEMBER CONVERSION
      if (id === 'demo' && token && sessionStorage.getItem('pending_guest_invitation')) {
        try {
          console.log('🔄 Handoff: Converting guest data to user invitation...');
          const cachedRaw = sessionStorage.getItem('pending_guest_invitation');
          sessionStorage.removeItem('pending_guest_invitation'); // Clear early to prevent loops

          if (!cachedRaw) return;
          const cachedData = JSON.parse(cachedRaw);

          const slug = `invitation-${Date.now()}`;
          const newInvitation = buildGuestInvitationPayload(cachedData, slug);
          const { contacts: _contacts, itinerary: _itinerary, gallery: _gallery, ...createPayload } = newInvitation;

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

          const response = await fetch(buildApiUrl('/invitations'), {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(createPayload)
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ Handoff: Conversion successful!', data);
            await fetch(buildApiUrl(`/invitations/${data.data.id}`), {
              method: 'PUT',
              headers,
              credentials: 'include',
              body: JSON.stringify(newInvitation)
            }).catch((updateError) => {
              console.warn('Guest draft created, but full draft sync failed:', updateError);
            });
            navigate(`/edit/${data.data.id}`, { replace: true });
            return;
          } else {
            const errorData = await response.json();
            console.error('❌ Handoff: Conversion failed', errorData);
            showNotification('Draft digital anda gagal disimpan ke akaun anda. Sila bina baru di Catalog.', 'error');
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
          const plan = searchParams.get('plan') || 'elite';

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
              story_title: 'Maklumat Tambahan',
              our_story: 'Kisah cinta kami bermula di sebuah perpustakaan lama...',
              hashtag_text: '#AisyahDanAhmun2025',
              hashtag_color: '#8B4513',
              hashtag_size: '18',
              hashtag_font: 'Great Vibes',
              pantun: 'Tuai padi antara nampak, Esok jangan layu-layuan; Intai kami antara nampak, Esok jangan rindu-rinduan.',
              groom_color: '#8B4513',
              bride_color: '#8B4513',
              host_color: '#4B5563',
              date_color: '#1F2937',
              greeting_color: '#111827',
              greeting_size: '36',
              hero_color: '#111827',
              hero_size: '12',
              invitation_color: '#6B7280',
              invitation_size: '14',
              opening_button_color: '#374151',
              opening_button_font: '',
              package_plan: plan,
              is_paid: false
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
          // If trying to access a real ID without auth, send user back through login.
          navigate(`/login?redirect=${encodeURIComponent(`/edit/${id}`)}`, { replace: true });
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

        const response = await fetch(buildApiUrl(`/invitations/${id}`), {
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

          const plan = invitationData.settings?.package_plan || 'free';
          const isPaid = invitationData.settings?.is_paid || false;
          if (!isPaid) {
            invitationData = {
              ...invitationData,
              settings: {
                ...invitationData.settings,
                package_plan: 'elite'
              }
            };
          }
          setInv(invitationData);
          setInitialPackagePlan(isPaid ? plan : 'free');
        } else {
          const errorData = await response.json().catch(() => null);
          console.error('❌ Editor: Failed to fetch invitation:', response.statusText, errorData);
          const found = MOCK_INVITATIONS.find(item => item.id === id);
          if (found) {
            setInv(found);
          } else {
            showNotification(`Invitation with ID "${id}" not found.`, 'error');
            navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('❌ Editor: Error fetching invitation:', error);
        const found = MOCK_INVITATIONS.find(item => item.id === id);
        if (found) {
          setInv(found);
        } else {
          showNotification('Editor failed to load this invitation. Please try again from Dashboard.', 'error');
          navigate('/dashboard');
        }
      }
    };

    if (!id) {
      // If no ID is present, we should not be here. 
      // Redirect to catalog to pick a design.
      navigate('/catalog');
    } else {
      fetchInvitation();
    }
  }, [authLoading, id, token, searchParams, navigate, showNotification]);

  useEffect(() => {
    if (authLoading || !inv) return;

    const onboardingKey = user?.id ? `rb_editor_onboarding_v1_seen_${user.id}` : 'rb_editor_onboarding_v1_seen_guest';
    if (!localStorage.getItem(onboardingKey)) {
      setShowEditorOnboarding(true);
      setEditorOnboardingIndex(0);
      setActiveTab('pembukaan');
      setShowMobilePreview(false);
    }
  }, [authLoading, inv?.id, user?.id]);

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

      const response = await fetch(buildApiUrl(`/invitations/${id}`), {
        method: 'PUT',
        headers,
        body: JSON.stringify(inv),
        credentials: 'include'
      });

      if (response.ok) {
        console.log('Invitation saved successfully!');
        showNotification('Changes saved successfully!', 'success');
      } else {
        const errorData = await response.json();
        console.error('Failed to save invitation:', errorData);
        showNotification(`Failed to save invitation: ${errorData.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving invitation:', error);
      showNotification('Error saving invitation. Please try again.', 'error');
    }
  };

  if (authLoading || !inv) return <div className="pt-32 text-center font-serif italic text-gray-400 text-xl">Loading Studio...</div>;

  const currentTier = inv.settings.package_plan || 'free';

  const canAccess = (feature: string) => {
    if (isDemo) return true; // Guests see everything (locked)

    switch (feature) {
      case 'rsvp':
      case 'wishes':
      case 'visual_effects':
      case 'gallery':
      case 'money_gift':
        return ['pro', 'elite'].includes(currentTier);
      case 'wish_list':
      case 'custom_link':
        return currentTier === 'elite';
      default:
        return true; // Core features (including Youtube Media for Lite)
    }
  };

  const editorSteps = [
    { id: 'pembukaan', label: 'Pakej', description: 'Pelan, background, animasi' },
    { id: 'utama', label: 'Utama', description: 'Cover, nama, wording' },
    { id: 'butiran', label: 'Butiran', description: 'Tarikh, lokasi, masa' },
    { id: 'design', label: 'Design', description: 'Layout dan warna tema' },
    { id: 'media', label: 'Media', description: 'Muzik, video, galeri' },
    { id: 'tetamu', label: 'Keluarga', description: 'Contact person' },
    { id: 'hadiah', label: 'Hadiah', description: 'Money gift', feature: 'money_gift' },
    { id: 'wishlist', label: 'Wishlist', description: 'Senarai hadiah', feature: 'wish_list' },
    { id: 'rsvp', label: 'RSVP', description: 'Tetapan kehadiran', feature: 'rsvp' },
  ].filter(step => !step.feature || canAccess(step.feature));
  const activeStepIndex = Math.max(0, editorSteps.findIndex(step => step.id === activeTab));
  const activeStep = editorSteps[activeStepIndex] || editorSteps[0];
  const editorOnboardingDescriptions: Record<string, string> = {
    pembukaan: 'Pilih pakej, latar belakang, animasi pembukaan dan effect. Untuk demo, bahagian ini boleh diuji penuh sebelum bayar.',
    utama: 'Tetapkan cover utama: nama, wording cover, tarikh, lokasi, hashtag dan susun atur paparan pertama.',
    butiran: 'Isi kandungan jemputan seperti kata aluan, butiran majlis, atur cara, ucapan doa dan maklumat tambahan.',
    design: 'Laraskan identiti visual, warna tema, gaya tajuk, latar belakang dan margin kandungan jemputan.',
    media: 'Tambah muzik, video dan galeri supaya kad lebih hidup. Tetamu akan nampak ini selepas buka jemputan.',
    tetamu: 'Masukkan contact person keluarga supaya tetamu boleh hubungi pihak majlis dengan mudah.',
    hadiah: 'Aktifkan money gift dan QR jika mahu tetamu beri sumbangan digital.',
    wishlist: 'Tambah wishlist fizikal untuk hadiah yang tetamu boleh rujuk sebelum majlis.',
    rsvp: 'Tetapkan borang RSVP, had pax, slot masa dan maklumat tetamu yang perlu dikumpul.'
  };
  const activeEditorOnboardingStep = editorSteps[Math.min(editorOnboardingIndex, editorSteps.length - 1)] || editorSteps[0];
  const goToEditorStep = (stepId: string) => setActiveTab(stepId);
  const goToPreviousStep = () => {
    const previousStep = editorSteps[Math.max(0, activeStepIndex - 1)];
    if (previousStep) setActiveTab(previousStep.id);
  };
  const goToNextStep = () => {
    const nextStep = editorSteps[Math.min(editorSteps.length - 1, activeStepIndex + 1)];
    if (nextStep) setActiveTab(nextStep.id);
  };
  const completeEditorOnboarding = () => {
    const onboardingKey = user?.id ? `rb_editor_onboarding_v1_seen_${user.id}` : 'rb_editor_onboarding_v1_seen_guest';
    localStorage.setItem(onboardingKey, JSON.stringify({ completedAt: new Date().toISOString() }));
    setShowEditorOnboarding(false);
    setEditorOnboardingIndex(0);
    setActiveTab(editorSteps[0]?.id || 'pembukaan');
  };
  const goToNextEditorOnboardingStep = () => {
    if (editorOnboardingIndex >= editorSteps.length - 1) {
      completeEditorOnboarding();
      return;
    }

    const nextIndex = editorOnboardingIndex + 1;
    const nextStep = editorSteps[nextIndex];
    setEditorOnboardingIndex(nextIndex);
    if (nextStep) setActiveTab(nextStep.id);
  };
  const goToPreviousEditorOnboardingStep = () => {
    const previousIndex = Math.max(0, editorOnboardingIndex - 1);
    const previousStep = editorSteps[previousIndex];
    setEditorOnboardingIndex(previousIndex);
    if (previousStep) setActiveTab(previousStep.id);
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

  const updateCoverDate = (value: string) => {
    if (!inv) return;
    setInv({
      ...inv,
      event_date: value,
      settings: {
        ...inv.settings,
        cover_date: value
      }
    });
  };

  const updateCoverLocation = (value: string) => {
    if (!inv) return;
    setInv({
      ...inv,
      location_name: value,
      settings: {
        ...inv.settings,
        cover_location: value
      }
    });
  };

  const renderVisibilityToggle = (field: keyof Invitation['settings']) => {
    if (!inv) return null;
    return (
      <label className="flex items-center gap-2 text-[8px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer select-none">
        <input
          type="checkbox"
          checked={inv.settings[field] !== false}
          onChange={(e) => updateSettings(field, e.target.checked)}
          className="w-4 h-4 accent-rose-600"
        />
        <span>Papar</span>
      </label>
    );
  };

  const renderHashtagPanel = (label = 'Hashtag Cover') => {
    if (!inv) return null;
    return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex justify-between items-center mb-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="flex gap-4">
          {renderVisibilityToggle('show_hashtag')}
          <input type="color" value={inv.settings.hashtag_color || '#8B4513'} onChange={(e) => updateSettings('hashtag_color', e.target.value)} className="w-4 h-4 rounded-full border-none p-0 cursor-pointer" />
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-bold text-gray-400">Size</span>
            <input type="range" min="10" max="32" value={inv.settings.hashtag_size || '16'} onChange={(e) => updateSettings('hashtag_size', e.target.value)} className="w-16 accent-rose-600" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Contoh: #AisyahDanAhmun2025"
          value={inv.settings.hashtag_text || ''}
          onChange={(e) => updateSettings('hashtag_text', e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-300 transition text-sm font-bold outline-none"
        />
        <FontPicker label="Font Hashtag" value={inv.settings.hashtag_font} onChange={(font) => updateSettings('hashtag_font', font)} />
        <p className="text-[8px] text-gray-400 italic px-1">Hashtag ini akan dipaparkan di bawah nama lokasi pada cover dan bahagian butiran.</p>
      </div>
    </div>
    );
  };

  const updateLayoutSettings = (field: keyof NonNullable<Invitation['settings']['layout_settings']>, value: any) => {
    if (!inv) return;
    setInv({
      ...inv,
      settings: {
        ...inv.settings,
        layout_settings: {
          ...inv.settings.layout_settings,
          [field]: value
        }
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

  const uploadLimitsMb = {
    gallery: 2,
    cover: 2,
    invitation: 2,
    'opening-button': 1,
    'footer-logo': 1,
    qr: 1,
    wishlist: 1
  } as const;

  const validateUploadSize = (file: File, limitMb: number) => {
    const limitBytes = limitMb * 1024 * 1024;
    if (file.size <= limitBytes) return true;
    showNotification(`Saiz fail terlalu besar. Maksimum ${limitMb}MB untuk upload ini.`, 'error');
    return false;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && !validateUploadSize(file, uploadLimitsMb.gallery)) return;
    if (file && token && id && !isDemo) {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      const csrfToken = getCookie('csrf-token');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('invitation_id', id);

      try {
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${token}`
        };
        if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

        const response = await fetch(buildApiUrl('/files/gallery'), {
          method: 'POST',
          headers,
          body: formData,
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          updateField('gallery', [...(inv.gallery || []), data.data.url]);
        } else {
          const err = await response.json();
          showNotification(`Upload gagal: ${err.error || 'Unknown error'}`, 'error');
        }
      } catch (error) {
        console.error('❌ Upload error:', error);
        showNotification('Gagal memuat naik imej. Sila cuba lagi.', 'error');
      }
    } else if (file && isDemo) {
      // Keep demo behavior (local preview only)
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('gallery', [...(inv.gallery || []), reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  type VisualAssetTarget = 'cover' | 'invitation' | 'opening-button' | 'footer-logo';
  const visualAssetFieldMap: Record<VisualAssetTarget, keyof Invitation['settings']> = {
    cover: 'background_image',
    invitation: 'invitation_background_image',
    'opening-button': 'opening_button_bg_image',
    'footer-logo': 'footer_logo_url'
  };

  const handleVisualAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: VisualAssetTarget) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !inv) return;
    if (!validateUploadSize(file, uploadLimitsMb[target])) return;

    if (inv.settings.package_plan !== 'elite') {
      showNotification('Upload gambar sendiri hanya tersedia untuk pakej Elite.', 'error');
      return;
    }

    if (isDemo || !token || !id) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings(visualAssetFieldMap[target], reader.result as string);
        showNotification('Preview gambar dimuat naik secara lokal. Save & Unlock untuk simpan ke akaun.', 'success');
      };
      reader.readAsDataURL(file);
      return;
    }

    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    const csrfToken = getCookie('csrf-token');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('invitation_id', id);
    formData.append('target', target);

    try {
      setUploadingVisualAsset(target);
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`
      };
      if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

      const response = await fetch(buildApiUrl('/files/background'), {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        updateSettings(visualAssetFieldMap[target], data.data.url);
        showNotification('Asset custom berjaya dimuat naik.', 'success');
      } else {
        const err = await response.json().catch(() => ({}));
        showNotification(`Upload asset gagal: ${err.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('❌ Background upload error:', error);
      showNotification('Gagal memuat naik asset. Sila cuba lagi.', 'error');
    } finally {
      setUploadingVisualAsset(null);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && !validateUploadSize(file, uploadLimitsMb.qr)) return;
    if (file && token && id && !isDemo) {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      const csrfToken = getCookie('csrf-token');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('invitation_id', id);

      try {
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${token}`
        };
        if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

        const response = await fetch(buildApiUrl('/files/qr-code'), {
          method: 'POST',
          headers,
          body: formData,
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          updateMoneyGift('qr_url', data.data.url);
        } else {
          const err = await response.json();
          showNotification(`Upload QR gagal: ${err.error || 'Unknown error'}`, 'error');
        }
      } catch (error) {
        console.error('❌ QR Upload error:', error);
      }
    } else if (file && isDemo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateMoneyGift('qr_url', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWishlistItemImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file && !validateUploadSize(file, uploadLimitsMb.wishlist)) return;
    if (file && token && id && currentWishlistItemIdx !== null && !isDemo) {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      const csrfToken = getCookie('csrf-token');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('invitation_id', id);
      formData.append('target', 'wishlist-item');

      try {
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${token}`
        };
        if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

        const response = await fetch(buildApiUrl('/files/gallery'), { // Reuse gallery endpoint for wishlist items
          method: 'POST',
          headers,
          body: formData,
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          const newItems = [...(inv.wishlist_details.items || [])];
          newItems[currentWishlistItemIdx].item_image = data.data.url;
          updateWishlist('items', newItems);
        }
      } catch (error) {
        console.error('❌ Wishlist Image Upload error:', error);
      }
    } else if (file && isDemo && currentWishlistItemIdx !== null) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newItems = [...(inv.wishlist_details.items || [])];
        newItems[currentWishlistItemIdx].item_image = reader.result as string;
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

  const renderBackgroundColorSection = () => (
    <section className="space-y-8 pt-10 border-t border-gray-100">
      <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Warna Latar Belakang</h3>
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Warna Latar Belakang</label>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={inv.settings.background_color || '#ffffff'}
              onChange={(e) => updateSettings('background_color', e.target.value)}
              className="w-16 h-16 rounded-2xl border-2 border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition"
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 mb-1">{inv.settings.background_color || '#ffffff'}</p>
              <p className="text-[9px] text-gray-400 leading-relaxed">Pilih warna latar untuk keseluruhan kad jemputan anda</p>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {['#ffffff', '#f9fafb', '#fef2f2', '#fef3c7', '#f0fdf4', '#ede9fe'].map(color => (
              <button
                key={color}
                onClick={() => updateSettings('background_color', color)}
                className={`w-full aspect-square rounded-xl border-2 transition-all hover:scale-110 ${(inv.settings.background_color || '#ffffff') === color
                  ? 'border-rose-400 ring-2 ring-rose-100'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">
              <span>Ketelusan (Opacity)</span>
              <span>{Math.round((inv.settings.background_opacity ?? 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={inv.settings.background_opacity ?? 1}
              onChange={(e) => updateSettings('background_opacity', parseFloat(e.target.value))}
              className="w-full accent-rose-600 h-2 rounded-full"
            />
            <p className="text-[8px] text-gray-400 italic">0% = Lutsinar, 100% = Pejal</p>
          </div>
        </div>
      </div>
    </section>
  );

  const fallbackBackgrounds = [
    {
      url: 'https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/birthday.png',
      thumbnail: 'https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/birthday.png',
      name: 'Birthday Celebration'
    },
    {
      url: 'https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655907962-1266b68c8f54ee4d.webp',
      thumbnail: 'https://raikanbersama-server-bucket.s3.ap-southeast-1.amazonaws.com/background/admin/1769655907962-1266b68c8f54ee4d.webp',
      name: 'Classic Vintage 01'
    },
    {
      url: inv.settings.background_image || '',
      thumbnail: inv.settings.background_image || '',
      name: 'Design Semasa'
    }
  ].filter(bg => bg.url);

  const backgroundSource = backgrounds.length > 0 ? backgrounds : fallbackBackgrounds;
  const backgroundOptions = inv.settings.background_image && !backgroundSource.some((bg: any) => bg.url === inv.settings.background_image)
    ? [{ url: inv.settings.background_image, thumbnail: inv.settings.background_image, name: 'Design Semasa' }, ...backgroundSource]
    : backgroundSource;

  const renderBackgroundSection = () => (
    <section className="space-y-8 pt-10 border-t border-gray-100">
      <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Latar Belakang</h3>

      <div className="space-y-4">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilih Background Image</label>
        <div className="grid grid-cols-3 gap-3 max-h-[320px] overflow-y-auto no-scrollbar pr-1">
          {backgroundOptions.map((bg: any, idx) => (
            <button
              key={`${bg.url}-${idx}`}
              onClick={() => updateSettings('background_image', bg.url)}
              className={`aspect-[2/3] rounded-xl overflow-hidden border-2 transition-all relative group ${inv.settings.background_image === bg.url ? 'border-rose-500 ring-2 ring-rose-200 scale-95' : 'border-transparent hover:border-gray-200'}`}
            >
              <img src={bg.thumbnail || bg.url} alt={bg.name} className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-black/20 transition-opacity ${inv.settings.background_image === bg.url ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {inv.settings.background_image === bg.url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}

          {bgPagination.hasNext && (
            <div className="col-span-3 pt-2 pb-1">
              <button
                onClick={() => fetchBackgrounds(bgPagination.page + 1, true)}
                disabled={bgPagination.isLoading}
                className="w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-100 hover:text-gray-700 transition flex items-center justify-center gap-2"
              >
                {bgPagination.isLoading ? (
                  <>
                    <svg className="animate-spin h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>Muat Lebih Banyak Design ({backgrounds.length})</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {inv.settings.package_plan === 'elite' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Atau Masukkan URL Gambar (Custom)</label>
            <div className="relative group">
              <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help hover:text-rose-500 transition" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-4 bg-gray-900/95 text-white text-[10px] rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none backdrop-blur-sm transform scale-95 group-hover:scale-100 origin-bottom">
                <p className="font-bold mb-1.5 text-rose-300 uppercase tracking-wider text-[9px]">Panduan Saiz Image</p>
                <p className="leading-relaxed opacity-90 mb-2">
                  Disarankan saiz <span className="font-bold text-white">768x1408px (Portrait)</span>.
                </p>
                <p className="leading-relaxed opacity-70 italic text-[9px]">
                  Gambar ini akan dijadikan latar belakang penuh untuk kad jemputan digital anda.
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/95"></div>
              </div>
            </div>
          </div>
          <input
            type="text"
            placeholder="https://..."
            value={inv.settings.background_image}
            onChange={(e) => updateSettings('background_image', e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-medium"
          />
          <div className="rounded-[2rem] border border-rose-100 bg-rose-50/60 p-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
                {inv.settings.background_image ? (
                  <img src={inv.settings.background_image} alt="Custom background preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[8px] font-bold uppercase tracking-widest text-gray-300">Preview</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-500">Upload Gambar Sendiri</p>
                <UploadGuide
                  ratio="Maksimum 2MB. Disarankan 768x1408px atau nisbah 9:19.5."
                  note="Sistem akan crop portrait dan compress ke WebP untuk kad."
                />
              </div>
              <button
                type="button"
                onClick={() => backgroundFileInputRef.current?.click()}
                disabled={uploadingVisualAsset === 'cover'}
                className="rounded-full bg-rose-600 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingVisualAsset === 'cover' ? 'Uploading...' : 'Upload'}
              </button>
              <input
                ref={backgroundFileInputRef}
                type="file"
                hidden
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => handleVisualAssetUpload(e, 'cover')}
              />
            </div>
          </div>
        </div>
      )}

    </section>
  );

  const renderInvitationBackgroundSection = () => {
    const selectedBackground = inv.settings.invitation_background_image || '';
    return (
      <section className="space-y-8 pt-10 border-t border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Latar Belakang Butiran</h3>
            <p className="mt-3 text-[9px] font-medium leading-relaxed text-gray-400">Untuk Elite: asingkan background bahagian butiran daripada cover. Kosongkan untuk ikut background cover.</p>
          </div>
          {selectedBackground && (
            <button
              type="button"
              onClick={() => updateSettings('invitation_background_image', '')}
              className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:border-rose-200 hover:text-rose-500"
            >
              Ikut Cover
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 max-h-[260px] overflow-y-auto no-scrollbar pr-1">
          {backgroundOptions.map((bg: any, idx) => (
            <button
              key={`invitation-${bg.url}-${idx}`}
              onClick={() => updateSettings('invitation_background_image', bg.url)}
              className={`aspect-[2/3] rounded-xl overflow-hidden border-2 transition-all relative group ${selectedBackground === bg.url ? 'border-rose-500 ring-2 ring-rose-200 scale-95' : 'border-transparent hover:border-gray-200'}`}
            >
              <img src={bg.thumbnail || bg.url} alt={bg.name} className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-black/20 transition-opacity ${selectedBackground === bg.url ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {selectedBackground === bg.url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}

          {bgPagination.hasNext && (
            <div className="col-span-3 pt-2 pb-1">
              <button
                type="button"
                onClick={() => fetchBackgrounds(bgPagination.page + 1, true)}
                disabled={bgPagination.isLoading}
                className="w-full py-3 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-500 uppercase tracking-widest hover:bg-gray-100 hover:text-gray-700 transition flex items-center justify-center gap-2"
              >
                {bgPagination.isLoading ? (
                  <>
                    <svg className="animate-spin h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>Muat Lebih Banyak Design ({backgrounds.length})</>
                )}
              </button>
            </div>
          )}
        </div>

        {inv.settings.package_plan === 'elite' && (
          <div className="rounded-[2rem] border border-rose-100 bg-rose-50/60 p-4 space-y-4">
            <input
              type="text"
              placeholder="https://..."
              value={selectedBackground}
              onChange={(e) => updateSettings('invitation_background_image', e.target.value)}
              className="w-full px-5 py-4 bg-white border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-medium"
            />
            <div className="flex items-center gap-4">
              <div className="h-20 w-14 shrink-0 overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
                {selectedBackground ? (
                  <img src={selectedBackground} alt="Invitation background preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-center text-[8px] font-bold uppercase tracking-widest text-gray-300">Ikut Cover</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-500">Upload Background Butiran</p>
                <UploadGuide
                  ratio="Maksimum 2MB. Disarankan portrait 768x1408px atau nisbah 9:19.5."
                  note="Background ini hanya untuk bahagian selepas cover dan akan di-compress ke WebP."
                />
              </div>
              <button
                type="button"
                onClick={() => invitationBackgroundFileInputRef.current?.click()}
                disabled={uploadingVisualAsset === 'invitation'}
                className="rounded-full bg-rose-600 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploadingVisualAsset === 'invitation' ? 'Uploading...' : 'Upload'}
              </button>
              <input
                ref={invitationBackgroundFileInputRef}
                type="file"
                hidden
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => handleVisualAssetUpload(e, 'invitation')}
              />
            </div>
          </div>
        )}
      </section>
    );
  };

  const renderFooterBrandingSection = () => {
    const footerLogo = inv.settings.footer_logo_url || '/logo.png';
    return (
      <section className="space-y-8 pt-10 border-t border-gray-100">
        <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Footer Kad</h3>
        <div className="rounded-[2rem] border border-gray-100 bg-gray-50 p-4 space-y-5">
          <label className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-gray-100">
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">Papar Footer Credit</span>
              <span className="mt-1 block text-[9px] font-medium text-gray-400">Teks dan logo di bahagian bawah kad.</span>
            </span>
            <input
              type="checkbox"
              checked={inv.settings.show_footer_credit !== false}
              onChange={(e) => updateSettings('show_footer_credit', e.target.checked)}
              className="h-5 w-5 accent-rose-600"
            />
          </label>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">URL Logo Footer</label>
            <input
              type="text"
              value={inv.settings.footer_logo_url || ''}
              placeholder="/logo.png"
              onChange={(e) => updateSettings('footer_logo_url', e.target.value)}
              className="w-full px-5 py-4 bg-white border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-medium"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-white bg-white shadow-sm">
              <img src={footerLogo} alt="Footer logo preview" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-500">Upload Logo Footer</p>
              <UploadGuide
                ratio="Maksimum 1MB. Disarankan square 512x512px."
                note="PNG transparent paling sesuai untuk logo. Sistem akan compress imej sebelum simpan."
              />
            </div>
            <button
              type="button"
              onClick={() => footerLogoFileInputRef.current?.click()}
              disabled={uploadingVisualAsset === 'footer-logo'}
              className="rounded-full bg-rose-600 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingVisualAsset === 'footer-logo' ? 'Uploading...' : 'Upload'}
            </button>
            <input
              ref={footerLogoFileInputRef}
              type="file"
              hidden
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => handleVisualAssetUpload(e, 'footer-logo')}
            />
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="pt-16 h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Controls */}
      <div className="w-full md:w-[480px] bg-white border-r border-gray-200 flex flex-col h-full shadow-2xl z-20">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white gap-4">
          <div className="flex-1">
            {inv.settings.package_plan && inv.settings.package_plan !== 'free' ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm border ${inv.settings.is_published ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                    {inv.settings.is_published ? '🔥 Live' : 'Draft'}
                  </div>
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">{inv.settings.package_plan} Plan</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50/50 p-2 rounded-2xl border border-gray-100 pr-5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-3">Publish</span>
                  <button
                    onClick={() => {
                      if (!inv.settings.is_paid) {
                        alert('Sila beli pakej untuk mengaktifkan fungsi Publish (Live).');
                        return;
                      }
                      updateSettings('is_published', !inv.settings.is_published);
                    }}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none ring-2 ring-offset-2 ${inv.settings.is_published ? 'bg-emerald-500 ring-emerald-100' : 'bg-gray-200 ring-gray-50'} ${!inv.settings.is_paid ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${inv.settings.is_published ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold font-serif italic text-gray-800 tracking-tight">Design Studio</h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Crafting perfection</p>
              </>
            )}
          </div>
          <button
            onClick={saveInvitation}
            disabled={isDemo ? false : (!id || !token)}
            className="flex-1 max-w-[140px] py-4 bg-rose-600 text-white rounded-2xl font-bold text-[10px] shadow-xl shadow-rose-100 hover:bg-rose-700 transition transform active:scale-95 disabled:opacity-50 uppercase tracking-widest"
          >
            {isDemo ? 'Save & Unlock' : 'Save Changes'}
          </button>
        </div>
        {showPaymentModal && selectedPlanForPayment && (
          <PaymentModal
            plan={selectedPlanForPayment}
            invitationId={id}
            onClose={() => setShowPaymentModal(false)}
          />
        )}
        <div className="border-b border-gray-200 bg-gray-50/80 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold text-rose-400 uppercase tracking-[0.25em]">Langkah Editor</p>
              <p className="text-sm font-black text-gray-900">{activeStepIndex + 1}/{editorSteps.length} · {activeStep?.label}</p>
              {activeStep?.description && (
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{activeStep.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={activeStepIndex === 0}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-rose-200 hover:text-rose-500 transition flex items-center justify-center"
                aria-label="Langkah sebelumnya"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                type="button"
                onClick={goToNextStep}
                disabled={activeStepIndex === editorSteps.length - 1}
                className="w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-rose-200 hover:text-rose-500 transition flex items-center justify-center"
                aria-label="Langkah seterusnya"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 no-scrollbar">
          {activeTab === 'pembukaan' && (
            <div className="space-y-10 relative">
              <section className="space-y-8">
                <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Pakej & Konsep</h3>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilihan Pakej</label>
                  <div className="relative">
                    {initialPackagePlan !== 'free' ? (
                      <div className="w-full bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 flex flex-col items-center text-center shadow-inner">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Pakej Langganan Aktif</span>
                        <span className="text-2xl font-black text-rose-600 capitalize mb-2">{PACKAGE_PLANS.find(p => p.id === initialPackagePlan)?.label}</span>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-rose-100 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Plan Active</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Trigger Button - Only visible if not purchased */}
                        <button
                          onClick={() => setIsPackageDropdownOpen(!isPackageDropdownOpen)}
                          className={`w-full bg-white border-2 rounded-3xl p-5 flex items-center justify-between transition-all shadow-sm group ${isPackageDropdownOpen ? 'border-rose-400 ring-4 ring-rose-50' : 'border-rose-100 hover:border-rose-300'}`}
                        >
                          <div className="text-left">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Pelan Dipilih</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-gray-900 capitalize">{PACKAGE_PLANS.find(p => p.id === (inv.settings.package_plan || 'free'))?.label || 'Free'}</span>
                              {inv.settings.package_plan !== initialPackagePlan && initialPackagePlan === 'free' && (
                                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[9px] font-bold rounded-full uppercase tracking-tighter">Preview</span>
                              )}
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
                            {PACKAGE_PLANS.filter(p => p.id !== 'free').map(plan => (
                              <button
                                key={plan.id}
                                onClick={() => {
                                  if (inv.settings.package_plan !== plan.id) {
                                    updateSettings('package_plan', plan.id);
                                  }
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
                                    <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{plan.description}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xl font-bold text-rose-600">RM{plan.price}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Purchase Button - Only show if current selected plan is NOT the initial plan and NOT 'free' */}
                        {inv.settings.package_plan !== initialPackagePlan && inv.settings.package_plan !== 'free' && (
                          <div className="p-5 bg-rose-600 rounded-[2.5rem] shadow-2xl shadow-rose-200 animate-slide-up mt-4">
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <p className="text-[9px] font-bold text-rose-100 uppercase tracking-widest opacity-80">Buka Semua Fungsi</p>
                                <p className="text-white font-bold text-lg">Pakej {PACKAGE_PLANS.find(p => p.id === inv.settings.package_plan)?.label}</p>
                              </div>
                              <p className="text-2xl font-bold text-white">RM{PACKAGE_PLANS.find(p => p.id === inv.settings.package_plan)?.price}</p>
                            </div>
                            <button
                              onClick={() => {
                                const planData = PACKAGE_PLANS.find(p => p.id === inv.settings.package_plan);
                                if (planData) {
                                  setSelectedPlanForPayment(planData as any);
                                  setShowPaymentModal(true);
                                }
                              }}
                              className="w-full py-4 bg-white text-rose-600 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-rose-50 transition-colors shadow-lg"
                            >
                              Beli & Aktifkan Sekarang
                            </button>
                            <p className="text-[9px] text-rose-100 text-center mt-3 font-medium opacity-70 italic">*Pembayaran sekali sahaja untuk setiap invite</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>


              </section>

              {renderBackgroundSection()}

              {['pro', 'elite'].includes(inv.settings.package_plan || 'free') && (
                <section className="space-y-8 pt-10 border-t border-gray-100">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Animasi Pembukaan</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
                        <span>Jenis Animasi</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                        <FontPicker label="Font Butang Buka" value={inv.settings.opening_button_font} onChange={(font) => updateSettings('opening_button_font', font)} />
                        <div className="grid grid-cols-2 gap-3">
                          <label className="space-y-2">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Warna Skin</span>
                            <input
                              type="color"
                              value={inv.settings.opening_color || '#ffffff'}
                              onChange={(e) => updateSettings('opening_color', e.target.value)}
                              className="w-full h-12 rounded-xl overflow-hidden border border-gray-100 p-1 cursor-pointer bg-white"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Warna Font Buka</span>
                            <input
                              type="color"
                              value={inv.settings.opening_button_color || '#374151'}
                              onChange={(e) => updateSettings('opening_button_color', e.target.value)}
                              className="w-full h-12 rounded-xl overflow-hidden border border-gray-100 p-1 cursor-pointer bg-white"
                            />
                          </label>
                        </div>
                      </div>
                      {inv.settings.package_plan === 'elite' && (
                        <div className="rounded-[2rem] border border-rose-100 bg-rose-50/50 p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <label className="space-y-2">
                              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Background Buka</span>
                              <input
                                type="color"
                                value={inv.settings.opening_button_bg_color || '#ffffff'}
                                onChange={(e) => updateSettings('opening_button_bg_color', e.target.value)}
                                className="w-full h-12 rounded-xl overflow-hidden border border-gray-100 p-1 cursor-pointer bg-white"
                              />
                            </label>
                            <div className="space-y-2">
                              <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">
                                <span>Tint Image</span>
                                <span>{Math.round((inv.settings.opening_button_bg_opacity ?? 0.9) * 100)}%</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={inv.settings.opening_button_bg_opacity ?? 0.9}
                                onChange={(e) => updateSettings('opening_button_bg_opacity', parseFloat(e.target.value))}
                                className="w-full accent-rose-600 h-2 rounded-full"
                              />
                            </div>
                          </div>
                          <input
                            type="text"
                            placeholder="URL image button Buka"
                            value={inv.settings.opening_button_bg_image || ''}
                            onChange={(e) => updateSettings('opening_button_bg_image', e.target.value)}
                            className="w-full px-5 py-4 bg-white border border-transparent rounded-2xl focus:border-rose-300 transition text-sm outline-none font-medium"
                          />
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-20 shrink-0 overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
                              {inv.settings.opening_button_bg_image ? (
                                <img src={inv.settings.opening_button_bg_image} alt="Buka button background preview" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full" style={{ backgroundColor: inv.settings.opening_button_bg_color || '#ffffff' }} />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-500">Upload Image Button</p>
                              <UploadGuide
                                ratio="Maksimum 1MB. Disarankan 800x400px atau gambar ringkas."
                                note='Pilihan ini ubah latar belakang butang "Buka" dan akan di-compress ke WebP.'
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => openingButtonBgFileInputRef.current?.click()}
                              disabled={uploadingVisualAsset === 'opening-button'}
                              className="rounded-full bg-rose-600 px-4 py-3 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {uploadingVisualAsset === 'opening-button' ? 'Uploading...' : 'Upload'}
                            </button>
                            <input
                              ref={openingButtonBgFileInputRef}
                              type="file"
                              hidden
                              accept="image/png,image/jpeg,image/webp"
                              onChange={(e) => handleVisualAssetUpload(e, 'opening-button')}
                            />
                          </div>
                        </div>
                      )}
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
              )}

              {['pro', 'elite'].includes(inv.settings.package_plan || 'free') && (
                <section className="space-y-8 pt-10 border-t border-gray-100">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Effect & Hiasan</h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Jenis Effect</label>
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                          <p className="text-[9px] font-medium leading-relaxed text-gray-400">
                            Effect akan ikut warna pilihan ini. Default putih sesuai untuk kebanyakan background.
                          </p>
                        </div>
                        <label className="space-y-2 min-w-[160px]">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Warna Effect</span>
                          <input
                            type="color"
                            value={inv.settings.effect_color || '#ffffff'}
                            onChange={(e) => updateSettings('effect_color', e.target.value)}
                            className="w-full h-12 rounded-xl overflow-hidden border border-gray-100 p-1 cursor-pointer bg-white"
                          />
                        </label>
                      </div>
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
              )}
            </div>
          )}

          {
            activeTab === 'design' && (
              <div className="space-y-10 relative">
                <section className="space-y-8 pt-10 border-t border-gray-100">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Gaya Tajuk Seksyen</h3>

                  <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                    <FontPicker label="Font Tajuk Seksyen" value={inv.settings.section_title_font} onChange={(font) => updateSettings('section_title_font', font)} />
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">
                        <span>Saiz Tajuk</span>
                        <span>{inv.settings.section_title_size || '12'}px</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="32"
                        value={inv.settings.section_title_size || '12'}
                        onChange={(e) => updateSettings('section_title_size', e.target.value)}
                        className="w-full accent-rose-600 h-1"
                      />
                      <p className="text-[8px] text-gray-400 italic px-1">Kesan kepada tajuk Maklumat Tambahan, Atur Cara Majlis, Ucapan & Doa, Hashtag dan Footer Kad.</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-8 pt-10 border-t border-gray-100">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Identiti Visual & Tema</h3>

                  <div className="space-y-6">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block">Primary Theme Color (Button & Navigasi)</label>
                    <div className="flex flex-wrap gap-4 items-center">
                      {THEME_COLORS.map(color => (
                        <button
                          key={color.value}
                          onClick={() => updateSettings('primary_color', color.value)}
                          style={{ backgroundColor: color.value }}
                          className={`w-12 h-12 rounded-full border-4 transition transform hover:scale-125 shadow-xl ${inv.settings.primary_color === color.value ? 'border-white ring-4 ring-rose-500 scale-110' : 'border-transparent opacity-80'}`}
                        />
                      ))}
                      <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
                        <input
                          type="color"
                          value={inv.settings.primary_color}
                          onChange={(e) => updateSettings('primary_color', e.target.value)}
                          className="w-12 h-12 rounded-full border-4 border-transparent p-0 overflow-hidden cursor-pointer hover:scale-110 transition shadow-xl"
                        />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custom</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-gray-50">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block">Secondary Theme Color (Titles & Accent)</label>
                    <div className="flex flex-wrap gap-4 items-center">
                      {THEME_COLORS.map(color => (
                        <button
                          key={color.value}
                          onClick={() => updateSettings('secondary_theme_color', color.value)}
                          style={{ backgroundColor: color.value }}
                          className={`w-12 h-12 rounded-full border-4 transition transform hover:scale-125 shadow-xl ${inv.settings.secondary_theme_color === color.value ? 'border-white ring-4 ring-rose-500 scale-110' : 'border-transparent opacity-80'}`}
                        />
                      ))}
                      <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
                        <input
                          type="color"
                          value={inv.settings.secondary_theme_color || '#9ca3af'}
                          onChange={(e) => updateSettings('secondary_theme_color', e.target.value)}
                          className="w-12 h-12 rounded-full border-4 border-transparent p-0 overflow-hidden cursor-pointer hover:scale-110 transition shadow-xl"
                        />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custom</span>
                      </div>
                    </div>
                  </div>
                </section>

                {renderBackgroundColorSection()}

                {inv.settings.package_plan === 'elite' && renderInvitationBackgroundSection()}

                {inv.settings.package_plan === 'elite' && renderFooterBrandingSection()}

                <section className="space-y-8 pt-10 border-t border-gray-100">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Margin Kandungan</h3>
                  <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                    <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">
                      <span>Ruang Kiri & Kanan</span>
                      <span>{inv.settings.content_margin_x || '32'}px</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="64"
                      value={inv.settings.content_margin_x || '32'}
                      onChange={(e) => updateSettings('content_margin_x', e.target.value)}
                      className="w-full accent-rose-600 h-2 rounded-full"
                    />
                    <div className="flex justify-between text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>Lebar</span>
                      <span>Sempit</span>
                    </div>
                    <p className="text-[8px] text-gray-400 italic px-1">Laraskan ruang kiri dan kanan kandungan dalam live preview.</p>
                  </div>
                </section>
              </div>
            )
          }

          {
            activeTab === 'utama' && (
              <div className="space-y-10">
                {/* Couple Names Section - Public */}
                {/* Couple Names Section - Public */}
                <section className="space-y-8">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Tajuk Utama (Cover)</h3>

                  <div className="space-y-6">
                    {/* 1. Cover Hero Wording */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Wording Utama (Cover Hero)</label>
                        <input
                          type="text"
                          placeholder="Walimatulurus"
                          value={inv.settings.cover_hero_title || ''}
                          onChange={(e) => updateSettings('cover_hero_title', e.target.value)}
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-bold placeholder-gray-400"
                        />
                      </div>

                      <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                        <FontPicker label="Font Hero (Cover)" value={inv.settings.cover_hero_font} onChange={(f) => updateSettings('cover_hero_font', f)} />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">Warna Hero</label>
                            <input type="color" value={inv.settings.cover_hero_color || inv.settings.hero_color || '#1F2937'} onChange={(e) => updateSettings('cover_hero_color', e.target.value)} className="w-8 h-8 rounded-lg overflow-hidden border-none p-0 cursor-pointer" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">
                              <span>Saiz</span>
                              <span>{inv.settings.cover_hero_size || '12'}px</span>
                            </div>
                            <input type="range" min="8" max="40" value={inv.settings.cover_hero_size || '12'} onChange={(e) => updateSettings('cover_hero_size', e.target.value)} className="w-full accent-rose-600 h-1" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 1. Cover Title & Symbol */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tajuk Cover</label>
                          <div className="relative group">
                            <InformationCircleIcon className="w-4 h-4 text-gray-400 cursor-help hover:text-rose-500 transition" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-gray-900/95 text-white text-[10px] rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none backdrop-blur-sm transform scale-95 group-hover:scale-100 origin-bottom">
                              <p className="font-bold mb-1 text-rose-300">Tips:</p>
                              <p className="leading-relaxed opacity-90">Gunakan simbol <span className="font-bold text-white bg-white/20 px-1 rounded">&</span> untuk memisahkan baris.</p>
                              <p className="mt-3 mb-1 font-bold text-rose-300">Contoh:</p>
                              <ul className="space-y-1 opacity-80">
                                <li>Adam Sekeluarga</li>
                                <li>Adam & Hawa</li>
                                <li>Adam | Hawa & Firas | Sarah</li>
                                <li>Adam x Hawa & Firas x Sarah</li>
                                <li>Adam + Hawa & Firas + Sarah</li>
                              </ul>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/95"></div>
                            </div>
                          </div>
                        </div>
                        <input
                          type="text"
                          placeholder="Contoh: Adam & Hawa"
                          value={inv.settings.cover_title || ''}
                          onChange={(e) => updateSettings('cover_title', e.target.value)}
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-bold placeholder-gray-300"
                        />
                      </div>

                      <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gaya Tajuk Cover</span>
                        </div>

                        <div className="space-y-4 p-4 bg-white rounded-2xl border border-gray-50 shadow-sm">
                          <FontPicker label="Font Tajuk" value={inv.settings.cover_title_font} onChange={(f) => updateSettings('cover_title_font', f)} />
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">Warna Tajuk</label>
                              <div className="flex items-center gap-2">
                                <input type="color" value={inv.settings.cover_title_color || inv.settings.primary_color || '#8B4513'} onChange={(e) => updateSettings('cover_title_color', e.target.value)} className="w-8 h-8 rounded-lg overflow-hidden border-none p-0 cursor-pointer" />
                                <span className="text-[10px] font-mono text-gray-500 uppercase">{inv.settings.cover_title_color || 'Auto'}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">
                                <span>Saiz</span>
                                <span>{inv.settings.cover_title_size || '48'}px</span>
                              </div>
                              <input type="range" min="20" max="100" value={inv.settings.cover_title_size || '48'} onChange={(e) => updateSettings('cover_title_size', e.target.value)} className="w-full accent-rose-600 h-1" />
                            </div>
                          </div>

                          <p className="text-[8px] text-gray-400 leading-relaxed pt-4 border-t border-gray-100 px-1">
                            Simbol seperti &, +, / atau | dalam Tajuk Cover akan ikut font, warna dan saiz tajuk ini.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 2. Cover Date */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tarikh Majlis (Cover)</label>
                        <input
                          type="date"
                          value={inv.event_date || inv.settings.cover_date || ''}
                          onChange={(e) => updateCoverDate(e.target.value)}
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-bold"
                        />
                        <p className="text-[8px] text-gray-400 italic ml-1">Tarikh ini juga digunakan di Step 3 Masa, Tarikh & Tempat.</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                        <FontPicker label="Font Tarikh (Cover)" value={inv.settings.cover_date_font} onChange={(f) => updateSettings('cover_date_font', f)} />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">Warna Tarikh</label>
                            <input type="color" value={inv.settings.cover_date_color || inv.settings.date_color || '#4B5563'} onChange={(e) => updateSettings('cover_date_color', e.target.value)} className="w-8 h-8 rounded-lg overflow-hidden border-none p-0 cursor-pointer" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">
                              <span>Saiz</span>
                              <span>{inv.settings.cover_date_size || '16'}px</span>
                            </div>
                            <input type="range" min="10" max="40" value={inv.settings.cover_date_size || '16'} onChange={(e) => updateSettings('cover_date_size', e.target.value)} className="w-full accent-rose-600 h-1" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Cover Location */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lokasi (Cover)</label>
                        <input
                          type="text"
                          placeholder="Contoh: Dewan Seri Kasih"
                          value={inv.location_name || inv.settings.cover_location || ''}
                          onChange={(e) => updateCoverLocation(e.target.value)}
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-rose-300 focus:bg-white transition text-sm outline-none font-bold placeholder-gray-400"
                        />
                        <p className="text-[8px] text-gray-400 italic ml-1">Lokasi ini juga digunakan di Step 3 Lokasi & Peta.</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                        <FontPicker label="Font Lokasi (Cover)" value={inv.settings.cover_location_font} onChange={(f) => updateSettings('cover_location_font', f)} />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">Warna Lokasi</label>
                            <input type="color" value={inv.settings.cover_location_color || inv.settings.location_color || '#9CA3AF'} onChange={(e) => updateSettings('cover_location_color', e.target.value)} className="w-8 h-8 rounded-lg overflow-hidden border-none p-0 cursor-pointer" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">
                              <span>Saiz</span>
                              <span>{inv.settings.cover_location_size || '14'}px</span>
                            </div>
                            <input type="range" min="10" max="40" value={inv.settings.cover_location_size || '14'} onChange={(e) => updateSettings('cover_location_size', e.target.value)} className="w-full accent-rose-600 h-1" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {renderHashtagPanel('Hashtag Cover')}

                    {/* 4. Cover Layout Arrangement */}
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Susun Atur</h4>
                        <p className="text-[8px] text-gray-400 italic ml-1 mt-1">Kawal susunan, posisi dan alignment kandungan cover.</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 space-y-5">
                        <div className="space-y-2">
                          <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">Layout</label>
                          <select
                            value={inv.settings.layout_settings?.cover_content_order || 'layout-1'}
                            onChange={(e) => updateLayoutSettings('cover_content_order', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-transparent rounded-xl focus:border-rose-300 transition text-xs outline-none font-bold"
                          >
                            <option value="layout-1">Layout 1 - Wording utama di atas</option>
                            <option value="layout-2">Layout 2 - Tajuk cover di atas</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">Posisi Teks</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'left', label: 'Kiri', icon: 'M4 7h10M4 12h16M4 17h8' },
                                { id: 'center', label: 'Tengah', icon: 'M7 7h10M4 12h16M8 17h8' },
                                { id: 'right', label: 'Kanan', icon: 'M10 7h10M4 12h16M12 17h8' }
                              ].map(option => {
                                const isSelected = (inv.settings.layout_settings?.cover_text_align || 'center') === option.id;
                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => updateLayoutSettings('cover_text_align', option.id)}
                                    className={`h-16 rounded-2xl border flex flex-col items-center justify-center gap-1 transition ${isSelected ? 'bg-white border-rose-400 text-rose-600 shadow-md' : 'bg-white/70 border-gray-100 text-gray-400 hover:border-rose-200'}`}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d={option.icon} />
                                    </svg>
                                    <span className="text-[8px] font-black uppercase tracking-widest">{option.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">Alignment Cover</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'top', label: 'Atas', y: '5' },
                                { id: 'middle', label: 'Tengah', y: '10' },
                                { id: 'bottom', label: 'Bawah', y: '15' }
                              ].map(option => {
                                const isSelected = (inv.settings.layout_settings?.cover_vertical_align || 'middle') === option.id;
                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => updateLayoutSettings('cover_vertical_align', option.id)}
                                    className={`h-16 rounded-2xl border flex flex-col items-center justify-center gap-1 transition ${isSelected ? 'bg-white border-rose-400 text-rose-600 shadow-md' : 'bg-white/70 border-gray-100 text-gray-400 hover:border-rose-200'}`}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <rect x="6" y="4" width="12" height="16" rx="2" strokeWidth="1.8" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d={`M9 ${option.y}h6`} />
                                    </svg>
                                    <span className="text-[8px] font-black uppercase tracking-widest">{option.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </section>
              </div>
            )
          }

          {
            activeTab === 'butiran' && (
              <div className="space-y-10 relative">

                {/* Group 1: Butiran Asas */}
                <section className="space-y-8">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Butiran Asas</h3>
                  <div className="space-y-6">
                    {/* 1. Kata Aluan */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">1. Kata Aluan</label>
                        <div className="flex gap-4">
                          {renderVisibilityToggle('show_greeting')}
                          <input type="color" value={inv.settings.greeting_color || '#111827'} onChange={(e) => updateSettings('greeting_color', e.target.value)} className="w-4 h-4 rounded-full border-none p-0 cursor-pointer" />
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-gray-400">Size</span>
                            <input type="range" min="10" max="60" value={inv.settings.greeting_size || '36'} onChange={(e) => updateSettings('greeting_size', e.target.value)} className="w-16 accent-rose-600" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <textarea rows={3} placeholder="Contoh: Assalammualaikum W.B.T" value={inv.settings.greeting_text || ''} onChange={(e) => updateSettings('greeting_text', e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-300 transition text-sm outline-none leading-relaxed" />
                        <FontPicker label="Font Greeting" value={inv.settings.greeting_font} onChange={(font) => updateSettings('greeting_font', font)} />
                      </div>
                    </div>

                    {/* 2. Wording Utama */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">2. Wording Utama</label>
                        <div className="flex gap-4">
                          {renderVisibilityToggle('show_hero_title')}
                          <input type="color" value={inv.settings.hero_color || '#111827'} onChange={(e) => updateSettings('hero_color', e.target.value)} className="w-4 h-4 rounded-full border-none p-0 cursor-pointer" />
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

                    {/* 3. Nama Tuan Rumah */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">3. Nama Tuan Rumah</label>
                        <div className="flex gap-4">
                          {renderVisibilityToggle('show_host_names')}
                          <input type="color" value={inv.settings.host_color || '#4B5563'} onChange={(e) => updateSettings('host_color', e.target.value)} className="w-4 h-4 rounded-full border-none p-0 cursor-pointer" />
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-gray-400">Size</span>
                            <input type="range" min="10" max="40" value={inv.settings.host_size || '16'} onChange={(e) => updateSettings('host_size', e.target.value)} className="w-16 accent-rose-600" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                        <input type="text" value={inv.host_names} onChange={(e) => updateField('host_names', e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-300 transition text-sm outline-none font-bold" />
                        <FontPicker label="Font Tuan Rumah" value={inv.settings.host_font} onChange={(font) => updateSettings('host_font', font)} />
                      </div>
                    </div>

                    {/* 4. Teks Jemputan */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">4. Teks Jemputan</label>
                        <div className="flex gap-4">
                          {renderVisibilityToggle('show_invitation_text')}
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

                {/* Group 2: Masa, Tarikh & Tempat */}
                <section className="space-y-8 pt-10 border-t border-gray-100">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Masa, Tarikh & Tempat</h3>
                  <div className="space-y-6">
                    {/* 5. Masa dan Tarikh Majlis */}
                    <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">5. Masa dan Tarikh Majlis</label>
                        <div className="flex gap-4">
                          {renderVisibilityToggle('show_event_date')}
                          <input type="color" value={inv.settings.date_color || '#1F2937'} onChange={(e) => updateSettings('date_color', e.target.value)} className="w-4 h-4 rounded-full border-none p-0 cursor-pointer" />
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-bold text-gray-400">Size</span>
                            <input type="range" min="10" max="40" value={inv.settings.date_size || '16'} onChange={(e) => updateSettings('date_size', e.target.value)} className="w-16 accent-rose-600" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                        <input
                          type="date"
                          value={inv.event_date}
                          onChange={(e) => updateCoverDate(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-300 transition text-sm font-bold outline-none"
                        />
                        <input
                          type="time"
                          value={inv.start_time}
                          onChange={(e) => updateField('start_time', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-300 transition text-sm font-bold outline-none"
                        />
                        <input
                          type="time"
                          value={inv.end_time}
                          onChange={(e) => updateField('end_time', e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-300 transition text-sm font-bold outline-none"
                        />
                      </div>
                      <FontPicker label="Font Tarikh" value={inv.settings.date_font} onChange={(font) => updateSettings('date_font', font)} />
                    </div>

                    {/* 6. Papar Undur Masa (Countdown) */}
                    <div className="flex items-center justify-between p-6 bg-rose-50 rounded-[2.5rem] border border-rose-100 shadow-inner group transition-all hover:shadow-md">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-rose-800 tracking-tight italic">6. Papar Undur Masa (Countdown)</span>
                        <span className="text-[9px] text-rose-300 uppercase font-bold tracking-widest">Show Countdown timer</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={inv.settings.show_countdown}
                        onChange={(e) => updateSettings('show_countdown', e.target.checked)}
                        className="w-6 h-6 accent-rose-600 cursor-pointer transition-transform hover:scale-110"
                      />
                    </div>

                    {/* 7. Lokasi & Peta */}
                    <div className="space-y-6 pt-6 border-t border-gray-100/50">
                      <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">7. Lokasi & Peta</label>
                          <div className="flex gap-4">
                            {renderVisibilityToggle('show_event_location')}
                            <input type="color" value={inv.settings.location_color || '#1F2937'} onChange={(e) => updateSettings('location_color', e.target.value)} className="w-4 h-4 rounded-full border-none p-0 cursor-pointer" />
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] font-bold text-gray-400">Size</span>
                              <input type="range" min="10" max="40" value={inv.settings.location_size || '14'} onChange={(e) => updateSettings('location_size', e.target.value)} className="w-16 accent-rose-600" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <input type="text" value={inv.location_name} onChange={(e) => updateCoverLocation(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-300 transition text-sm font-bold outline-none" />
                          <FontPicker label="Font Lokasi" value={inv.settings.location_font} onChange={(font) => updateSettings('location_font', font)} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Alamat Penuh</label>
                        <textarea rows={2} value={inv.address} onChange={(e) => updateField('address', e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none shadow-inner" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">Google Maps Embed</label>
                          <input type="text" value={inv.google_maps_url} placeholder="Embed URL..." onChange={(e) => updateField('google_maps_url', e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-[10px] font-mono outline-none focus:ring-1 focus:ring-rose-200" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">Waze URL</label>
                          <input type="text" value={inv.waze_url} placeholder="Waze URL..." onChange={(e) => updateField('waze_url', e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-[10px] font-mono outline-none focus:ring-1 focus:ring-rose-200" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">Koordinat / GPS</label>
                        <input
                          type="text"
                          value={inv.settings.location_gps || ''}
                          placeholder="Contoh: 3.1390, 101.6869"
                          onChange={(e) => updateSettings('location_gps', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-50 rounded-xl text-[10px] font-mono outline-none focus:ring-1 focus:ring-rose-200"
                        />
                        <p className="text-[8px] text-gray-400 italic ml-1">Digunakan sebagai fallback untuk peta dan pautan lokasi jika URL khusus tidak disediakan.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Group 3: Butiran lain - lain */}
                <section className="space-y-8 pt-10 border-t border-gray-100">
                  <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Butiran lain - lain</h3>
                  <div className="space-y-6">
                    {/* 8. Maklumat Tambahan */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">8. Maklumat Tambahan</label>
                        {renderVisibilityToggle('show_story')}
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tajuk Maklumat</label>
                          <input type="text" placeholder="Contoh: Maklumat Tambahan" value={inv.settings.story_title || ''} onChange={(e) => updateSettings('story_title', e.target.value)} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-xl focus:border-rose-300 transition text-sm outline-none font-bold" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kandungan Maklumat</label>
                          <textarea rows={4} value={inv.settings.our_story} onChange={(e) => updateSettings('our_story', e.target.value)} className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl focus:border-rose-300 transition text-sm outline-none font-medium italic leading-relaxed" />
                        </div>
                      </div>
                    </div>

                    {/* 9. Atur Cara Majlis */}
                    <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">9. Atur Cara Majlis</label>
                        <div className="flex items-center gap-3">
                          {renderVisibilityToggle('show_itinerary')}
                          <button
                            onClick={() => {
                              const newItem = { id: Date.now().toString(), time: '12:00 PM', activity: 'New Activity' };
                              updateField('itinerary', [...(inv.itinerary || []), newItem]);
                            }}
                            className="text-[10px] bg-white border border-gray-200 px-4 py-2 rounded-full font-bold uppercase tracking-widest hover:bg-gray-50 transition"
                          >
                            + Add Item
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {(inv.itinerary || []).map((item, index) => (
                          <div key={item.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-4 group relative">
                            <button
                              onClick={() => {
                                const newList = (inv.itinerary || []).filter(i => i.id !== item.id);
                                updateField('itinerary', newList);
                              }}
                              className="absolute top-2 right-2 text-gray-300 hover:text-rose-500 transition text-xl"
                            >
                              &times;
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest ml-1">Waktu</label>
                                <input
                                  type="text"
                                  value={item.time}
                                  onChange={(e) => {
                                    const newList = [...(inv.itinerary || [])];
                                    newList[index].time = e.target.value;
                                    updateField('itinerary', newList);
                                  }}
                                  className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold outline-none"
                                  placeholder="12:00 PM"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest ml-1">Aktiviti</label>
                                <input
                                  type="text"
                                  value={item.activity}
                                  onChange={(e) => {
                                    const newList = [...(inv.itinerary || [])];
                                    newList[index].activity = e.target.value;
                                    updateField('itinerary', newList);
                                  }}
                                  className="w-full px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold outline-none"
                                  placeholder="Acara"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </section>

              </div>
            )
          }

          {
            activeTab === 'media' && (
              <div className="space-y-12">


                <section className="space-y-8 pt-10 border-t border-gray-100">
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

                {canAccess('gallery') && (
                  <section className="space-y-8 pt-10 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Gallery Images</h3>
                        <UploadGuide
                          ratio="Maksimum 2MB setiap gambar. Disarankan 1200x1200px atau kurang."
                          note="Sistem akan resize dan compress ke WebP untuk galeri."
                        />
                      </div>
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
                      {(inv.gallery || []).map((img, idx) => {
                        const imgSrc = typeof img === 'string' ? img : (img as any).image_url;
                        if (!imgSrc) return null;

                        return (
                          <div key={idx} className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative border border-gray-100 group">
                            <img src={imgSrc} className="w-full h-full object-cover" />
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
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            )
          }

          {
            activeTab === 'tetamu' && (
              <div className="space-y-10 relative">
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
            )
          }

          {
            activeTab === 'hadiah' && (
              <div className="space-y-10 relative">
                <section className="space-y-8">
                  <div className="flex items-center justify-between p-8 bg-rose-50 rounded-[3rem] border border-rose-100 shadow-inner">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-rose-800 tracking-tight italic">Money Gift (DuitNow)</span>
                      <span className="text-[10px] text-rose-300 uppercase font-bold tracking-widest">Enable QR Code</span>
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
                        <UploadGuide
                          ratio="Maksimum 1MB. Disarankan 800x800px, jelas dan tidak kabur."
                          note="QR boleh JPG, PNG, WebP atau SVG. Pastikan kod boleh diimbas selepas upload."
                        />
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
            )
          }

          {
            activeTab === 'wishlist' && (
              <div className="space-y-10 relative">
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
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-rose-300 uppercase tracking-[0.4em] border-l-2 border-rose-200 pl-4 font-serif">Permintaan Hadiah</h4>
                            <UploadGuide
                              ratio="Maksimum 1MB setiap gambar item. Disarankan square 800x800px."
                              note="Sistem akan resize dan compress ke WebP untuk imej hadiah."
                            />
                          </div>
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
            )
          }

          {
            activeTab === 'rsvp' && canAccess('rsvp') && (
              <div className="space-y-10 relative">
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

      {/* Preview Panel - Hidden on Mobile */}
      <div className="hidden md:flex flex-1 bg-gray-100 items-center justify-center p-3 md:p-4 lg:p-6 relative overflow-y-auto">

        <div className="mx-auto w-full max-w-[375px] aspect-[9/19.5] bg-white shadow-2xl rounded-[3rem] overflow-hidden border-8 border-gray-900 relative transform translate-z-0 flex-shrink-0 my-3 scale-[0.84] lg:scale-[0.88] xl:scale-[0.92] 2xl:scale-100 origin-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-[110]"></div>
          <div className="absolute inset-0 overflow-y-auto no-scrollbar bg-white">
            <InvitationContent invitation={inv} isPreview={true} previewFocus={activeTab as any} />
          </div>
        </div>
      </div>

      {/* Mobile Preview FAB */}
      {/* Mobile Live Preview Thumbnail */}
      <div className="md:hidden fixed bottom-6 right-6 z-50 animate-bounce-slow">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowMobilePreview(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowMobilePreview(true);
            }
          }}
          className="relative w-[80px] h-[140px] bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-900 group hover:scale-105 transition-transform transform translate-z-0"
        >
          {/* Scaled Content */}
          <div className="absolute top-0 left-0 w-[375px] h-[667px] origin-top-left transform scale-[0.195] pointer-events-none bg-gray-50">
            <InvitationContent invitation={inv} isPreview={true} previewFocus={activeTab as any} />
          </div>

          {/* Overlay for Touch */}
          <div className="absolute inset-0 bg-transparent z-10"></div>

          {/* Label Badge */}
          <div className="absolute bottom-0 inset-x-0 bg-gray-900/90 py-1.5 flex flex-col items-center justify-center backdrop-blur-sm z-20">
            <span className="text-[8px] font-bold text-white uppercase tracking-wider leading-none">Live</span>
            <span className="text-[6px] font-medium text-gray-300 uppercase tracking-widest leading-none mt-0.5">Preview</span>
          </div>

          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1.5 bg-gray-900 rounded-b-md z-20"></div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {
        showMobilePreview && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col animate-scale-in no-scrollbar overflow-hidden backdrop-blur-sm">
            {/* Floating Close Button */}
            <button
              onClick={() => setShowMobilePreview(false)}
              className="fixed top-6 right-6 z-[110] p-3 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all border border-white/20 shadow-xl"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              <div className="mx-auto w-full max-w-[375px] h-full max-h-[92vh] bg-white shadow-2xl rounded-[3rem] overflow-hidden border-8 border-gray-900 relative transform translate-z-0 flex flex-col">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20"></div>
                <div className="w-full h-full overflow-y-auto no-scrollbar relative bg-gray-900">
                  <InvitationContent invitation={inv} isPreview={true} previewFocus={activeTab as any} />
                </div>
              </div>
            </div>

          </div>
        )
      }

      {showEditorOnboarding && activeEditorOnboardingStep && (
        <>
          <div className="fixed inset-0 z-[120] bg-gray-950/55 backdrop-blur-[2px]" />
          <div className="fixed inset-x-4 bottom-4 z-[130] mx-auto max-w-xl rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_30px_100px_rgba(15,23,42,0.45)] md:bottom-8">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-[9px] font-black uppercase tracking-[0.28em] text-rose-500">
                  Step {editorOnboardingIndex + 1}/{editorSteps.length}
                </p>
                <h3 className="text-2xl font-serif italic font-black text-gray-950">
                  {activeEditorOnboardingStep.label}
                </h3>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {activeEditorOnboardingStep.description}
                </p>
              </div>
              <button
                type="button"
                onClick={completeEditorOnboarding}
                className="rounded-full bg-gray-50 p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Skip editor onboarding"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm leading-6 text-gray-600">
              {editorOnboardingDescriptions[activeEditorOnboardingStep.id] || 'Gunakan bahagian ini untuk lengkapkan kad jemputan anda.'}
            </p>

            {isDemo && editorOnboardingIndex === 0 && (
              <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-700">
                Demo boleh cuba semua setting. Untuk simpan, publish dan dapat link live, tekan Save & Unlock.
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex gap-1.5">
                {editorSteps.map((step, index) => (
                  <span
                    key={step.id}
                    className={`h-1.5 rounded-full transition-all ${index === editorOnboardingIndex ? 'w-7 bg-rose-600' : 'w-2 bg-gray-200'}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {editorOnboardingIndex > 0 && (
                  <button
                    type="button"
                    onClick={goToPreviousEditorOnboardingStep}
                    className="rounded-full border border-gray-200 bg-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 transition hover:border-gray-300 hover:text-gray-800"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={goToNextEditorOnboardingStep}
                  className="rounded-full bg-gray-950 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl transition hover:bg-black active:scale-95"
                >
                  {editorOnboardingIndex >= editorSteps.length - 1 ? 'Selesai' : 'Seterusnya'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EditorPage;
