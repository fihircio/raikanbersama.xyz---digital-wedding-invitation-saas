import React from 'react';
import BackgroundCard from './BackgroundCard';
import { BackgroundImage } from '../../types';

interface BackgroundGridProps {
  backgrounds: BackgroundImage[];
  onSelect: (background: BackgroundImage) => void;
  onToggleFavorite: (backgroundId: string) => void;
  favorites: Set<string>;
  isAuthenticated: boolean;
}

const BackgroundGrid: React.FC<BackgroundGridProps> = ({
  backgrounds,
  onSelect,
  onToggleFavorite,
  favorites,
  isAuthenticated
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
      {backgrounds.map((background) => (
        <BackgroundCard
          key={background.id}
          background={background}
          onSelect={() => onSelect(background)}
          onToggleFavorite={() => onToggleFavorite(background.id)}
          isFavorited={favorites.has(background.id)}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
};

export default BackgroundGrid;