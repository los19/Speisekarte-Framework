import { MenuItem } from './MenuItem';
import { useFeatures } from '../config/ConfigProvider';
import type { MenuItem as MenuItemType } from '../types/menu';
import '../styles/MenuCategory.css';

interface MenuCategoryProps {
  category: string;
  items: MenuItemType[];
  selectedItems: { [key: string]: number };
  onUpdateQuantity: (categoryIndex: number, itemIndex: number, change: number) => void;
  onSelectVariant: (category: string, item: MenuItemType) => void;
  onNavigateToCategory?: (category: string) => void;
  categoryIndex: number;
  categoryRef?: (el: HTMLDivElement | null) => void;
  hideQuantityControls?: boolean;
}

// Create a unique key for each menu item
const getItemKey = (category: string, item: MenuItemType, variant?: string) => {
  if (variant) {
    return `${category}|||${item.gericht}|||${variant}`;
  }
  return `${category}|||${item.gericht}`;
};

// Get total quantity for an item (including all variants)
const getItemQuantity = (category: string, item: MenuItemType, selectedItems: { [key: string]: number }): number => {
  const baseKey = `${category}|||${item.gericht}`;
  let total = 0;
  
  for (const [key, qty] of Object.entries(selectedItems)) {
    if (key === baseKey || key.startsWith(baseKey + '|||')) {
      total += qty;
    }
  }
  
  return total;
};

export const MenuCategory = ({
  category,
  items,
  selectedItems,
  onUpdateQuantity,
  onSelectVariant,
  onNavigateToCategory,
  categoryIndex,
  categoryRef,
  hideQuantityControls,
}: MenuCategoryProps) => {
  const features = useFeatures();
  
  return (
    <div className="menu-category" ref={categoryRef}>
      <h2 className="category-title">{category}</h2>
      <div className="category-items">
        {items.map((item, itemIndex) => {
          const quantity = hideQuantityControls ? 0 : getItemQuantity(category, item, selectedItems);
          
          return (
            <MenuItem
              key={getItemKey(category, item)}
              item={item}
              category={category}
              quantity={quantity}
              onIncrease={hideQuantityControls ? undefined : () => onUpdateQuantity(categoryIndex, itemIndex, 1)}
              onDecrease={hideQuantityControls ? undefined : () => onUpdateQuantity(categoryIndex, itemIndex, -1)}
              onSelectVariant={hideQuantityControls ? undefined : onSelectVariant}
              onNavigateToCategory={features.enableCategoryNavigation ? onNavigateToCategory : undefined}
              hideQuantityControls={hideQuantityControls}
            />
          );
        })}
      </div>
    </div>
  );
};

