import { Link } from 'react-router-dom';
import { useFeatures } from '../../config/ConfigProvider';
import type { HeroSection as HeroSectionConfig } from '../../types/menu';
import '../../styles/sections/HeroSection.css';

interface HeroSectionProps {
  config: HeroSectionConfig;
  restaurantName?: string;
}

export function HeroSection({ config, restaurantName }: HeroSectionProps) {
  const features = useFeatures();
  const isMultiPage = features.websiteMode === 'multiPage';

  const backgroundStyle = config.image 
    ? { backgroundImage: `url(${config.image})` }
    : {};

  return (
    <div className="hero-section" style={backgroundStyle}>
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">
          {config.title || `Willkommen bei ${restaurantName || 'uns'}`}
        </h1>
        {config.subtitle && (
          <p className="hero-subtitle">{config.subtitle}</p>
        )}
        {config.ctaText && (
          isMultiPage ? (
            <Link to={config.ctaLink || '/speisekarte'} className="hero-cta">
              {config.ctaText}
            </Link>
          ) : (
            <a href={config.ctaLink || '#menu'} className="hero-cta">
              {config.ctaText}
            </a>
          )
        )}
      </div>
    </div>
  );
}

export default HeroSection;

