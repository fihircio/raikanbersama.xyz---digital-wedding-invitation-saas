import React from 'react';
import BackgroundCard from './BackgroundCard';
import { BackgroundImage } from '../../types';

interface BackgroundGridProps {
  backgrounds: BackgroundImage[];
  onSelect: (background: BackgroundImage) => void;
  isAuthenticated: boolean;
}

const BackgroundGrid: React.FC<BackgroundGridProps> = ({ 
  backgrounds, 
  onSelect, 
  isAuthenticated 
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
      {backgrounds.map((background) => (
        <BackgroundCard
          key={background.id}
          background={background}
          onSelect={() => onSelect(background)}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
};

export default BackgroundGrid;