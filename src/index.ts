// Main App Component
export { default as App } from './App';

// Pages
export { MenuPage } from './pages/MenuPage';
export { HomePage } from './pages/HomePage';

// Components
export { Header } from './components/Header';
export { MenuCategory } from './components/MenuCategory';
export { MenuItem } from './components/MenuItem';
export { CategoryNav } from './components/CategoryNav';
export { NotesList } from './components/NotesList';
export { OpeningHoursModal } from './components/OpeningHoursModal';
export { VariantModal } from './components/VariantModal';
export { StatusBadge } from './components/StatusBadge';
export { LegalModal } from './components/LegalModal';
export { WhatsAppOrderModal } from './components/WhatsAppOrderModal';
export { WebsiteNav } from './components/WebsiteNav';

// Section Components
export { HeroSection } from './components/sections/HeroSection';
export { AboutSection } from './components/sections/AboutSection';
export { TeamSection } from './components/sections/TeamSection';
export { GallerySection } from './components/sections/GallerySection';
export { LocationSection } from './components/sections/LocationSection';
export { ContactSection } from './components/sections/ContactSection';
export { MenuSection } from './components/sections/MenuSection';

// Config Provider & Hooks
export { 
  ConfigProvider,
  useConfig,
  useFeatures,
  useRestaurant,
  useOpeningHours,
  useSpecialOffers,
  useVersion,
  useLegal,
  useWebsite
} from './config/ConfigProvider';

// Custom Hooks
export { useLocalStorage } from './hooks/useLocalStorage';
export { useOpeningStatus } from './hooks/useOpeningStatus';

// Utilities
export { 
  getSpecialPriceForItem, 
  getActiveSpecialOffer,
  isSpecialOfferActive,
  getTargetCategoryForOffer,
  getItemRangeForOffer
} from './utils/specialOffers';
export { 
  generateShareUrl, 
  parseShareUrl, 
  shareViaNavigator, 
  copyToClipboard,
  generateWhatsAppMessage,
  generateWhatsAppMessageWithDetails,
  generateWhatsAppUrl,
  isWhatsAppLikelyAvailable,
  openWhatsAppOrder
} from './utils/shareUtils';

// Types
export type {
  MenuItem as MenuItemType,
  MenuData,
  PriceVariants,
  RestaurantInfo,
  OpeningHours,
  FeatureFlags,
  ThemeConfig,
  HeaderStyle,
  SpecialOffer,
  SpecialOfferConfig,
  VersionInfo,
  ImprintInfo,
  PrivacyInfo,
  LegalInfo,
  AppConfig,
  // Website types
  WebsiteConfig,
  WebsiteNavigation,
  HeroSection as HeroSectionConfig,
  AboutSection as AboutSectionConfig,
  TeamSection as TeamSectionConfig,
  TeamMember,
  GallerySection as GallerySectionConfig,
  LocationSection as LocationSectionConfig,
  ContactSection as ContactSectionConfig
} from './types/menu';

