import type { LocationSection as LocationSectionConfig, RestaurantInfo } from '../../types/menu';
import '../../styles/sections/LocationSection.css';

interface LocationSectionProps {
  config: LocationSectionConfig;
  restaurant: RestaurantInfo | null;
}

export function LocationSection({ config, restaurant }: LocationSectionProps) {
  const handleRouteClick = () => {
    if (restaurant?.googleMapsUrl) {
      window.open(restaurant.googleMapsUrl, '_blank');
    }
  };

  return (
    <div className="location-section">
      <div className="location-container">
        <h2 className="location-title">{config.title || 'So finden Sie uns'}</h2>
        
        <div className="location-content">
          <div className="location-info">
            <div className="location-address">
              <h3>{restaurant?.name}</h3>
              <p>{restaurant?.address}</p>
              {restaurant?.phone && <p>Tel: {restaurant.phone}</p>}
            </div>
            
            {config.additionalInfo && (
              <div 
                className="location-additional"
                dangerouslySetInnerHTML={{ __html: config.additionalInfo.replace(/\n/g, '<br/>') }}
              />
            )}
            
            {restaurant?.googleMapsUrl && (
              <button className="location-route-btn" onClick={handleRouteClick}>
                Route planen
              </button>
            )}
          </div>

          {config.showMap && config.mapEmbedUrl && (
            <div className="location-map">
              <iframe
                src={config.mapEmbedUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Standort"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LocationSection;

