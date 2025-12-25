import { useState } from 'react';
import type { AboutSection as AboutSectionConfig } from '../../types/menu';
import '../../styles/sections/AboutSection.css';

interface AboutSectionProps {
  config: AboutSectionConfig;
}

export function AboutSection({ config }: AboutSectionProps) {
  const imagePosition = config.imagePosition || 'right';
  const [imageError, setImageError] = useState(false);

  const showImage = config.image && !imageError;

  return (
    <div className={`about-section ${showImage && imagePosition === 'left' ? 'image-left' : ''} ${showImage ? 'image-right' : 'no-image'}`}>
      <div className="about-container">
        {showImage && (
          <div className="about-image">
            <img 
              src={config.image} 
              alt={config.title || 'Über uns'} 
              onError={() => setImageError(true)}
            />
          </div>
        )}
        <div className="about-content">
          <h2 className="about-title">{config.title || 'Über uns'}</h2>
          {config.content && (
            <div 
              className="about-text"
              dangerouslySetInnerHTML={{ __html: config.content.replace(/\n/g, '<br/>') }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AboutSection;

