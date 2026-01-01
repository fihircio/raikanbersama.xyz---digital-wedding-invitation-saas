import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackgroundGrid from './BackgroundGrid';
import Pagination from './Pagination';
import { BackgroundImage, CatalogState } from '../../types';

const CatalogPage: React.FC = () => {
  const [state, setState] = useState<CatalogState>({
    backgrounds: [],
    currentPage: 1,
    totalPages: 3,
    isLoading: true,
    selectedBackground: null,
    isAuthenticated: false // Check from auth context - for now hardcoded
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch backgrounds for current page
    fetchBackgrounds(state.currentPage);
    // Check authentication status
    checkAuthStatus();
  }, [state.currentPage]);

  const fetchBackgrounds = async (page: number) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Mock data - replace with API call
    const mockBackgrounds: BackgroundImage[] = Array.from({ length: 15 }, (_, i) => ({
      id: `bg-${page}-${i + 1}`,
      name: `Background ${(page - 1) * 15 + i + 1}`,
      url: `https://picsum.photos/seed/bg${page}${i}/800/1200.jpg`,
      thumbnail: `https://picsum.photos/seed/bg${page}${i}/400/600.jpg`,
      category: ['popular', 'minimalist', 'elegant', 'floral'][Math.floor(Math.random() * 4)] as any,
      isPremium: Math.random() > 0.7,
      tags: ['wedding', 'elegant', 'modern']
    }));
    
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        backgrounds: mockBackgrounds,
        isLoading: false
      }));
    }, 500);
  };

  const checkAuthStatus = () => {
    // Mock authentication check - replace with actual auth logic
    const token = localStorage.getItem('authToken');
    setState(prev => ({ ...prev, isAuthenticated: !!token }));
  };

  const handleBackgroundSelect = (background: BackgroundImage) => {
    if (!state.isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login?redirect=/catalog&bg=' + background.id);
      return;
    }
    
    // Store selected background in sessionStorage
    sessionStorage.setItem('selectedBackground', JSON.stringify(background));
    
    // Navigate to editor with new invitation or existing
    navigate('/edit/new'); // Or navigate to existing invitation
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
            Pilih Tema Kad Jemputan Anda
          </h1>
          <p className="text-lg text-gray-600">
            Koleksi premium untuk majlis perkahwinan istimewa anda
          </p>
        </div>
        
        {state.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <BackgroundGrid 
            backgrounds={state.backgrounds}
            onSelect={handleBackgroundSelect}
            isAuthenticated={state.isAuthenticated}
          />
        )}
        
        <Pagination 
          currentPage={state.currentPage}
          totalPages={state.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default CatalogPage;