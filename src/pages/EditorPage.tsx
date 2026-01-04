import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import TabButton from '../../components/Editor/TabButton';
import { Invitation, ContactPerson } from '../../types';
import { MOCK_INVITATIONS, THEME_COLORS } from '../../constants';
import { generatePantun, generateStory } from '../../services/geminiService';
import { InvitationContent } from './PublicInvitationPage';
import { useAuth } from '../contexts/AuthContext';

const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [inv, setInv] = useState<Invitation | null>(null);
  const [activeTab, setActiveTab] = useState('utama');
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

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
          let invitationData = data.data;
          
          // Check for selected background from catalog
          const selectedBackground = sessionStorage.getItem('selectedBackground');
          if (selectedBackground) {
            const background = JSON.parse(selectedBackground);
            invitationData = {
              ...invitationData,
              settings: {
                ...invitationData.settings,
                background_image: background.url
              }
            };
            // Clear from sessionStorage after applying
            sessionStorage.removeItem('selectedBackground');
          }
          
          setInv(invitationData);
        } else {
          console.error('Failed to fetch invitation:', response.statusText);
          // Fallback to mock data if API fails
          const found = MOCK_INVITATIONS.find(item => item.id === id);
          if (found) {
            setInv(found);
          }
        }
      } catch (error) {
        console.error('Error fetching invitation:', error);
        // Fallback to mock data if API fails
        const found = MOCK_INVITATIONS.find(item => item.id === id);
        if (found) {
          setInv(found);
        }
      }
    };
    
    fetchInvitation();
  }, [id, token]);

  // Save invitation data to backend
  const saveInvitation = async () => {
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
          <button
            onClick={saveInvitation}
            className="bg-rose-600 text-white px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-rose-700 transition shadow-lg shadow-rose-100"
          >
            Save Changes
          </button>
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
            {/* Live preview content */}
            <InvitationContent invitation={inv} isPreview={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;