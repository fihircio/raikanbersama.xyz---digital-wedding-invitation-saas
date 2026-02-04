import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Invitation, RSVP } from '../../types';
import { MOCK_RSVPS } from '../../constants';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl } from '../config';

const ManageInvitationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('guests');
  const [magicGuest, setMagicGuest] = useState('');
  const [magicLink, setMagicLink] = useState('');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'A' | 'B'>('A');
  const [shareText, setShareText] = useState('');
  const [shareToGuest, setShareToGuest] = useState(''); // New state for 'to=' parameter

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!id || !token) return;

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
          method: 'GET',
          headers,
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Manage: API Response received', data);
          setInvitation({
            ...data.data,
            wishes: data.data.guestWishes || data.data.wishes || []
          });
        } else {
          console.error('❌ Manage: Failed to fetch invitation:', response.statusText);
        }
      } catch (error) {
        console.error('❌ Manage: Error fetching invitation:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRsvps = async () => {
      if (!id || !token) return;

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

        const response = await fetch(buildApiUrl(`/rsvps/invitation/${id}`), {
          method: 'GET',
          headers,
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Manage: RSVPs API Response received', data);
          setRsvps(data.data);
        } else {
          console.error('❌ Manage: Failed to fetch RSVPs:', response.statusText);
          // Fallback to mock data if API fails
          setRsvps(MOCK_RSVPS.filter(r => r.invitation_id === id));
        }
      } catch (error) {
        console.error('❌ Manage: Error fetching RSVPs:', error);
        // Fallback to mock data if API fails
        setRsvps(MOCK_RSVPS.filter(r => r.invitation_id === id));
      }
    };

    fetchInvitation();
    fetchRsvps();
  }, [id, token]);

  const fetchWishes = async () => {
    if (!id || !token) return;

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

      const response = await fetch(buildApiUrl(`/guest-wishes/invitation/${id}`), {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Manage: Wishes API Response received', data);
        // Update the invitation with the fetched wishes
        // The backend might return data.data as the array of wishes directly, or wrapped
        const wishesData = Array.isArray(data.data) ? data.data : (data.data.guestWishes || []);
        setInvitation(prev => prev ? { ...prev, wishes: wishesData } : null);
      } else {
        console.error('❌ Manage: Failed to fetch wishes:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Manage: Error fetching wishes:', error);
    }
  };

  // Fetch wishes when the tab changes to 'wishes'
  useEffect(() => {
    if (activeTab === 'wishes' && invitation) {
      fetchWishes();
    }
  }, [activeTab, id, token, invitation]);

  const currentTier = invitation?.settings?.package_plan || 'free';

  const canAccess = (feature: string) => {
    switch (feature) {
      case 'rsvp':
      case 'wishes':
        return ['pro', 'elite'].includes(currentTier);
      case 'magic_link':
        return currentTier === 'elite';
      default:
        return true;
    }
  };

  const stats = useMemo(() => {
    const totalPax = (rsvps || []).reduce((acc, curr) => acc + (curr.is_attending ? curr.pax : 0), 0);
    const attendingCount = (rsvps || []).filter(r => r.is_attending).length;
    const notAttendingCount = (rsvps || []).filter(r => !r.is_attending).length;
    return { totalPax, attendingCount, notAttendingCount };
  }, [rsvps]);

  const invitationLink = invitation ? `${window.location.origin}/i/${invitation.slug}` : '';
  const weddingDate = invitation?.event_date ? new Date(invitation.event_date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }) : 'TBA';

  useEffect(() => {
    if (isShareModalOpen && invitation) {
      const linkWithGuest = shareToGuest ? `${invitationLink}?to=${encodeURIComponent(shareToGuest)}` : invitationLink;

      const dynamicTemplates = {
        A: `Bismillahirrahmanirrahim..

Dengan penuh kesyukuran, kami mempersilakan Dato' | Datin | Tuan | Puan | Encik | Cik seisi keluarga hadir ke majlis perkahwinan anakanda kami ${invitation.groom_name} & ${invitation.bride_name}

🔗 ${linkWithGuest}

🗓️ ${weddingDate}

Untuk maklumat lanjut mengenai majlis dan lokasi, sila klik pada pautan kad digital di atas.

Kehadiran pihak para hadirin sekalian amat kami alu-alukan. Terima kasih.`,
        B: `Assalamualaikum & Salam Sejahtera,

Kami dengan sukacitanya menjemput anda ke majlis perkahwinan:
✨ ${invitation.groom_name} & ${invitation.bride_name} ✨

Buka Kad Sini:
👉 ${linkWithGuest}

Tarikh: ${weddingDate}

Semoga kehadiran anda memeriahkan lagi majlis kami. Terima kasih!`
      };

      setShareText(dynamicTemplates[selectedTemplate]);
    }
  }, [isShareModalOpen, selectedTemplate, invitation, shareToGuest, invitationLink, weddingDate]);

  const handleGenerateMagic = () => {
    if (!magicGuest || !invitation) return;
    const encoded = encodeURIComponent(magicGuest);
    setMagicLink(`${invitationLink}?to=${encoded}`);
    setShareToGuest(magicGuest);
    setIsShareModalOpen(true);
  };

  const shareSpecificLink = (guestName: string) => {
    setShareToGuest(guestName);
    setIsShareModalOpen(true);
  };

  if (loading) {
    return (
      <div className="pt-32 text-center font-serif italic text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
        <p className="mt-4">Loading invitation...</p>
      </div>
    );
  }

  if (!invitation) return <div className="pt-32 text-center font-serif italic text-gray-400">Invitation not found.</div>;

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-md transition">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl mb-4 bg-blue-50 text-blue-600`}>👁️</div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{invitation.views || 0}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Kad Dibuka</p>
          </div>

          {!canAccess('rsvp') ? (
            <div className="col-span-1 md:col-span-3 bg-rose-50/50 border border-dashed border-rose-200 rounded-[2rem] flex flex-col items-center justify-center p-6 text-center">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em] mb-2 border border-rose-200 px-3 py-1 rounded-full">Premium Feature</span>
              <p className="text-sm font-bold text-rose-800 italic">Upgrade ke pelan PRO untuk <br /> menggunakan Sistem RSVP & Ucapan.</p>
              <Link to="/pricing" className="mt-4 text-xs font-bold text-white bg-rose-600 px-6 py-2 rounded-full shadow-lg shadow-rose-100 hover:bg-rose-700 transition">Upgrade Sekarang</Link>
            </div>
          ) : (
            <>
              {[
                { label: 'Jumlah Pax', value: stats.totalPax, icon: '👥', color: 'bg-green-50 text-green-600' },
                { label: 'Hadir', value: stats.attendingCount, icon: '✅', color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Ucapan', value: (invitation.wishes || []).length, icon: '💌', color: 'bg-purple-50 text-purple-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-md transition">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl mb-4 ${stat.color}`}>{stat.icon}</div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Dashboard Tabs - Only for Pro+ */}
        {canAccess('rsvp') && (
          <div className="flex border-b border-gray-200 mb-8 space-x-10">
            <button onClick={() => setActiveTab('guests')} className={`pb-4 text-[11px] font-bold uppercase tracking-[0.2em] border-b-2 transition ${activeTab === 'guests' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Guest List</button>
            <button onClick={() => setActiveTab('wishes')} className={`pb-4 text-[11px] font-bold uppercase tracking-[0.2em] border-b-2 transition ${activeTab === 'wishes' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Wishes</button>
            {canAccess('magic_link') && <button onClick={() => setActiveTab('magic')} className={`pb-4 text-[11px] font-bold uppercase tracking-[0.2em] border-b-2 transition ${activeTab === 'magic' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Magic Generator</button>}
          </div>
        )}

        {!canAccess('magic_link') && (
          <div className="mb-12">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block mb-2">Kongsi Kad Anda</span>
                <h3 className="text-xl font-serif italic font-bold text-gray-800">Sedia untuk dikongsi?</h3>
                <div className="flex items-center gap-2 mt-2 justify-center md:justify-start">
                  <p className="text-sm text-gray-400 italic max-w-md truncate">{invitationLink}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(invitationLink);
                      alert('Pautan disalin!');
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-rose-600 transition"
                    title="Salin Pautan"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShareToGuest('');
                    setIsShareModalOpen(true);
                  }}
                  className="bg-green-500 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-green-100 hover:bg-green-600 transition group"
                >
                  <span className="text-lg">📱</span>
                  WhatsApp / Share Popup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative animate-scale-in">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-10">
                <h3 className="text-2xl font-serif font-bold text-center text-gray-900 mb-8 italic">Share it to your family & friends!</h3>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 cursor-default">Pilih Template</label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value as 'A' | 'B')}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-rose-200 transition text-sm font-bold text-gray-700 appearance-none cursor-pointer"
                    >
                      <option value="A">Template A (Formal)</option>
                      <option value="B">Template B (Modern/Casual)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2 cursor-default">Edit Mesej</label>
                    <textarea
                      value={shareText}
                      onChange={(e) => setShareText(e.target.value)}
                      rows={10}
                      className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-rose-200 transition text-sm font-medium text-gray-600 resize-none font-sans"
                    />
                    <p className="text-[10px] text-gray-400 mt-2 italic text-center">You can edit the text above before sharing</p>
                  </div>

                  <div className="flex justify-center gap-4 pt-4 flex-wrap">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareText);
                        alert('Mesej disalin!');
                      }}
                      className="w-11 h-11 rounded-full bg-gray-400 text-white flex items-center justify-center hover:bg-gray-500 transition shadow-lg shadow-gray-100"
                      title="Salin Pautan"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition shadow-lg shadow-green-100"
                      title="Share to WhatsApp"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82c1.516.903 3.124 1.396 4.772 1.396 5.232 0 9.491-4.259 9.493-9.492.002-2.533-.986-4.915-2.783-6.712s-4.181-2.783-6.713-2.785c-5.236 0-9.494 4.259-9.496 9.492-.001 1.83.522 3.618 1.51 5.161l-1.005 3.668 3.759-.986zm11.367-6.413c-.31-.155-1.837-.906-2.121-.1.009-.284-.131-.382-.272-.459-.253-.138-1.662-.77-1.823-.843-.162-.072-.279-.108-.396.071-.117.181-.454.57-.557.689-.102.118-.205.133-.515-.022-.31-.155-1.308-.482-2.491-1.538-.919-.821-1.54-1.834-1.72-2.145-.181-.31-.019-.477.136-.632.14-.139.31-.362.466-.544.156-.181.208-.31.311-.518.104-.207.052-.388-.026-.544-.078-.155-.7-1.688-.96-2.315-.253-.611-.51-.527-.7-.527-.181-.001-.388-.002-.596-.002-.207 0-.544.077-.828.388-.285.31-1.088 1.062-1.088 2.589 0 1.527 1.114 3.003 1.269 3.21.155.207 2.193 3.35 5.313 4.697.742.32 1.32.511 1.77.653.745.237 1.423.204 1.959.124.597-.09 1.837-.751 2.096-1.474.259-.724.259-1.346.181-1.474-.077-.129-.285-.207-.595-.362z" />
                      </svg>
                    </a>

                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(invitationLink)}&text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 rounded-full bg-[#0088cc] text-white flex items-center justify-center hover:opacity-90 transition shadow-lg shadow-blue-100"
                      title="Share to Telegram"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.891 8.146l-2.003 9.445c-.149.659-.539.822-1.089.511l-3.054-2.25-1.473 1.417c-.163.163-.299.299-.614.299l.219-3.107 5.654-5.109c.246-.219-.054-.341-.381-.124l-6.99 4.402-3.012-.942c-.655-.205-.667-.655.137-.97l11.77-4.537c.545-.198 1.022.129.832.858z" />
                      </svg>
                    </a>

                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(invitationLink)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition shadow-lg shadow-blue-100"
                      title="Share to Facebook"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.791-4.667 4.53-4.667 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.951.925-1.951 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>

                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(invitationLink)}&text=${encodeURIComponent(shareText)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:opacity-90 transition shadow-lg shadow-gray-200"
                      title="Share to X (Twitter)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.13l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>

                    <a
                      href={`mailto:?subject=${encodeURIComponent('Kad Jemputan Perkahwinan: ' + invitation.groom_name + ' & ' + invitation.bride_name)}&body=${encodeURIComponent(shareText)}`}
                      className="w-11 h-11 rounded-full bg-rose-500 text-white flex items-center justify-center hover:opacity-90 transition shadow-lg shadow-rose-100"
                      title="Share via Email"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Guest List */}
        {canAccess('rsvp') && activeTab === 'guests' && (
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
                    {(rsvps || []).map((rsvp) => (
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
                  {(rsvps || []).slice(0, 4).map((r, i) => (
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
        {canAccess('rsvp') && activeTab === 'wishes' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {(invitation.wishes || []).length > 0 ? (invitation.wishes || []).map((wish) => (
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
        {canAccess('rsvp') && activeTab === 'magic' && (
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
                        <a
                          onClick={(e) => {
                            if (!shareToGuest) {
                              e.preventDefault();
                              alert('Sila jana link terlebih dahulu');
                              return;
                            }
                            handleGenerateMagic();
                          }}
                          href="#"
                          className="bg-green-500 text-white py-4 rounded-2xl text-center text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:bg-green-600 transition"
                        >
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

export default ManageInvitationPage;