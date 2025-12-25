import type { MenuItem as MenuItemType, PriceVariants } from '../types/menu';
import { useFeatures, useSpecialOffers } from '../config/ConfigProvider';
import { getSpecialPriceForItem, isSpecialOfferActive, getTargetCategoryForOffer } from '../utils/specialOffers';
import '../styles/MenuItem.css';

interface MenuItemProps {
  item: MenuItemType;
  category: string;
  quantity: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
  onSelectVariant?: (category: string, item: MenuItemType) => void;
  onNavigateToCategory?: (category: string) => void;
  hideQuantityControls?: boolean;
}

// Day abbreviations mapping to full names and colors
const DAY_CONFIG: Record<string, { full: string; color: string }> = {
  'Mo.': { full: 'Montag', color: '#E74C3C' },
  'Di.': { full: 'Dienstag', color: '#3498DB' },
  'Mi.': { full: 'Mittwoch', color: '#27AE60' },
  'Do.': { full: 'Donnerstag', color: '#9B59B6' },
  'Fr.': { full: 'Freitag', color: '#F39C12' },
  'Sa.': { full: 'Samstag', color: '#1ABC9C' },
  'So.': { full: 'Sonntag', color: '#E91E63' },
};

// Check if dish name starts with a day abbreviation
const parseDayPrefix = (name: string): { dayAbbr: string | null; dayFull: string | null; color: string | null; rest: string } => {
  for (const [abbr, config] of Object.entries(DAY_CONFIG)) {
    if (name.startsWith(abbr)) {
      return {
        dayAbbr: abbr,
        dayFull: config.full,
        color: config.color,
        rest: name.slice(abbr.length).trim(),
      };
    }
  }
  return { dayAbbr: null, dayFull: null, color: null, rest: name };
};

// Helper to format price display
const formatPrice = (preis: number | PriceVariants | null, specialPrice?: number | null): string => {
  if (preis === null) {
    return 'auf Anfrage';
  }
  if (typeof preis === 'number') {
    return `${preis.toFixed(2)} €`;
  }
  // Object with variants - show range or special price
  const entries = Object.entries(preis);
  if (specialPrice !== null && specialPrice !== undefined) {
    return `${specialPrice.toFixed(2)} €`;
  }
  return entries.map(([size, price]) => `${size}: ${price.toFixed(2)} €`).join(' | ');
};

// Check if item has price variants
export const hasVariants = (preis: number | PriceVariants | null): preis is PriceVariants => {
  return typeof preis === 'object' && preis !== null;
};

// Get the lowest price for items with variants (for cart calculations)
export const getLowestPrice = (preis: number | PriceVariants | null): number => {
  if (preis === null) return 0;
  if (typeof preis === 'number') return preis;
  const prices = Object.values(preis);
  return Math.min(...prices);
};

export const MenuItem = ({ 
  item, 
  category, 
  quantity, 
  onIncrease, 
  onDecrease, 
  onSelectVariant,
  onNavigateToCategory,
  hideQuantityControls 
}: MenuItemProps) => {
  const features = useFeatures();
  const specialOffers = useSpecialOffers();
  
  const itemHasVariants = features.enablePriceVariants && hasVariants(item.preis);
  const { dayAbbr, dayFull, color, rest } = parseDayPrefix(item.gericht);
  
  // Check if this is a Dauerangebot (special offer navigation item)
  const isDauerangebot = features.enableSpecialOffers && dayAbbr !== null && category === 'Dauerangebote';
  const isOfferActive = features.enableSpecialOffers && dayAbbr ? isSpecialOfferActive(specialOffers, dayAbbr) : false;
  const targetCategory = features.enableSpecialOffers && dayAbbr ? getTargetCategoryForOffer(specialOffers, dayAbbr) : null;
  
  // Check for special pricing on regular items
  const specialPrice = features.enableSpecialOffers && !isDauerangebot 
    ? getSpecialPriceForItem(specialOffers, item.nr, category) 
    : null;
  const hasSpecialPrice = specialPrice !== null;
  
  const handleIncrease = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // For Dauerangebote, navigate to target category instead of adding to cart
    if (isDauerangebot && targetCategory && onNavigateToCategory && features.enableCategoryNavigation) {
      onNavigateToCategory(targetCategory);
      return;
    }
    
    if (hideQuantityControls) return;
    
    if (itemHasVariants && !hasSpecialPrice && onSelectVariant) {
      onSelectVariant(category, item);
    } else {
      onIncrease?.();
    }
  };

  const handleItemClick = () => {
    // For Dauerangebote, navigate to target category
    if (isDauerangebot && targetCategory && onNavigateToCategory && features.enableCategoryNavigation) {
      onNavigateToCategory(targetCategory);
    }
  };

  // For simple mode (no variants), display price simply
  const displayPrice = () => {
    if (!features.enablePriceVariants && hasVariants(item.preis)) {
      // Show lowest price when variants are disabled
      const lowest = getLowestPrice(item.preis);
      return `ab ${lowest.toFixed(2)} €`;
    }
    return formatPrice(item.preis, specialPrice);
  };

  return (
    <div 
      className={`menu-item ${quantity > 0 ? 'selected' : ''} ${isDauerangebot ? 'is-dauerangebot' : ''} ${isOfferActive ? 'offer-active' : ''} ${hasSpecialPrice ? 'has-special-price' : ''}`}
      onClick={isDauerangebot ? handleItemClick : undefined}
      style={{ cursor: isDauerangebot ? 'pointer' : undefined }}
    >
      <div className="menu-item-content">
        <div className="menu-item-info">
          {item.nr && <span className="menu-item-number">Nr. {item.nr}</span>}
          {features.enableSpecialOffers && dayFull ? (
            <div className="menu-item-name">
              <span 
                className={`day-badge ${isOfferActive ? 'active' : ''}`}
                style={{ backgroundColor: color || undefined }}
              >
                {dayFull}
                {isOfferActive && <span className="active-indicator">HEUTE!</span>}
              </span>
              <span>{rest}</span>
            </div>
          ) : (
            <span className="menu-item-name">{item.gericht}</span>
          )}
          {hasSpecialPrice && (
            <span className="special-price-badge">🔥 Tagesangebot!</span>
          )}
        </div>
        <div className="menu-item-right">
          {hasSpecialPrice ? (
            <div className="menu-item-price-container">
              <span className="menu-item-price original-price">
                {formatPrice(item.preis)}
              </span>
              <span className="menu-item-price special-price">
                {specialPrice.toFixed(2)} €
              </span>
            </div>
          ) : (
            <span className={`menu-item-price ${itemHasVariants ? 'has-variants' : ''}`}>
              {displayPrice()}
            </span>
          )}
          
          {isDauerangebot ? (
            <button 
              className="navigate-btn"
              onClick={handleIncrease}
            >
              →
            </button>
          ) : !hideQuantityControls ? (
            <div className="menu-item-controls">
              {quantity > 0 && (
                <>
                  <button 
                    className="quantity-btn decrease" 
                    onClick={(e) => { e.stopPropagation(); onDecrease?.(); }}
                  >
                    −
                  </button>
                  <span className="quantity-display">{quantity}</span>
                </>
              )}
              <button 
                className="quantity-btn increase" 
                onClick={handleIncrease}
              >
                +
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

