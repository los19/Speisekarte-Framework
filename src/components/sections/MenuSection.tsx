import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { MenuCategory } from '../MenuCategory';
import { CategoryNav } from '../CategoryNav';
import { NotesList } from '../NotesList';
import { VariantModal } from '../VariantModal';
import { WhatsAppOrderModal } from '../WhatsAppOrderModal';
import { useConfig, useFeatures, useRestaurant, useSpecialOffers } from '../../config/ConfigProvider';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getSpecialPriceForItem } from '../../utils/specialOffers';
import type { MenuData, MenuItem, PriceVariants } from '../../types/menu';
import '../../styles/sections/MenuSection.css';

interface SelectedItemsMap {
  [key: string]: number;
}

interface ItemNotesMap {
  [key: string]: string;
}

interface PendingVariantSelection {
  category: string;
  item: MenuItem;
}

export function MenuSection() {
  const { menu } = useConfig();
  const features = useFeatures();
  const restaurant = useRestaurant();
  const specialOffers = useSpecialOffers();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useLocalStorage<SelectedItemsMap>(
    restaurant?.cartStorageKey || 'menu-cart', 
    {}
  );
  const [itemNotes, setItemNotes] = useLocalStorage<ItemNotesMap>(
    (restaurant?.cartStorageKey || 'menu-cart') + '-notes',
    {}
  );
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [pendingVariant, setPendingVariant] = useState<PendingVariantSelection | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  
  const categoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const typedMenuData = menu as MenuData;
  const categories = typedMenuData ? Object.keys(typedMenuData) : [];

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
        const headerHeight = 100;
        const elementPosition = categoryEl.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - headerHeight,
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
    const map = new Map<string, { category: string; item: MenuItem; quantity: number; variant?: string; variantPrice?: number; notes?: string }>();
    
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
          
          const notes = itemNotes[key] || undefined;
          map.set(key, { category, item, quantity, variant, variantPrice, notes });
        }
      }
    });
    
    return map;
  }, [selectedItems, typedMenuData, features.enableSpecialOffers, specialOffers, itemNotes]);

  const whatsAppItemsMap = useMemo(() => {
    const map = new Map<string, { item: MenuItem; quantity: number; selectedVariant?: string; notes?: string }>();
    selectedItemsMap.forEach((value, key) => {
      map.set(key, {
        item: value.item,
        quantity: value.quantity,
        selectedVariant: value.variant,
        notes: value.notes,
      });
    });
    return map;
  }, [selectedItemsMap]);

  const handleRemoveItem = (key: string) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      delete newItems[key];
      return newItems;
    });
    setItemNotes(prev => {
      const newNotes = { ...prev };
      delete newNotes[key];
      return newNotes;
    });
  };

  const handleUpdateItemNotes = (key: string, notes: string) => {
    setItemNotes(prev => {
      if (notes.trim() === '') {
        const newNotes = { ...prev };
        delete newNotes[key];
        return newNotes;
      }
      return { ...prev, [key]: notes };
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
      setItemNotes({});
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

  useEffect(() => {
    if (!features.enableCategoryNavigation) return;
    
    const handleScroll = () => {
      const headerOffset = 200;
      
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
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [features.enableCategoryNavigation, activeCategory]);

  useEffect(() => {
    if (filteredCategories.length > 0 && !activeCategory) {
      setActiveCategory(filteredCategories[0]);
    }
  }, [filteredCategories, activeCategory]);

  const handleCategoryNavClick = useCallback((category: string) => {
    setActiveCategory(category);
    handleNavigateToCategory(category);
  }, [handleNavigateToCategory]);

  if (!menu) {
    return (
      <div className="menu-section-empty">
        <p>Speisekarte wird geladen...</p>
      </div>
    );
  }

  return (
    <div className="menu-section">
      <div className="menu-section-header">
        <h2 className="menu-section-title">Unsere Speisekarte</h2>
        
        {/* Search */}
        <div className="menu-search">
          <input
            type="text"
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="menu-search-input"
          />
        </div>

        {/* Cart Button */}
        {features.enableCart !== false && totalItemCount > 0 && (
          <button className="menu-cart-button" onClick={() => setIsNotesOpen(true)}>
            🛒 Warenkorb ({totalItemCount})
          </button>
        )}
      </div>

      {features.enableCategoryNavigation && filteredCategories.length > 0 && !searchQuery && (
        <CategoryNav
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={handleCategoryNavClick}
        />
      )}

      <div className="menu-section-content">
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
              selectedItems={features.enableCart !== false ? selectedItems : {}}
              onUpdateQuantity={features.enableCart !== false ? handleUpdateQuantity : () => {}}
              onSelectVariant={features.enableCart !== false ? handleSelectVariant : () => {}}
              onNavigateToCategory={features.enableCategoryNavigation ? handleNavigateToCategory : undefined}
              categoryIndex={index}
              categoryRef={setCategoryRef(category)}
              hideQuantityControls={features.enableCart === false}
            />
          ))
        )}
      </div>

      {features.enableCart !== false && (
        <NotesList
          isOpen={isNotesOpen}
          onClose={() => setIsNotesOpen(false)}
          selectedItems={selectedItemsMap}
          selectedItemsRaw={selectedItems}
          onClearAll={handleClearAll}
          onRemoveItem={handleRemoveItem}
          onUpdateQuantity={handleUpdateItemQuantity}
          onUpdateNotes={handleUpdateItemNotes}
          onWhatsAppOrder={() => {
            setIsNotesOpen(false);
            setIsWhatsAppModalOpen(true);
          }}
        />
      )}

      {features.enableCart !== false && features.enablePriceVariants && pendingVariant && pendingVariant.item.preis && typeof pendingVariant.item.preis === 'object' && (
        <VariantModal
          isOpen={true}
          onClose={() => setPendingVariant(null)}
          itemName={pendingVariant.item.gericht}
          itemNumber={pendingVariant.item.nr}
          variants={pendingVariant.item.preis as PriceVariants}
          onSelectVariant={handleVariantChosen}
        />
      )}

      {features.enableCart !== false && features.enableWhatsAppOrder && (
        <WhatsAppOrderModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          selectedItems={whatsAppItemsMap}
        />
      )}
    </div>
  );
}

export default MenuSection;

