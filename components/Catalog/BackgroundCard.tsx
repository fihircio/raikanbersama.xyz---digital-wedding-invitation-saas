import React, { useState } from 'react';
import { BackgroundImage, Invitation } from '../../types';
import CoverLayout from '../Invitation/CoverLayout';

interface BackgroundCardProps {
  background: BackgroundImage;
  onSelect: () => void;
  onToggleFavorite: () => void;
  isFavorited: boolean;
  isAuthenticated: boolean;
}

const BackgroundCard: React.FC<BackgroundCardProps> = ({
  background,
  onSelect,
  onToggleFavorite,
  isFavorited,
  isAuthenticated
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onSelect
    onToggleFavorite();
  };

  // Create a mock invitation for preview
  const mockInvitation: Partial<Invitation> = {
    groom_name: 'Adam Malik',
    bride_name: 'Siti Hawa',
    location_name: 'Dewan Banquet Melati',
    event_date: '2025-12-25',
    settings: {
      music_url: '',
      primary_color: background.primary_color !== 'Varies' ? background.primary_color : '#8B4513',
      show_countdown: true,
      show_gallery: true,
      is_published: true,
      hero_title: 'Walimatulurus',
      background_image: background.url,
      layout_settings: background.layout_settings,
      // Use styles from layout settings or defaults
      groom_font: background.layout_settings?.font_family,
      bride_font: background.layout_settings?.font_family,
      groom_color: background.primary_color !== 'Varies' ? background.primary_color : '#8B4513',
      bride_color: background.primary_color !== 'Varies' ? background.primary_color : '#8B4513',
    }
  };


  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Phone Frame Wrapper */}
      <div className="relative aspect-[9/19] w-full max-w-[240px] mx-auto group">
        {/* Phone Frame Body */}
        <div className="absolute inset-0 bg-gray-900 rounded-[2.5rem] p-[6px] shadow-2xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-rose-500/10">
          {/* Inner Screen */}
          <div className="relative w-full h-full rounded-[2.2rem] overflow-hidden bg-white">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-2xl z-[60]"></div>

            {/* Background Image with Overlay */}

            <div className="absolute inset-0">
              <img
                src={background.url}
                alt={background.name}
                className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                onClick={onSelect}
              />
              <div
                className="absolute inset-0 bg-black transition-opacity duration-300 pointer-events-none"
                style={{ opacity: background.layout_settings?.overlay_opacity ?? 0.4 }}
              ></div>
            </div>

            {/* Design Preview (CoverLayout) scaled down */}
            <div className={`absolute left-0 top-0 pointer-events-none origin-top-left scale-[0.333] w-[300%] h-[300%] transition-opacity duration-500 ${isHovered ? 'opacity-40' : 'opacity-100'}`}>
              <CoverLayout invitation={mockInvitation} formattedDate="25 Disember 2025" />
            </div>




            {/* Overlay on Hover */}
            <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 z-30 ${isHovered ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>

              <div className="text-center pointer-events-auto scale-90">
                <button
                  onClick={onSelect}
                  className="bg-white text-gray-900 px-5 py-2.5 rounded-full font-bold text-xs mb-2 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-lg"
                >
                  {isAuthenticated ? 'Guna Sekarang' : 'Bina Kad'}
                </button>
              </div>
            </div>

            {/* Premium Badge */}
            {background.isPremium && (
              <div className="absolute top-8 left-0 z-40">
                <div className="bg-rose-600 text-white px-2.5 py-1 rounded-r-lg text-[9px] font-bold uppercase tracking-widest shadow-lg">
                  Premium
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Favorite Heart Icon - Moved outside inner screen for better spacing */}
        {isAuthenticated && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-6 right-6 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 shadow-xl group/heart z-50 transform hover:scale-110"
          >
            <svg
              className={`w-4 h-4 transition-all duration-200 ${isFavorited
                ? 'fill-rose-600 text-rose-600'
                : 'fill-none text-gray-400 group-hover/heart:text-rose-600'
                }`}
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm font-bold text-gray-800 group-hover:text-rose-600 transition-colors">{background.name}</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{background.category}</p>
        </div>
      </div>
    </div>
  );
};

export default BackgroundCard;