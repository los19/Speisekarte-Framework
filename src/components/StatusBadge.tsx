import { useOpeningStatus } from '../hooks/useOpeningStatus';
import '../styles/StatusBadge.css';

interface StatusBadgeProps {
  onOpenHoursClick: () => void;
}

export const StatusBadge = ({ onOpenHoursClick }: StatusBadgeProps) => {
  const { isOpen, countdown } = useOpeningStatus();

  return (
    <button 
      className={`status-badge ${isOpen ? 'open' : 'closed'}`}
      onClick={onOpenHoursClick}
      type="button"
      aria-label="Öffnungszeiten anzeigen"
    >
      <span className="status-indicator" />
      <span className="status-text">
        {isOpen ? 'Geöffnet' : 'Geschlossen'}
      </span>
      {countdown && (
        <span className="status-countdown">{countdown}</span>
      )}
    </button>
  );
};
