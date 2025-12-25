import { useState } from 'react';
import type { GallerySection as GallerySectionConfig } from '../../types/menu';
import '../../styles/sections/GallerySection.css';

interface GallerySectionProps {
  config: GallerySectionConfig;
}

// Normalize image data to always have src, alt, caption
interface NormalizedImage {
  src: string;
  alt: string;
  caption?: string;
}

function normalizeImages(images: GallerySectionConfig['images']): NormalizedImage[] {
  if (!images || images.length === 0) return [];
  
  return images.map((img, index) => {
    if (typeof img === 'string') {
      return { src: img, alt: `Bild ${index + 1}` };
    }
    return {
      src: img.src,
      alt: img.alt || `Bild ${index + 1}`,
      caption: img.caption,
    };
  });
}

export function GallerySection({ config }: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  
  const images = normalizeImages(config.images);
  
  if (images.length === 0) {
    return null;
  }

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = '';
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    const newIndex = direction === 'next'
      ? (selectedImage + 1) % images.length
      : (selectedImage - 1 + images.length) % images.length;
    setSelectedImage(newIndex);
  };

  return (
    <div className="gallery-section">
      <div className="gallery-container">
        <h2 className="gallery-title">{config.title || 'Galerie'}</h2>
        <div className="gallery-grid">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="gallery-item"
              onClick={() => openLightbox(index)}
            >
              <img src={image.src} alt={image.alt} />
              {image.caption && <span className="gallery-caption">{image.caption}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>×</button>
          <button 
            className="lightbox-nav lightbox-prev"
            onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
          >
            ‹
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={images[selectedImage].src} 
              alt={images[selectedImage].alt} 
            />
            {images[selectedImage].caption && (
              <p className="lightbox-caption">{images[selectedImage].caption}</p>
            )}
          </div>
          <button 
            className="lightbox-nav lightbox-next"
            onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default GallerySection;

