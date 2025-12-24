import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppConfig, MenuData, FeatureFlags, ThemeConfig, RestaurantInfo, OpeningHours, SpecialOffer, VersionInfo, LegalInfo } from '../types/menu';

interface ConfigContextType {
  config: AppConfig | null;
  menu: MenuData | null;
  isLoading: boolean;
  error: string | null;
}

const ConfigContext = createContext<ConfigContextType>({
  config: null,
  menu: null,
  isLoading: true,
  error: null,
});

// Default configurations
const defaultFeatures: FeatureFlags = {
  enablePriceVariants: true,
  enableSpecialOffers: false,
  enableCategoryNavigation: true,
  enableWhatsAppOrder: false,
  ui: {
    cartIcon: 'cart',
    showHeaderSubtitle: true,
  },
};

const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#8B4513',
    primaryDark: '#6B3410',
    primaryLight: '#A0522D',
    accent: '#D2691E',
    accentLight: '#CD853F',
    bgMain: '#F5E6D3',
    bgLight: '#FDF8F3',
    bgDark: '#E8D4BE',
    bgCard: '#FFFAF5',
    textDark: '#3D2914',
    textMedium: '#5C4033',
    textLight: '#8B7355',
    borderColor: '#D4C4A8',
    borderDark: '#B8A88C',
    success: '#4A7C23',
    successLight: '#6B9B3A',
  },
};

// Apply theme to CSS variables
const applyTheme = (theme: ThemeConfig) => {
  const root = document.documentElement;
  
  root.style.setProperty('--primary', theme.colors.primary);
  root.style.setProperty('--primary-dark', theme.colors.primaryDark);
  root.style.setProperty('--primary-light', theme.colors.primaryLight);
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--accent-light', theme.colors.accentLight || theme.colors.accent);
  root.style.setProperty('--accent-dark', theme.colors.accentDark || theme.colors.primaryDark);
  root.style.setProperty('--bg-main', theme.colors.bgMain);
  root.style.setProperty('--bg-light', theme.colors.bgLight);
  root.style.setProperty('--bg-dark', theme.colors.bgDark);
  root.style.setProperty('--bg-card', theme.colors.bgCard);
  root.style.setProperty('--text-dark', theme.colors.textDark);
  root.style.setProperty('--text-medium', theme.colors.textMedium);
  root.style.setProperty('--text-light', theme.colors.textLight);
  root.style.setProperty('--border-color', theme.colors.borderColor);
  root.style.setProperty('--border-dark', theme.colors.borderDark);
  root.style.setProperty('--success', theme.colors.success);
  root.style.setProperty('--success-light', theme.colors.successLight);
  
  if (theme.fonts?.primary) {
    root.style.setProperty('--font-primary', theme.fonts.primary);
  }
};

async function loadJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(path);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [menu, setMenu] = useState<MenuData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Load all config files in parallel
        const [restaurant, openingHours, features, theme, specialOffers, versionInfo, legalInfo, menuData] = await Promise.all([
          loadJson<RestaurantInfo>('/config/restaurant.json'),
          loadJson<OpeningHours[]>('/config/openingHours.json'),
          loadJson<FeatureFlags>('/config/features.json'),
          loadJson<ThemeConfig>('/config/theme.json'),
          loadJson<SpecialOffer[]>('/config/specialOffers.json'),
          loadJson<VersionInfo>('/config/version.json'),
          loadJson<LegalInfo>('/config/legal.json'),
          loadJson<MenuData>('/menu.json'),
        ]);

        if (!restaurant) {
          throw new Error('Restaurant configuration not found');
        }

        if (!menuData) {
          throw new Error('Menu data not found');
        }

        const appConfig: AppConfig = {
          restaurant,
          openingHours: openingHours || [],
          features: features ? { ...defaultFeatures, ...features, ui: { ...defaultFeatures.ui, ...features.ui } } : defaultFeatures,
          theme: theme ? { ...defaultTheme, colors: { ...defaultTheme.colors, ...theme.colors } } : defaultTheme,
          specialOffers: specialOffers || [],
          version: versionInfo || { version: 'dev' },
          legal: legalInfo || undefined,
        };

        // Apply theme to CSS
        applyTheme(appConfig.theme);

        setConfig(appConfig);
        setMenu(menuData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load configuration');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, menu, isLoading, error }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

// Helper hooks for specific config parts
export const useFeatures = (): FeatureFlags => {
  const { config } = useConfig();
  return config?.features || defaultFeatures;
};

export const useRestaurant = (): RestaurantInfo | null => {
  const { config } = useConfig();
  return config?.restaurant || null;
};

export const useOpeningHours = (): OpeningHours[] => {
  const { config } = useConfig();
  return config?.openingHours || [];
};

export const useSpecialOffers = (): SpecialOffer[] => {
  const { config } = useConfig();
  return config?.specialOffers || [];
};

export const useVersion = (): VersionInfo => {
  const { config } = useConfig();
  return config?.version || { version: 'dev' };
};

export const useLegal = (): LegalInfo | null => {
  const { config } = useConfig();
  return config?.legal || null;
};

