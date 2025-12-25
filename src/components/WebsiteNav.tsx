import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { WebsiteNavigation } from '../types/menu';
import '../styles/WebsiteNav.css';

interface WebsiteNavProps {
  sections: { id: string; title: string }[];
  onSectionClick: (sectionId: string) => void;
  isOnePager: boolean;
  navigation?: WebsiteNavigation;
  restaurantName?: string;
}

export function WebsiteNav({ 
  sections, 
  onSectionClick, 
  isOnePager,
  navigation,
  restaurantName 
}: WebsiteNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    if (isOnePager) {
      onSectionClick(sectionId);
    }
    setIsMobileMenuOpen(false);
  };

  const isMenuPage = location.pathname === '/speisekarte';

  return (
    <nav className={`website-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="website-nav-container">
        <div className="website-nav-brand">
          {isMenuPage ? (
            <Link to="/" className="nav-brand-link">
              {restaurantName || 'Restaurant'}
            </Link>
          ) : (
            <span className="nav-brand-text">{restaurantName || 'Restaurant'}</span>
          )}
        </div>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menü öffnen"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        <div className={`website-nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          {isOnePager ? (
            // One-pager: scroll to sections
            <>
              {sections.map((section) => (
                <button
                  key={section.id}
                  className="nav-link"
                  onClick={() => handleNavClick(section.id)}
                >
                  {section.title}
                </button>
              ))}
            </>
          ) : (
            // Multi-page: navigation links
            <>
              {navigation?.showHomeLink !== false && isMenuPage && (
                <Link 
                  to="/" 
                  className="nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {navigation?.homeLinkText || 'Startseite'}
                </Link>
              )}
              {navigation?.showMenuLink !== false && !isMenuPage && (
                <Link 
                  to="/speisekarte" 
                  className="nav-link nav-link-highlight"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {navigation?.menuLinkText || 'Speisekarte'}
                </Link>
              )}
              {/* Section links for scrolling on homepage */}
              {!isMenuPage && sections.filter(s => s.id !== 'menu').map((section) => (
                <button
                  key={section.id}
                  className="nav-link"
                  onClick={() => handleNavClick(section.id)}
                >
                  {section.title}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default WebsiteNav;

