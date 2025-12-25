import { useRef } from 'react';
import { useConfig, useFeatures, useRestaurant, useWebsite, useVersion } from '../config/ConfigProvider';
import { WebsiteNav } from '../components/WebsiteNav';
import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import { TeamSection } from '../components/sections/TeamSection';
import { GallerySection } from '../components/sections/GallerySection';
import { LocationSection } from '../components/sections/LocationSection';
import { ContactSection } from '../components/sections/ContactSection';
import { MenuSection } from '../components/sections/MenuSection';
import { LegalModal } from '../components/LegalModal';
import { useState } from 'react';
import '../styles/HomePage.css';

export function HomePage() {
  const { isLoading, error } = useConfig();
  const features = useFeatures();
  const restaurant = useRestaurant();
  const website = useWebsite();
  const version = useVersion();
  
  const [legalModalType, setLegalModalType] = useState<'imprint' | 'privacy' | null>(null);
  
  // Section refs for one-pager navigation
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  
  const setSectionRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  const scrollToSection = (sectionId: string) => {
    const section = sectionRefs.current[sectionId];
    if (section) {
      const headerHeight = 80;
      const elementPosition = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerHeight,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <p>Wird geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Fehler beim Laden</h2>
        <p>{error}</p>
      </div>
    );
  }

  const sections = website?.sections || {};
  const isOnePager = features.websiteMode === 'onePager';

  // Build list of active sections for navigation
  const activeSections: { id: string; title: string }[] = [];
  if (sections.hero?.enabled) activeSections.push({ id: 'hero', title: 'Start' });
  if (sections.about?.enabled) activeSections.push({ id: 'about', title: sections.about.title || 'Über uns' });
  if (sections.team?.enabled) activeSections.push({ id: 'team', title: sections.team.title || 'Team' });
  if (sections.gallery?.enabled) activeSections.push({ id: 'gallery', title: sections.gallery.title || 'Galerie' });
  if (isOnePager) activeSections.push({ id: 'menu', title: 'Speisekarte' });
  if (sections.location?.enabled) activeSections.push({ id: 'location', title: sections.location.title || 'Anfahrt' });
  if (sections.contact?.enabled) activeSections.push({ id: 'contact', title: sections.contact.title || 'Kontakt' });

  return (
    <div className="home-page">
      <WebsiteNav 
        sections={activeSections}
        onSectionClick={scrollToSection}
        isOnePager={isOnePager}
        navigation={website?.navigation}
        restaurantName={restaurant?.name}
      />

      <main className="home-content">
        {sections.hero?.enabled && (
          <section ref={setSectionRef('hero')} id="hero">
            <HeroSection config={sections.hero} restaurantName={restaurant?.name} />
          </section>
        )}

        {sections.about?.enabled && (
          <section ref={setSectionRef('about')} id="about">
            <AboutSection config={sections.about} />
          </section>
        )}

        {sections.team?.enabled && (
          <section ref={setSectionRef('team')} id="team">
            <TeamSection config={sections.team} />
          </section>
        )}

        {sections.gallery?.enabled && (
          <section ref={setSectionRef('gallery')} id="gallery">
            <GallerySection config={sections.gallery} />
          </section>
        )}

        {isOnePager && (
          <section ref={setSectionRef('menu')} id="menu">
            <MenuSection />
          </section>
        )}

        {sections.location?.enabled && (
          <section ref={setSectionRef('location')} id="location">
            <LocationSection config={sections.location} restaurant={restaurant} />
          </section>
        )}

        {sections.contact?.enabled && (
          <section ref={setSectionRef('contact')} id="contact">
            <ContactSection config={sections.contact} restaurant={restaurant} />
          </section>
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <h3>{restaurant?.name}</h3>
          {restaurant?.subtitle && (
            <p className="footer-subtitle">{restaurant.subtitle}</p>
          )}
          <p>{restaurant?.address}</p>
          <p>Tel: {restaurant?.phone}</p>
          {restaurant?.footer?.tagline && (
            <p className="footer-tagline">{restaurant.footer.tagline}</p>
          )}
          <div className="footer-legal-links">
            <button onClick={() => setLegalModalType('imprint')}>Impressum</button>
            <span className="footer-divider">|</span>
            <button onClick={() => setLegalModalType('privacy')}>Datenschutz</button>
          </div>
          <p className="footer-version">v{version.version}</p>
        </div>
      </footer>

      <LegalModal
        isOpen={legalModalType !== null}
        onClose={() => setLegalModalType(null)}
        type={legalModalType || 'imprint'}
      />
    </div>
  );
}

export default HomePage;

