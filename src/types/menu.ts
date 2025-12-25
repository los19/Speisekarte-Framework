// Unified Menu Types for all restaurants

export interface PriceVariants {
  [size: string]: number;
}

export interface SpecialOfferConfig {
  dayIndex: number; // 0 = Sunday, 1 = Monday, etc.
  targetCategory?: string;
  itemNumbers?: { from: number; to: number };
}

export interface MenuItem {
  nr?: number | string | null;
  gericht: string;
  preis: number | PriceVariants | null;
  specialOffer?: SpecialOfferConfig;
}

export interface MenuData {
  [category: string]: MenuItem[];
}

export interface RestaurantInfo {
  name: string;
  subtitle?: string;
  address: string;
  phone: string;
  whatsappNumber?: string; // E.164 format without + (e.g., "491701234567")
  googleMapsUrl: string;
  footer?: {
    tagline?: string;
  };
  cartStorageKey: string;
}

export interface OpeningHours {
  day: string;
  hours: string;
  isClosed?: boolean;
}

// Feature Flags
export interface FeatureFlags {
  enablePriceVariants: boolean;
  enableSpecialOffers: boolean;
  enableCategoryNavigation: boolean;
  enableWhatsAppOrder: boolean;
  enableDelivery: boolean; // If true, delivery option is available and address will be requested
  ui: {
    cartIcon: 'cart' | 'clipboard';
    showHeaderSubtitle: boolean;
  };
}

// Theme Configuration
export interface HeaderStyle {
  type: 'gradient' | 'image' | 'solid';
  image?: string; // Path to header background image (for type 'image')
  showDots?: boolean; // Show decorative dot pattern
  showGradientOverlay?: boolean; // Show gradient overlay on top
}

export interface ThemeConfig {
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    accent: string;
    accentLight?: string;
    accentDark?: string;
    bgMain: string;
    bgLight: string;
    bgDark: string;
    bgCard: string;
    textDark: string;
    textMedium: string;
    textLight: string;
    borderColor: string;
    borderDark: string;
    success: string;
    successLight: string;
  };
  fonts?: {
    primary?: string;
  };
  header?: HeaderStyle;
}

// Special Offers (loaded from config)
export interface SpecialOffer {
  dayAbbr: string;
  dayIndex: number;
  itemNumbers?: { from: number; to: number };
  specialPrice: number;
  targetCategory?: string;
  description: string;
}

// Version Info
export interface VersionInfo {
  version: string;
  buildDate?: string;
}

// Legal Information
export interface ImprintInfo {
  companyName: string;
  owner?: string;
  address: string;
  zipCity: string;
  country?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  tradeRegister?: string | null;
  responsibleContent?: string;
}

export interface PrivacyInfo {
  lastUpdated: string;
  customSections?: Array<{
    title: string;
    content: string;
  }>;
}

export interface LegalInfo {
  imprint: ImprintInfo;
  privacy: PrivacyInfo;
}

// Complete App Configuration
export interface AppConfig {
  restaurant: RestaurantInfo;
  openingHours: OpeningHours[];
  features: FeatureFlags;
  theme: ThemeConfig;
  specialOffers: SpecialOffer[];
  version: VersionInfo;
  legal?: LegalInfo;
}

