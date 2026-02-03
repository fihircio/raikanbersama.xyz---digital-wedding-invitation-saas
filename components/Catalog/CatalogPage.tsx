import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BackgroundGrid from './BackgroundGrid';
import Pagination from './Pagination';
import SEO from '../SEO';
import { BackgroundImage, CatalogState } from '../../types';
import { useAuth } from '../../src/contexts/AuthContext';
import { buildApiUrl } from '../../src/config';

const CATEGORIES = [
  'Baby', 'Party', 'Ramadan', 'Raya', 'Floral', 'Islamic',
  'Minimalist', 'Modern', 'Rustic', 'Traditional', 'Vintage', 'Watercolor'
];

const THEMES = [
  'Modern', 'Traditional', 'Floral', 'Islamic', 'Minimalist', 'Rustic', 'Vintage'
];

const COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Emerald', hex: '#50C878' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Black', hex: '#000000' },
];

const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [state, setState] = useState<CatalogState>({
    backgrounds: [],
    currentPage: parseInt(searchParams.get('page') || '1', 10),
    totalPages: 1,
    isLoading: true,
    selectedBackground: null,
    isAuthenticated: false
  });

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Sync state with URL params
  const currentCategories = searchParams.get('category')?.split(',').filter(Boolean) || [];
  const currentThemes = searchParams.get('theme')?.split(',').filter(Boolean) || [];
  const currentColors = searchParams.get('color')?.split(',').filter(Boolean) || [];
  const currentSort = searchParams.get('sort') || 'latest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const fetchBackgrounds = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '15');
      params.append('sort', currentSort);
      if (currentCategories.length > 0) {
        params.append('category', currentCategories.join(','));
      }
      if (currentThemes.length > 0) {
        params.append('theme', currentThemes.join(','));
      }
      if (currentColors.length > 0) {
        params.append('color', currentColors.join(','));
      }

      const response = await fetch(buildApiUrl(`/backgrounds?${params.toString()}`), {
        credentials: 'include'
      });

      const newToken = response.headers.get('X-CSRF-Token');
      if (newToken) setCsrfToken(newToken);

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          backgrounds: data.data || [],
          totalPages: data.pagination?.pages || 1,
          isLoading: false
        }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error fetching backgrounds:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [currentPage, currentSort, currentCategories.join(','), currentThemes.join(','), currentColors.join(',')]);

  useEffect(() => {
    fetchBackgrounds();
    checkAuthStatus();
    if (user && token) {
      fetchFavorites();
    }
  }, [fetchBackgrounds, user, token]);

  const fetchFavorites = async () => {
    if (!token) return;
    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

      const response = await fetch(buildApiUrl('/favorites'), {
        headers,
        credentials: 'include'
      });

      const newToken = response.headers.get('X-CSRF-Token');
      if (newToken) setCsrfToken(newToken);

      if (response.ok) {
        const data = await response.json();
        const favoriteIds = new Set(data.data.map((fav: any) => fav.background_image_id));
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleCategory = (category: string) => {
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];

    setSearchParams(params => {
      if (newCategories.length > 0) {
        params.set('category', newCategories.join(','));
      } else {
        params.delete('category');
      }
      params.set('page', '1');
      return params;
    });
  };

  const toggleTheme = (theme: string) => {
    const newThemes = currentThemes.includes(theme)
      ? currentThemes.filter(t => t !== theme)
      : [...currentThemes, theme];

    setSearchParams(params => {
      if (newThemes.length > 0) {
        params.set('theme', newThemes.join(','));
      } else {
        params.delete('theme');
      }
      params.set('page', '1');
      return params;
    });
  };

  const toggleColor = (color: string) => {
    const newColors = currentColors.includes(color)
      ? currentColors.filter(c => c !== color)
      : [...currentColors, color];

    setSearchParams(params => {
      if (newColors.length > 0) {
        params.set('color', newColors.join(','));
      } else {
        params.delete('color');
      }
      params.set('page', '1');
      return params;
    });
  };

  const handleSortChange = (sort: string) => {
    setSearchParams(params => {
      params.set('sort', sort);
      params.set('page', '1');
      return params;
    });
  };

  const toggleFavorite = async (backgroundId: string) => {
    if (!user || !token) {
      navigate('/login');
      return;
    }

    const isFavorited = favorites.has(backgroundId);
    setFavorites(prev => {
      const next = new Set(prev);
      if (isFavorited) next.delete(backgroundId);
      else next.add(backgroundId);
      return next;
    });

    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

      const method = isFavorited ? 'DELETE' : 'POST';
      const url = isFavorited
        ? buildApiUrl(`/favorites/${backgroundId}`)
        : buildApiUrl('/favorites');

      const response = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: isFavorited ? undefined : JSON.stringify({ background_image_id: backgroundId })
      });

      const newToken = response.headers.get('X-CSRF-Token');
      if (newToken) setCsrfToken(newToken);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      fetchFavorites(); // Revert on error
    }
  };

  const checkAuthStatus = () => {
    setState(prev => ({ ...prev, isAuthenticated: !!user }));
  };

  const planParam = searchParams.get('plan');

  const handleBackgroundSelect = async (background: BackgroundImage) => {
    if (!state.isAuthenticated) {
      navigate(`/edit/demo?bg_url=${encodeURIComponent(background.url)}&layout=${background.layout_settings?.cover_layout || 'standard'}&font=${background.layout_settings?.font_family || 'serif'}${planParam ? `&plan=${planParam}` : ''}`);
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Prepare new invitation data
      const newInvitation = {
        slug: `invitation-${Date.now()}`,
        template_id: 'modern-classic',
        event_type: 'Walimatulurus',
        bride_name: 'Pengantin Perempuan',
        groom_name: 'Pengantin Lelaki',
        host_names: 'Keluarga Pengantin',
        event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '11:00',
        end_time: '16:00',
        location_name: 'Dewan Majlis',
        address: 'Alamat Majlis',
        google_maps_url: 'https://maps.google.com',
        waze_url: 'https://waze.com',
        settings: {
          music_url: '',
          primary_color: '#8B4513',
          show_countdown: true,
          show_gallery: true,
          is_published: false,
          package_plan: planParam || 'free',
          is_paid: false,
          background_image: background.url,
          layout_settings: background.layout_settings || {
            cover_layout: 'standard',
            font_family: 'serif'
          },
          pantun: '',
          our_story: '',
          hero_title: 'Raikan Cinta Kami',
          greeting_text: 'Assalammualaikum W.B.T',
          invitation_text: 'Dengan penuh kesyukuran, kami menjemput anda ke majlis perkahwinan kami:',
          story_title: 'Kisah Cinta Kami',
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
        money_gift_details: {
          enabled: false,
          bank_name: '',
          account_no: '',
          account_holder: '',
          qr_url: '',
          gift_title: 'Hadiah & Ingatan',
          gift_subtitle: 'Khas buat mempelai'
        },
        wishlist_details: {
          enabled: false,
          receiver_phone: '',
          receiver_address: '',
          items: []
        },
        rsvp_settings: {
          response_mode: 'rsvp_and_wish',
          fields: {
            name: true,
            phone: true,
            email: false,
            address: false,
            company: false,
            job_title: false,
            car_plate: false,
            remarks: true,
            wish: true
          },
          has_children_policy: false,
          pax_limit_per_rsvp: 10,
          total_guest_limit: 500,
          has_slots: false,
          slots_options: []
        }
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

      const response = await fetch(buildApiUrl('/invitations'), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(newInvitation)
      });

      const newToken = response.headers.get('X-CSRF-Token');
      if (newToken) setCsrfToken(newToken);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Catalog: New invitation created', data);
        // Redirect directly to the editor
        navigate(`/edit/${data.data.id}`);
      } else {
        console.error('❌ Catalog: Failed to create invitation');
        alert('Gagal mencipta jemputan. Sila cuba lagi.');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('❌ Catalog: Error creating invitation:', error);
      alert('Ralat teknikal berlaku. Sila cuba lagi.');
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handlePageChange = (page: number) => {
    setSearchParams(params => {
      params.set('page', page.toString());
      return params;
    });
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <SEO
        title="Katalog Tema Kad Jemputan Digital"
        description="Terokai koleksi tema premium untuk kad jemputan digital anda. Pelbagai pilihan design elegant, rustic, minimalist dan tradisional."
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Pilih Tema Kad Jemputan Anda
          </h1>
          <p className="text-lg text-gray-600">
            Koleksi premium untuk pelbagai majlis istimewa anda
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 space-y-8">
          {/* Themes Tab */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tema</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSearchParams(params => { params.delete('theme'); params.set('page', '1'); return params; })}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${currentThemes.length === 0
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 scale-105'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Semua Tema
              </button>
              {THEMES.map(theme => (
                <button
                  key={theme}
                  onClick={() => toggleTheme(theme)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${currentThemes.includes(theme)
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 scale-105'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pt-4 border-t border-gray-50">
            <div className="space-y-4 flex-1">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Warna Utama</h3>
              <div className="flex flex-wrap gap-4">
                {COLORS.map(color => (
                  <button
                    key={color.name}
                    onClick={() => toggleColor(color.name)}
                    title={color.name}
                    className={`group relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${currentColors.includes(color.name)
                      ? 'border-rose-500 p-1 scale-110'
                      : 'border-transparent hover:border-gray-200'
                      }`}
                  >
                    <span
                      className="w-full h-full rounded-full shadow-inner"
                      style={{ backgroundColor: color.hex, border: color.name === 'White' ? '1px solid #e5e7eb' : 'none' }}
                    />
                    {currentColors.includes(color.name) && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Susunan:</span>
              <select
                value={currentSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-gray-50 border-gray-200 rounded-2xl text-sm font-semibold py-3 px-6 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all outline-none"
              >
                <option value="latest">Terbaru</option>
                <option value="popular">Paling Popular</option>
                <option value="a-z">Nama (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {state.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : state.backgrounds.length > 0 ? (
          <BackgroundGrid
            backgrounds={state.backgrounds}
            onSelect={handleBackgroundSelect}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
            isAuthenticated={state.isAuthenticated}
          />
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900">Tiada tema dijumpai</h3>
            <p className="text-gray-500 mt-2">Cuba tukar pilihan penapis atau kategori anda</p>
            <button
              onClick={() => navigate('/catalog')}
              className="mt-6 text-rose-600 font-bold hover:underline"
            >
              Reset Semua Penapis
            </button>
          </div>
        )}

        <div className="mt-12">
          <Pagination
            currentPage={state.currentPage}
            totalPages={state.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;