// Main App Component
export { default as App } from './App';

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

// Config Provider & Hooks
export { 
  ConfigProvider,
  useConfig,
  useFeatures,
  useRestaurant,
  useOpeningHours,
  useSpecialOffers,
  useVersion,
  useLegal
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
  generateWhatsAppUrl
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
  SpecialOffer,
  SpecialOfferConfig,
  VersionInfo,
  ImprintInfo,
  PrivacyInfo,
  LegalInfo,
  AppConfig
} from './types/menu';

