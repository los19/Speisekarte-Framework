import type { SpecialOffer } from '../types/menu';

// Get the currently active special offer (if any)
export const getActiveSpecialOffer = (offers: SpecialOffer[]): SpecialOffer | null => {
  const today = new Date().getDay();
  return offers.find(offer => offer.dayIndex === today) || null;
};

// Check if a menu item qualifies for the active special offer
export const getSpecialPriceForItem = (
  offers: SpecialOffer[],
  itemNr: number | string | null | undefined,
  category: string
): number | null => {
  const activeOffer = getActiveSpecialOffer(offers);
  if (!activeOffer) return null;

  // Check if item number is in the special offer range
  if (activeOffer.itemNumbers && typeof itemNr === 'number') {
    if (itemNr >= activeOffer.itemNumbers.from && itemNr <= activeOffer.itemNumbers.to) {
      return activeOffer.specialPrice;
    }
  }

  // Check if category matches (for category-wide offers)
  if (activeOffer.targetCategory && activeOffer.targetCategory === category) {
    if (typeof itemNr === 'number' && activeOffer.itemNumbers) {
      // Only apply if item is in the number range
      if (itemNr >= activeOffer.itemNumbers.from && itemNr <= activeOffer.itemNumbers.to) {
        return activeOffer.specialPrice;
      }
    }
  }

  return null;
};

// Check if today's special offer matches a Dauerangebot item
export const isSpecialOfferActive = (offers: SpecialOffer[], dayAbbr: string): boolean => {
  const today = new Date().getDay();
  const offer = offers.find(o => o.dayAbbr === dayAbbr);
  return offer ? offer.dayIndex === today : false;
};

// Get target category for navigation
export const getTargetCategoryForOffer = (offers: SpecialOffer[], dayAbbr: string): string | null => {
  const offer = offers.find(o => o.dayAbbr === dayAbbr);
  return offer?.targetCategory || null;
};

// Get item number range for filtering
export const getItemRangeForOffer = (offers: SpecialOffer[], dayAbbr: string): { from: number; to: number } | null => {
  const offer = offers.find(o => o.dayAbbr === dayAbbr);
  return offer?.itemNumbers || null;
};

