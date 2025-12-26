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
  email?: string;
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
  enableCart: boolean; // If false, shopping cart functionality is hidden
  enableWebsite: boolean; // If true, enables the website mode with homepage
  websiteMode: 'multiPage' | 'onePager'; // Routing mode for website
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

// Website Configuration - Sections
export interface HeroSection {
  enabled: boolean;
  image?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface AboutSection {
  enabled: boolean;
  title?: string;
  content?: string;
  image?: string;
  imagePosition?: 'left' | 'right';
}

export interface TeamMember {
  name: string;
  role?: string;
  image?: string;
  description?: string;
}

export interface TeamSection {
  enabled: boolean;
  title?: string;
  members: TeamMember[];
}

export interface GallerySection {
  enabled: boolean;
  title?: string;
  images: Array<string | {
    src: string;
    alt?: string;
    caption?: string;
  }>;
}

export interface LocationSection {
  enabled: boolean;
  title?: string;
  showMap: boolean;
  mapEmbedUrl?: string;
  additionalInfo?: string;
}

export interface ContactSection {
  enabled: boolean;
  title?: string;
  email?: string; // Override restaurant email
  showForm: boolean;
  formEndpoint?: string;
  showPhone: boolean;
  showEmail: boolean;
  showAddress: boolean;
  showRoute?: boolean; // Show "Route planen" tile with Google Maps link
}

export interface WebsiteNavigation {
  showMenuLink: boolean;
  menuLinkText?: string;
  showHomeLink?: boolean;
  homeLinkText?: string;
}

export interface WebsiteConfig {
  sections: {
    hero?: HeroSection;
    about?: AboutSection;
    team?: TeamSection;
    gallery?: GallerySection;
    location?: LocationSection;
    contact?: ContactSection;
  };
  navigation: WebsiteNavigation;
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
  website?: WebsiteConfig;
}

