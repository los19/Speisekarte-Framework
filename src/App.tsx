import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { MenuCategory } from './components/MenuCategory';
import { CategoryNav } from './components/CategoryNav';
import { NotesList } from './components/NotesList';
import { OpeningHoursModal } from './components/OpeningHoursModal';
import { VariantModal } from './components/VariantModal';
import { LegalModal } from './components/LegalModal';
import { useConfig, useFeatures, useRestaurant, useSpecialOffers, useVersion } from './config/ConfigProvider';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getSpecialPriceForItem } from './utils/specialOffers';
import type { MenuData, MenuItem, PriceVariants } from './types/menu';
import './styles/index.css';

interface SelectedItemsMap {
  [key: string]: number;
}

interface PendingVariantSelection {
  category: string;
  item: MenuItem;
}

function AppContent() {
  const { menu, isLoading, error } = useConfig();
  const features = useFeatures();
  const restaurant = useRestaurant();
  const specialOffers = useSpecialOffers();
  const version = useVersion();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useLocalStorage<SelectedItemsMap>(
    restaurant?.cartStorageKey || 'menu-cart', 
    {}
  );
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [pendingVariant, setPendingVariant] = useState<PendingVariantSelection | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [legalModalType, setLegalModalType] = useState<'imprint' | 'privacy' | null>(null);
  
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const typedMenuData = menu as MenuData;
  const categories = typedMenuData ? Object.keys(typedMenuData) : [];

  // Load cart from URL parameter if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let cartParam = urlParams.get('cart');
    
    if (cartParam) {
      try {
        cartParam = cartParam.split(' ')[0];
        let base64 = cartParam.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        
        const json = decodeURIComponent(escape(atob(base64)));
        const shareData = JSON.parse(json);
        
        if (shareData.items && typeof shareData.items === 'object') {
          setSelectedItems(shareData.items);
          window.history.replaceState({}, '', window.location.pathname);
        }
      } catch (err) {
        console.error('Failed to load shared cart:', err);
      }
    } else {
      if (Array.isArray(selectedItems) || typeof selectedItems !== 'object') {
        setSelectedItems({});
      }
    }
  }, [setSelectedItems]);

  const getItemKey = (category: string, item: MenuItem, variant?: string) => {
    if (variant) {
      return `${category}|||${item.gericht}|||${variant}`;
    }
    return `${category}|||${item.gericht}`;
  };

  const filteredMenu = useMemo(() => {
    if (!typedMenuData) return {};
    if (!searchQuery.trim()) {
      return typedMenuData;
    }

    const query = searchQuery.toLowerCase();
    const filtered: MenuData = {};

    categories.forEach(category => {
      const filteredItems = typedMenuData[category].filter(item => {
        const nameMatch = item.gericht.toLowerCase().includes(query);
        const numberMatch = item.nr ? String(item.nr).toLowerCase().includes(query) : false;
        return nameMatch || numberMatch;
      });
      
      if (filteredItems.length > 0) {
        filtered[category] = filteredItems;
      }
    });

    return filtered;
  }, [searchQuery, typedMenuData, categories]);

  const filteredCategories = Object.keys(filteredMenu);

  const handleNavigateToCategory = useCallback((targetCategory: string) => {
    setSearchQuery('');
    
    setTimeout(() => {
      const categoryEl = categoryRefs.current.get(targetCategory);
      if (categoryEl) {
        const headerHeight = window.innerWidth <= 768 ? 80 : 200;
        const elementPosition = categoryEl.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - headerHeight - 20,
          behavior: 'smooth'
        });
      }
    }, 100);
  }, []);

  const handleUpdateQuantity = (categoryIndex: number, itemIndex: number, change: number) => {
    const category = filteredCategories[categoryIndex];
    const item = filteredMenu[category][itemIndex];
    const itemKey = getItemKey(category, item);
    
    setSelectedItems(prev => {
      const currentQuantity = prev[itemKey] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      
      const newItems = { ...prev };
      if (newQuantity === 0) {
        delete newItems[itemKey];
      } else {
        newItems[itemKey] = newQuantity;
      }
      return newItems;
    });
  };

  const handleSelectVariant = (category: string, item: MenuItem) => {
    setPendingVariant({ category, item });
  };

  const handleVariantChosen = (variantKey: string, _price: number) => {
    if (!pendingVariant) return;
    
    const itemKey = getItemKey(pendingVariant.category, pendingVariant.item, variantKey);
    
    setSelectedItems(prev => {
      const currentQuantity = prev[itemKey] || 0;
      return {
        ...prev,
        [itemKey]: currentQuantity + 1,
      };
    });
    
    setPendingVariant(null);
  };

  const selectedItemsMap = useMemo(() => {
    const map = new Map<string, { category: string; item: MenuItem; quantity: number; variant?: string; variantPrice?: number }>();
    
    if (!typedMenuData) return map;
    
    Object.entries(selectedItems).forEach(([key, quantity]) => {
      const parts = key.split('|||');
      const category = parts[0];
      const gerichtName = parts[1];
      const variant = parts[2];
      
      if (typedMenuData[category]) {
        const item = typedMenuData[category].find(i => i.gericht === gerichtName);
        if (item) {
          let variantPrice: number | undefined;
          
          if (features.enableSpecialOffers) {
            const specialPrice = getSpecialPriceForItem(specialOffers, item.nr, category);
            if (specialPrice !== null) {
              variantPrice = specialPrice;
            }
          }
          
          if (variantPrice === undefined && variant && typeof item.preis === 'object' && item.preis !== null) {
            variantPrice = (item.preis as PriceVariants)[variant];
          }
          
          map.set(key, { category, item, quantity, variant, variantPrice });
        }
      }
    });
    
    return map;
  }, [selectedItems, typedMenuData, features.enableSpecialOffers, specialOffers]);

  const handleRemoveItem = (key: string) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      delete newItems[key];
      return newItems;
    });
  };

  const handleUpdateItemQuantity = (key: string, change: number) => {
    setSelectedItems(prev => {
      const currentQuantity = prev[key] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      
      const newItems = { ...prev };
      if (newQuantity === 0) {
        delete newItems[key];
      } else {
        newItems[key] = newQuantity;
      }
      return newItems;
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Möchtest du wirklich alle ausgewählten Gerichte löschen?')) {
      setSelectedItems({});
      setIsNotesOpen(false);
    }
  };

  const totalItemCount = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
  }, [selectedItems]);

  const setCategoryRef = useCallback((category: string) => (el: HTMLDivElement | null) => {
    if (el) {
      categoryRefs.current.set(category, el);
    }
  }, []);

  // Track active category on scroll (for CategoryNav)
  useEffect(() => {
    if (!features.enableCategoryNavigation) return;
    
    const handleScroll = () => {
      const headerOffset = window.innerWidth <= 768 ? 150 : 300;
      
      let currentCategory: string | null = null;
      
      for (const [category, ref] of categoryRefs.current.entries()) {
        const rect = ref.getBoundingClientRect();
        if (rect.top <= headerOffset && rect.bottom > headerOffset) {
          currentCategory = category;
          break;
        }
      }
      
      if (currentCategory && currentCategory !== activeCategory) {
        setActiveCategory(currentCategory);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [features.enableCategoryNavigation, activeCategory]);

  // Set initial active category
  useEffect(() => {
    if (filteredCategories.length > 0 && !activeCategory) {
      setActiveCategory(filteredCategories[0]);
    }
  }, [filteredCategories, activeCategory]);

  const handleCategoryNavClick = useCallback((category: string) => {
    setActiveCategory(category);
    handleNavigateToCategory(category);
  }, [handleNavigateToCategory]);

  if (isLoading) {
    return (
      <div className="app-loading">
        <p>Speisekarte wird geladen...</p>
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

  return (
    <div className="app">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenHoursClick={() => setIsHoursModalOpen(true)}
        selectedCount={totalItemCount}
        onNotesClick={() => setIsNotesOpen(true)}
      />

      <main className="main-content">
        {features.enableCategoryNavigation && filteredCategories.length > 0 && !searchQuery && (
          <CategoryNav
            categories={categories}
            activeCategory={activeCategory}
            onCategoryClick={handleCategoryNavClick}
          />
        )}

        {filteredCategories.length === 0 ? (
          <div className="no-results">
            <p>Keine Gerichte gefunden für "{searchQuery}"</p>
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              Suche zurücksetzen
            </button>
          </div>
        ) : (
          filteredCategories.map((category, index) => (
            <MenuCategory
              key={category}
              category={category}
              items={filteredMenu[category]}
              selectedItems={selectedItems}
              onUpdateQuantity={handleUpdateQuantity}
              onSelectVariant={handleSelectVariant}
              onNavigateToCategory={features.enableCategoryNavigation ? handleNavigateToCategory : undefined}
              categoryIndex={index}
              categoryRef={setCategoryRef(category)}
            />
          ))
        )}
      </main>

      <NotesList
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        selectedItems={selectedItemsMap}
        selectedItemsRaw={selectedItems}
        onClearAll={handleClearAll}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateItemQuantity}
      />

      <OpeningHoursModal
        isOpen={isHoursModalOpen}
        onClose={() => setIsHoursModalOpen(false)}
      />

      {features.enablePriceVariants && pendingVariant && pendingVariant.item.preis && typeof pendingVariant.item.preis === 'object' && (
        <VariantModal
          isOpen={true}
          onClose={() => setPendingVariant(null)}
          itemName={pendingVariant.item.gericht}
          itemNumber={pendingVariant.item.nr}
          variants={pendingVariant.item.preis as PriceVariants}
          onSelectVariant={handleVariantChosen}
        />
      )}

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

export default AppContent;
