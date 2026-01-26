import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_INVITATIONS } from '../../constants';
import { UserIcon, CogIcon, CreditCardIcon, PhotoIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Invitation } from '../../types';

// Import the existing Dashboard component from App.tsx
// We'll create a wrapper that uses the existing Dashboard component logic
const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>(MOCK_INVITATIONS);
  const [loading, setLoading] = useState(true);

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

        const response = await fetch('http://localhost:3001/api/invitations', {
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
          <Link to="/catalog" className="bg-rose-600 text-white px-8 py-3.5 rounded-full font-bold flex items-center space-x-2 hover:bg-rose-700 shadow-2xl shadow-rose-200 transition transform active:scale-95 uppercase text-[10px] tracking-widest">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Bina Baru</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {console.log('🎨 Dashboard: Rendering invitations', invitations)}
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
                  <Link to={`/i/${inv.slug || inv.id}`} className="w-full text-center py-3 border border-gray-100 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:text-rose-600 hover:border-rose-100 transition duration-300">Buka Link Utama</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;