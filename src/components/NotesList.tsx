import { useState } from 'react';
import { useRestaurant, useFeatures } from '../config/ConfigProvider';
import { generateShareUrl, shareViaNavigator, copyToClipboard } from '../utils/shareUtils';
import type { MenuItem } from '../types/menu';
import '../styles/NotesList.css';

interface NotesListProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: Map<string, { 
    category: string; 
    item: MenuItem; 
    quantity: number; 
    variant?: string;
    variantPrice?: number;
  }>;
  selectedItemsRaw: { [key: string]: number };
  onClearAll: () => void;
  onRemoveItem: (key: string) => void;
  onUpdateQuantity: (key: string, change: number) => void;
  onWhatsAppOrder?: () => void; // Callback to open WhatsApp order modal
}

export const NotesList = ({
  isOpen,
  onClose,
  selectedItems,
  selectedItemsRaw,
  onClearAll,
  onRemoveItem,
  onUpdateQuantity,
  onWhatsAppOrder,
}: NotesListProps) => {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const restaurant = useRestaurant();
  const features = useFeatures();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleShare = async () => {
    const url = generateShareUrl(selectedItemsRaw);
    const title = `Meine Auswahl bei ${restaurant?.name || 'Restaurant'}`;
    
    const shared = await shareViaNavigator(url, title);
    if (!shared) {
      const copied = await copyToClipboard(url);
      setShareStatus(copied ? 'copied' : 'error');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  };

  const handleWhatsAppOrder = () => {
    if (onWhatsAppOrder) {
      onWhatsAppOrder();
    }
  };
  
  // Check if WhatsApp ordering is available
  const isWhatsAppAvailable = features.enableWhatsAppOrder && !!restaurant?.whatsappNumber;

  const handleCall = () => {
    if (!restaurant?.phone) return;
    window.location.href = `tel:${restaurant.phone}`;
  };

  const handleRoute = () => {
    if (!restaurant?.googleMapsUrl) return;
    window.open(restaurant.googleMapsUrl, '_blank');
  };

  // Calculate total
  const getItemPrice = (item: MenuItem, variantPrice?: number): number => {
    if (variantPrice !== undefined) return variantPrice;
    if (typeof item.preis === 'number') return item.preis;
    if (item.preis === null) return 0;
    // For variants without specific price, use lowest
    return Math.min(...Object.values(item.preis));
  };

  const total = Array.from(selectedItems.values()).reduce((sum, { item, quantity, variantPrice }) => {
    return sum + getItemPrice(item, variantPrice) * quantity;
  }, 0);

  const itemCount = Array.from(selectedItems.values()).reduce((sum, { quantity }) => sum + quantity, 0);

  return (
    <div className="notes-backdrop" onClick={handleBackdropClick}>
      <div className="notes-panel">
        <div className="notes-header">
          <h3>Meine Auswahl ({itemCount})</h3>
          <button className="notes-close" onClick={onClose}>×</button>
        </div>

        <div className="notes-content">
          {selectedItems.size === 0 ? (
            <div className="notes-empty">
              <p>Noch keine Gerichte ausgewählt</p>
              <p className="notes-empty-hint">Tippe auf + um Gerichte hinzuzufügen</p>
            </div>
          ) : (
            <div className="notes-items">
              {Array.from(selectedItems.entries()).map(([key, { item, quantity, variant, variantPrice }]) => (
                <div key={key} className="notes-item">
                  <div className="notes-item-info">
                    <div className="notes-item-name">
                      {item.nr && <span className="notes-item-nr">Nr. {item.nr}</span>}
                      {item.gericht}
                      {variant && <span className="notes-item-variant">({variant})</span>}
                    </div>
                    <div className="notes-item-price">
                      {(getItemPrice(item, variantPrice) * quantity).toFixed(2)} €
                    </div>
                  </div>
                  <div className="notes-item-controls">
                    <button 
                      className="notes-qty-btn"
                      onClick={() => onUpdateQuantity(key, -1)}
                    >
                      −
                    </button>
                    <span className="notes-qty">{quantity}</span>
                    <button 
                      className="notes-qty-btn"
                      onClick={() => onUpdateQuantity(key, 1)}
                    >
                      +
                    </button>
                    <button 
                      className="notes-remove-btn"
                      onClick={() => onRemoveItem(key)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedItems.size > 0 && (
          <div className="notes-footer">
            <div className="notes-total">
              <span>Voraussichtlicher Preis:</span>
              <span className="notes-total-price">{total.toFixed(2)} €</span>
            </div>
            <p className="notes-disclaimer">
              * Alle Preise sind unverbindlich und können im Restaurant abweichen. 
              Diese Übersicht dient nur zur Orientierung und stellt kein verbindliches Angebot dar.
            </p>
            
            {/* Contact Actions */}
            <div className="notes-contact-actions">
              {restaurant?.phone && (
                <a 
                  href={`tel:${restaurant.phone}`}
                  className="notes-contact-btn call"
                  onClick={(e) => { e.preventDefault(); handleCall(); }}
                >
                  📞 {restaurant.phone}
                </a>
              )}
              {restaurant?.googleMapsUrl && (
                <button 
                  className="notes-contact-btn route"
                  onClick={handleRoute}
                >
                  📍 Route planen
                </button>
              )}
            </div>

            <div className="notes-actions">
              {isWhatsAppAvailable && (
                <button className="notes-action-btn whatsapp" onClick={handleWhatsAppOrder}>
                  <span className="whatsapp-icon">📱</span> Per WhatsApp bestellen
                </button>
              )}
              <button className="notes-action-btn share" onClick={handleShare}>
                {shareStatus === 'copied' ? '✓ Kopiert!' : '📤 Teilen'}
              </button>
              <button className="notes-action-btn clear" onClick={onClearAll}>
                🗑️ Alle löschen
              </button>
            </div>
            
            {isWhatsAppAvailable && (
              <p className="notes-whatsapp-hint">
                Die Bestellung wird über WhatsApp direkt an das Restaurant gesendet. 
                Vertragspartner ist ausschließlich das Restaurant.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
