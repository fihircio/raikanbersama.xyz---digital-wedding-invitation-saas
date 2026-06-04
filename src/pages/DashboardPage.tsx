import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_INVITATIONS } from '../../constants';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { buildApiUrl } from '../config';
import { Invitation } from '../../types';

type OnboardingTarget = 'create' | 'edit' | 'manage' | 'share';

interface OnboardingStep {
  target: OnboardingTarget;
  eyebrow: string;
  title: string;
  description: string;
}

const FULL_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    target: 'create',
    eyebrow: 'Step 1',
    title: 'Bina kad jemputan baru',
    description: 'Mula dari Catalog untuk pilih design, pakej, dan asas kad kahwin digital anda.'
  },
  {
    target: 'edit',
    eyebrow: 'Step 2',
    title: 'Ubah reka dan wording',
    description: 'Gunakan Ubah Reka untuk edit nama pengantin, warna, font, gambar, butiran majlis dan live preview.'
  },
  {
    target: 'manage',
    eyebrow: 'Step 3',
    title: 'Urus tetamu dan RSVP',
    description: 'Bahagian ini bantu anda semak kehadiran, ucapan, tetamu, dan maklumat berkaitan majlis.'
  },
  {
    target: 'share',
    eyebrow: 'Step 4',
    title: 'Buka dan kongsi link utama',
    description: 'Semak kad sebenar yang tetamu akan lihat, kemudian kongsi link jemputan apabila semuanya sudah lengkap.'
  }
];

const EMPTY_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    target: 'create',
    eyebrow: 'Step 1',
    title: 'Bina kad pertama anda',
    description: 'Dashboard masih kosong. Mula dengan Bina Baru untuk pilih template dan cipta kad jemputan digital pertama.'
  }
];

// Import the existing Dashboard component from App.tsx
// We'll create a wrapper that uses the existing Dashboard component logic
const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>(MOCK_INVITATIONS);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStepIndex, setOnboardingStepIndex] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState<React.CSSProperties>({});
  const createTargetRef = useRef<HTMLAnchorElement>(null);
  const editTargetRef = useRef<HTMLAnchorElement>(null);
  const manageTargetRef = useRef<HTMLAnchorElement>(null);
  const shareTargetRef = useRef<HTMLAnchorElement>(null);

  const hasInvitations = invitations.length > 0;
  const onboardingSteps = hasInvitations ? FULL_ONBOARDING_STEPS : EMPTY_ONBOARDING_STEPS;
  const activeOnboardingStep = onboardingSteps[onboardingStepIndex] || onboardingSteps[0];
  const onboardingStorageKey = user?.id ? `rb_onboarding_v1_seen_${user.id}` : null;

  const getTargetRef = (target: OnboardingTarget) => {
    switch (target) {
      case 'create':
        return createTargetRef;
      case 'edit':
        return editTargetRef;
      case 'manage':
        return manageTargetRef;
      case 'share':
        return shareTargetRef;
      default:
        return createTargetRef;
    }
  };

  const getHighlightClassName = (target: OnboardingTarget) => {
    if (!showOnboarding || activeOnboardingStep?.target !== target) return '';
    return 'relative z-[60] ring-4 ring-white ring-offset-4 ring-offset-rose-500/80 shadow-2xl';
  };

  const handleDashboardActionClick = (target: OnboardingTarget) => {
    if (!showOnboarding || activeOnboardingStep?.target !== target) return;
    completeOnboarding();
  };

  const completeOnboarding = () => {
    if (onboardingStorageKey) {
      localStorage.setItem(onboardingStorageKey, JSON.stringify({ completedAt: new Date().toISOString() }));
    }
    setShowOnboarding(false);
    setOnboardingStepIndex(0);
  };

  const goToNextOnboardingStep = () => {
    if (onboardingStepIndex >= onboardingSteps.length - 1) {
      completeOnboarding();
      return;
    }
    setOnboardingStepIndex((current) => current + 1);
  };

  const goToPreviousOnboardingStep = () => {
    setOnboardingStepIndex((current) => Math.max(0, current - 1));
  };

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!token) return;

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

        const response = await fetch(buildApiUrl('/invitations'), {
          method: 'GET',
          headers,
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Dashboard: API Response received', data);
          console.log('📦 Dashboard: Invitations data', data.data);
          console.log('📊 Dashboard: Number of invitations', data.data?.length || 0);
          setInvitations(data.data);
        } else {
          console.error('❌ Dashboard: Failed to fetch invitations:', response.statusText);
          // Keep using mock data if API fails
        }
      } catch (error) {
        console.error('❌ Dashboard: Error fetching invitations:', error);
        // Keep using mock data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [token]);

  useEffect(() => {
    if (loading || !user || !onboardingStorageKey) return;

    const hasSeenOnboarding = localStorage.getItem(onboardingStorageKey);
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
      setOnboardingStepIndex(0);
    }
  }, [loading, onboardingStorageKey, user]);

  useEffect(() => {
    if (!showOnboarding || !activeOnboardingStep) return;

    const targetRef = getTargetRef(activeOnboardingStep.target);
    const targetElement = targetRef.current;

    const updateTooltipPosition = () => {
      if (!targetElement) {
        setTooltipPosition({
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        });
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      const tooltipWidth = Math.min(360, window.innerWidth - 32);
      const preferredTop = rect.bottom + 18;
      const fallbackTop = rect.top - 250;
      const hasRoomBelow = window.innerHeight - rect.bottom > 260;
      const top = hasRoomBelow ? preferredTop : Math.max(16, fallbackTop);
      const left = Math.min(
        Math.max(16, rect.left + rect.width / 2 - tooltipWidth / 2),
        window.innerWidth - tooltipWidth - 16
      );

      setTooltipPosition({
        width: tooltipWidth,
        left,
        top
      });
    };

    targetElement?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    const animationFrameId = window.requestAnimationFrame(updateTooltipPosition);
    const timeoutId = window.setTimeout(updateTooltipPosition, 350);

    window.addEventListener('resize', updateTooltipPosition);
    window.addEventListener('scroll', updateTooltipPosition, true);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.clearTimeout(timeoutId);
      window.removeEventListener('resize', updateTooltipPosition);
      window.removeEventListener('scroll', updateTooltipPosition, true);
    };
  }, [activeOnboardingStep, showOnboarding]);

  if (loading) {
    return (
      <div className="pt-24 pb-12 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-2xl font-bold text-gray-900 font-serif italic tracking-tight">Selamat datang, {user?.name}!</p>
            <p className="text-gray-500 text-sm">Uruskan semua jemputan digital anda di sini.</p>
          </div>
          <Link ref={createTargetRef} to="/catalog" onClick={() => handleDashboardActionClick('create')} className={`bg-rose-600 text-white px-8 py-3.5 rounded-full font-bold flex items-center space-x-2 hover:bg-rose-700 shadow-2xl shadow-rose-200 transition transform active:scale-95 uppercase text-[10px] tracking-widest ${getHighlightClassName('create')}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Bina Baru</span>
          </Link>
        </div>

        {hasInvitations ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {invitations.map((inv, index) => {
              const isPublished = inv.settings?.is_published === true;

              return (
            <div key={inv.id} className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-700">
              <div className="h-64 bg-gray-200 relative overflow-hidden">
                <img src={inv.settings.background_image} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" />
                <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                  <span className={`bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm ${isPublished ? 'text-emerald-700' : 'text-gray-500'}`}>
                    {isPublished ? 'Live' : 'Draft'}
                  </span>
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
                    <Link ref={index === 0 ? manageTargetRef : undefined} to={`/manage/${inv.id}`} onClick={() => handleDashboardActionClick('manage')} className={`flex-1 text-center py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 shadow-lg shadow-rose-100 transition ${index === 0 ? getHighlightClassName('manage') : ''}`}>Urus Tetamu</Link>
                    <Link ref={index === 0 ? editTargetRef : undefined} to={`/edit/${inv.id}`} onClick={() => handleDashboardActionClick('edit')} className={`flex-1 text-center py-4 bg-gray-50 text-gray-700 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition ${index === 0 ? getHighlightClassName('edit') : ''}`}>Ubah Reka</Link>
                  </div>
                  {isPublished ? (
                    <Link ref={index === 0 ? shareTargetRef : undefined} to={`/i/${inv.slug || inv.id}`} onClick={() => handleDashboardActionClick('share')} className={`w-full text-center py-3 border border-gray-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:text-rose-600 hover:border-rose-100 transition duration-300 ${index === 0 ? getHighlightClassName('share') : ''}`}>Buka Link Utama</Link>
                  ) : (
                    <button
                      ref={index === 0 ? shareTargetRef : undefined}
                      type="button"
                      disabled
                      className="w-full text-center py-3 border border-gray-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-300 cursor-not-allowed"
                    >
                      Buka Link Utama
                    </button>
                  )}
                </div>
              </div>
            </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-rose-200 bg-white rounded-[3rem] px-8 py-16 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <SparklesIcon className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-serif italic font-bold text-gray-900">Belum ada kad jemputan</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">Klik Bina Baru untuk pilih design dan mula bina kad digital pertama anda.</p>
          </div>
        )}
      </div>

      {showOnboarding && activeOnboardingStep && (
        <>
          <div className="fixed inset-0 z-40 bg-gray-950/65 backdrop-blur-[2px]" />
          <div
            className="fixed z-[70] rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_30px_90px_rgba(15,23,42,0.35)] transition-all duration-300"
            style={tooltipPosition}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dashboard-onboarding-title"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-rose-600">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  {activeOnboardingStep.eyebrow}
                </div>
                <h2 id="dashboard-onboarding-title" className="text-xl font-serif italic font-bold tracking-tight text-gray-950">
                  {activeOnboardingStep.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={completeOnboarding}
                className="rounded-full bg-gray-50 p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Skip onboarding"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm leading-6 text-gray-600">{activeOnboardingStep.description}</p>

            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex gap-1.5">
                {onboardingSteps.map((step, index) => (
                  <span
                    key={step.target}
                    className={`h-1.5 rounded-full transition-all ${index === onboardingStepIndex ? 'w-7 bg-rose-600' : 'w-2 bg-gray-200'}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {onboardingStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={goToPreviousOnboardingStep}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:text-gray-800"
                    aria-label="Previous onboarding step"
                  >
                    <ArrowLeftIcon className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={goToNextOnboardingStep}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-950 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-white shadow-xl transition hover:bg-black active:scale-95"
                >
                  <span>{onboardingStepIndex >= onboardingSteps.length - 1 ? 'Selesai' : 'Seterusnya'}</span>
                  {onboardingStepIndex >= onboardingSteps.length - 1 ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <ArrowRightIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
