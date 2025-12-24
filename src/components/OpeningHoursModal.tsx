import { useOpeningHours, useRestaurant } from '../config/ConfigProvider';
import '../styles/OpeningHoursModal.css';

interface OpeningHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS_ORDER = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

export const OpeningHoursModal = ({ isOpen, onClose }: OpeningHoursModalProps) => {
  const openingHours = useOpeningHours();
  const restaurant = useRestaurant();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const today = new Date().toLocaleDateString('de-DE', { weekday: 'long' });

  // Sort hours by day order
  const sortedHours = [...openingHours].sort((a, b) => {
    return DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day);
  });

  return (
    <div className="hours-modal-backdrop" onClick={handleBackdropClick}>
      <div className="hours-modal">
        <button className="hours-modal-close" onClick={onClose}>
          ×
        </button>
        <h3 className="hours-modal-title">Öffnungszeiten</h3>
        <div className="hours-list">
          {sortedHours.map((dayInfo) => (
            <div 
              key={dayInfo.day} 
              className={`hours-row ${dayInfo.day === today ? 'today' : ''} ${dayInfo.isClosed ? 'closed' : ''}`}
            >
              <span className="hours-day">{dayInfo.day}</span>
              <span className="hours-time">{dayInfo.hours}</span>
            </div>
          ))}
        </div>
        {restaurant && (
          <div className="hours-modal-contact">
            <p className="contact-address">{restaurant.address}</p>
            <a href={`tel:${restaurant.phone}`} className="contact-phone">
              📞 {restaurant.phone}
            </a>
            <a 
              href={restaurant.googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-maps"
            >
              📍 Route planen
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

