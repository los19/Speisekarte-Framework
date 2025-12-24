import { useEffect, useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { useRestaurant, useFeatures } from '../config/ConfigProvider';
import '../styles/Header.css';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenHoursClick: () => void;
  selectedCount: number;
  onNotesClick: () => void;
}

export const Header = ({ 
  searchQuery, 
  onSearchChange, 
  onOpenHoursClick,
  selectedCount,
  onNotesClick
}: HeaderProps) => {
  const [isStickyMobile, setIsStickyMobile] = useState(false);
  const restaurant = useRestaurant();
  const features = useFeatures();

  useEffect(() => {
    const handleScrollAndResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) {
        setIsStickyMobile(false);
        return;
      }
      // Ab einem kleinen Scroll-Wert die Suchleiste sticky machen
      setIsStickyMobile(window.scrollY > 80);
    };

    handleScrollAndResize();
    window.addEventListener('scroll', handleScrollAndResize);
    window.addEventListener('resize', handleScrollAndResize);

    return () => {
      window.removeEventListener('scroll', handleScrollAndResize);
      window.removeEventListener('resize', handleScrollAndResize);
    };
  }, []);

  const cartIcon = features.ui.cartIcon === 'cart' ? '🛒' : '📋';

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-status">
          <StatusBadge onOpenHoursClick={onOpenHoursClick} />
        </div>
        <div className="logo-container">
          <img src="/logo.png" alt={restaurant?.name || 'Restaurant'} className="restaurant-logo" />
          {features.ui.showHeaderSubtitle && restaurant?.subtitle && (
            <span className="restaurant-subtitle">{restaurant.subtitle}</span>
          )}
        </div>
      </div>
      <div className={`header-bottom ${isStickyMobile ? 'header-bottom--sticky' : ''}`}>
        <div className="header-bottom-content">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Suche nach Gerichten..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="search-clear"
                onClick={() => onSearchChange('')}
              >
                ×
              </button>
            )}
          </div>
          <button 
            className="notes-badge" 
            onClick={onNotesClick}
            type="button"
            aria-label="Warenkorb öffnen"
          >
            <span className="notes-icon">{cartIcon}</span>
            <span className="notes-count">{selectedCount || 0}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

