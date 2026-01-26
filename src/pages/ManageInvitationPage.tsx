import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Invitation, RSVP } from '../../types';
import { MOCK_RSVPS } from '../../constants';
import { useAuth } from '../contexts/AuthContext';

const ManageInvitationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('guests');
  const [magicGuest, setMagicGuest] = useState('');
  const [magicLink, setMagicLink] = useState('');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);

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

        const response = await fetch(`http://localhost:3001/api/invitations/${id}`, {
          method: 'GET',
          headers,
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Manage: API Response received', data);
          setInvitation(data.data);
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

        const response = await fetch(`http://localhost:3001/api/rsvps/invitation/${id}`, {
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

      const response = await fetch(`http://localhost:3001/api/guest-wishes/invitation/${id}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Manage: Wishes API Response received', data);
        // Update the invitation with the fetched wishes
        setInvitation(prev => prev ? { ...prev, wishes: data.data } : null);
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

  if (loading) {
    return (
      <div className="pt-32 text-center font-serif italic text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
        <p className="mt-4">Loading invitation...</p>
      </div>
    );
  }

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
                <p className="text-sm text-gray-400 mt-2 italic max-w-md">Salin pautan di bawah untuk jemput tetamu anda. Pautan ini boleh dikongsi terus ke WhatsApp, Telegram, atau Media Sosial.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const baseUrl = window.location.origin + window.location.pathname;
                    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                    const link = `${cleanBase}#/i/${invitation.slug}`;
                    navigator.clipboard.writeText(link);
                    alert('Pautan disalin!');
                  }}
                  className="bg-white text-gray-700 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm border border-gray-100 hover:bg-gray-50 transition"
                >
                  Salin Pautan
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent('Assalamualaikum! Ini kad jemputan perkahwinan kami: ' + window.location.origin + window.location.pathname + '#/i/' + invitation.slug)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-green-500 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:bg-green-600 transition"
                >
                  WhatsApp
                </a>
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

export default ManageInvitationPage;