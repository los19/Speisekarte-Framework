import { useState } from 'react';
import type { MenuItem, PriceVariants } from '../types/menu';
import { useFeatures, useRestaurant } from '../config/ConfigProvider';
import { generateWhatsAppUrl } from '../utils/shareUtils';
import '../styles/WhatsAppOrderModal.css';

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: Map<string, { item: MenuItem; quantity: number; selectedVariant?: string; notes?: string }>;
}

export const WhatsAppOrderModal = ({ isOpen, onClose, selectedItems }: WhatsAppOrderModalProps) => {
  const features = useFeatures();
  const restaurant = useRestaurant();
  
  const [name, setName] = useState('');
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [street, setStreet] = useState('');
  const [zipCity, setZipCity] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const validateAndSubmit = () => {
    // Validate name
    if (!name.trim()) {
      setError('Bitte geben Sie Ihren Namen ein.');
      return;
    }

    // Validate address if delivery
    if (orderType === 'delivery') {
      if (!street.trim()) {
        setError('Bitte geben Sie Ihre Straße und Hausnummer ein.');
        return;
      }
      if (!zipCity.trim()) {
        setError('Bitte geben Sie PLZ und Ort ein.');
        return;
      }
    }

    setError('');

    // Build order details
    const orderDetails = {
      name: name.trim(),
      orderType,
      address: orderType === 'delivery' ? {
        street: street.trim(),
        zipCity: zipCity.trim()
      } : undefined,
      notes: notes.trim() || undefined
    };

    // Generate WhatsApp URL
    const whatsappUrl = generateWhatsAppUrl(
      restaurant?.whatsappNumber || '',
      restaurant?.name || '',
      selectedItems,
      orderDetails
    );

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Reset form and close
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setOrderType('pickup');
    setStreet('');
    setZipCity('');
    setNotes('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Calculate total
  const total = Array.from(selectedItems.values()).reduce((sum, { item, quantity, selectedVariant }) => {
    if (item.preis === null) return sum;
    
    let price: number;
    if (typeof item.preis === 'number') {
      price = item.preis;
    } else if (selectedVariant && (item.preis as PriceVariants)[selectedVariant]) {
      price = (item.preis as PriceVariants)[selectedVariant];
    } else {
      const prices = Object.values(item.preis as PriceVariants);
      price = prices[0] || 0;
    }
    
    return sum + (price * quantity);
  }, 0);

  return (
    <div className="whatsapp-modal-backdrop" onClick={handleBackdropClick}>
      <div className="whatsapp-modal">
        <div className="whatsapp-modal-header">
          <h3>📱 Per WhatsApp bestellen</h3>
          <button className="whatsapp-modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="whatsapp-modal-content">
          {/* Order Summary */}
          <div className="whatsapp-order-summary">
            <h4>Ihre Bestellung</h4>
            <div className="whatsapp-order-items">
              {Array.from(selectedItems.entries()).map(([key, { item, quantity, selectedVariant, notes: itemNotes }]) => (
                <div key={key} className="whatsapp-order-item">
                  <div className="item-main">
                    <span className="item-qty">{quantity}x</span>
                    <span className="item-name">
                      {item.nr && `#${item.nr} `}{item.gericht}
                      {selectedVariant && <span className="item-variant"> ({selectedVariant})</span>}
                    </span>
                  </div>
                  {itemNotes && (
                    <div className="item-notes">✏️ {itemNotes}</div>
                  )}
                </div>
              ))}
            </div>
            <div className="whatsapp-order-total">
              <span>Voraussichtlicher Preis:</span>
              <span className="total-price">{total.toFixed(2)} €</span>
            </div>
          </div>

          {/* Order Form */}
          <div className="whatsapp-order-form">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="customer-name">Name *</label>
              <input
                id="customer-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ihr Name"
                autoComplete="name"
              />
            </div>

            {/* Order Type - only if delivery is enabled */}
            {features.enableDelivery && (
              <div className="form-group">
                <label>Bestellart</label>
                <div className="order-type-buttons">
                  <button
                    type="button"
                    className={`order-type-btn ${orderType === 'pickup' ? 'active' : ''}`}
                    onClick={() => setOrderType('pickup')}
                  >
                    🏃 Abholung
                  </button>
                  <button
                    type="button"
                    className={`order-type-btn ${orderType === 'delivery' ? 'active' : ''}`}
                    onClick={() => setOrderType('delivery')}
                  >
                    🚗 Lieferung
                  </button>
                </div>
              </div>
            )}

            {/* Address - only for delivery */}
            {features.enableDelivery && orderType === 'delivery' && (
              <>
                <div className="form-group">
                  <label htmlFor="street">Straße & Hausnummer *</label>
                  <input
                    id="street"
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Musterstraße 123"
                    autoComplete="street-address"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zip-city">PLZ & Ort *</label>
                  <input
                    id="zip-city"
                    type="text"
                    value={zipCity}
                    onChange={(e) => setZipCity(e.target.value)}
                    placeholder="12345 Musterstadt"
                    autoComplete="postal-code"
                  />
                </div>
              </>
            )}

            {/* Additional Notes */}
            <div className="form-group">
              <label htmlFor="notes">Anmerkungen (optional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="z.B. Klingel defekt, bitte anrufen"
                rows={2}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="form-error">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <p className="whatsapp-disclaimer">
            Die Bestellung wird über WhatsApp direkt an das Restaurant gesendet. 
            Vertragspartner ist ausschließlich das Restaurant.
          </p>
        </div>

        <div className="whatsapp-modal-footer">
          <button className="whatsapp-cancel-btn" onClick={handleClose}>
            Abbrechen
          </button>
          <button className="whatsapp-submit-btn" onClick={validateAndSubmit}>
            📱 Bestellung senden
          </button>
        </div>
      </div>
    </div>
  );
};

