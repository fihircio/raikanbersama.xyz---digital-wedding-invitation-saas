import React, { useState } from 'react';
import { BackgroundImage } from '../../types';

interface BackgroundCardProps {
  background: BackgroundImage;
  onSelect: () => void;
  isAuthenticated: boolean;
}

const BackgroundCard: React.FC<BackgroundCardProps> = ({ 
  background, 
  onSelect, 
  isAuthenticated 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-105">
        <img 
          src={background.thumbnail} 
          alt={background.name}
          className="w-full h-full object-cover"
        />
        
        {background.isPremium && (
          <div className="absolute top-3 right-3 bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Premium
          </div>
        )}
        
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300">
            <div className="text-center">
              <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold text-sm mb-2 hover:bg-gray-100 transition">
                {isAuthenticated ? 'Apply' : 'Login to Apply'}
              </button>
              <p className="text-white text-xs">{background.name}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-gray-900">{background.name}</p>
        <p className="text-xs text-gray-500 capitalize">{background.category}</p>
      </div>
    </div>
  );
};

export default BackgroundCard;