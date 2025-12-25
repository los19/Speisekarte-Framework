interface ShareData {
  items: { [key: string]: number };
}

export const generateShareUrl = (selectedItems: { [key: string]: number }): string => {
  const shareData: ShareData = { items: selectedItems };
  const json = JSON.stringify(shareData);
  
  // Use URL-safe base64
  const base64 = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return `${window.location.origin}${window.location.pathname}?cart=${base64}`;
};

export const parseShareUrl = (url: string): ShareData | null => {
  try {
    const urlParams = new URLSearchParams(new URL(url).search);
    let cartParam = urlParams.get('cart');
    
    if (!cartParam) return null;
    
    // Clean up the parameter
    cartParam = cartParam.split(' ')[0];
    
    // Restore standard base64 from URL-safe version
    let base64 = cartParam.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const json = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const shareViaNavigator = async (url: string, title: string): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        url,
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

interface CartItem {
  category: string;
  item: { 
    gericht: string; 
    nr?: number | string | null;
    preis?: number | { [key: string]: number } | null;
  };
  quantity: number;
  variant?: string;
  variantPrice?: number;
}

// For the new WhatsApp Order Modal
interface OrderDetails {
  name: string;
  orderType: 'pickup' | 'delivery';
  address?: {
    street: string;
    zipCity: string;
  };
  notes?: string;
}

interface SelectedItemData {
  item: {
    gericht: string;
    nr?: number | string | null;
    preis?: number | { [key: string]: number } | null;
  };
  quantity: number;
  selectedVariant?: string;
}

/**
 * Generates a formatted WhatsApp message for ordering (simple version)
 */
export const generateWhatsAppMessage = (
  items: Map<string, CartItem>,
  restaurantName: string
): string => {
  const lines: string[] = [];
  
  // Header
  lines.push(`Hallo ${restaurantName},`);
  lines.push('');
  lines.push('ich möchte folgende Bestellung aufgeben:');
  lines.push('');
  
  // Items
  items.forEach(({ item, quantity, variant }) => {
    const numberPart = item.nr ? `#${item.nr} ` : '';
    const variantPart = variant ? ` (${variant})` : '';
    lines.push(`• ${quantity}x ${numberPart}${item.gericht}${variantPart}`);
  });
  
  // Footer
  lines.push('');
  lines.push('Vielen Dank!');
  
  return lines.join('\n');
};

/**
 * Generates a formatted WhatsApp message with order details (extended version)
 */
export const generateWhatsAppMessageWithDetails = (
  items: Map<string, SelectedItemData>,
  restaurantName: string,
  orderDetails: OrderDetails
): string => {
  const lines: string[] = [];
  
  // Header
  lines.push(`Hallo ${restaurantName},`);
  lines.push('');
  lines.push('ich möchte folgende Bestellung aufgeben:');
  lines.push('');
  
  // Order type
  if (orderDetails.orderType === 'delivery') {
    lines.push('🚗 *LIEFERUNG*');
  } else {
    lines.push('🏃 *ABHOLUNG*');
  }
  lines.push('');
  
  // Items
  let total = 0;
  items.forEach(({ item, quantity, selectedVariant }) => {
    const numberPart = item.nr ? `#${item.nr} ` : '';
    const variantPart = selectedVariant ? ` (${selectedVariant})` : '';
    lines.push(`• ${quantity}x ${numberPart}${item.gericht}${variantPart}`);
    
    // Calculate price
    if (item.preis !== null && item.preis !== undefined) {
      let price: number;
      if (typeof item.preis === 'number') {
        price = item.preis;
      } else if (selectedVariant && item.preis[selectedVariant]) {
        price = item.preis[selectedVariant];
      } else {
        price = Object.values(item.preis)[0] || 0;
      }
      total += price * quantity;
    }
  });
  
  lines.push('');
  lines.push(`Voraussichtlicher Preis: ${total.toFixed(2)} €`);
  lines.push('');
  
  // Customer info
  lines.push(`Name: ${orderDetails.name}`);
  
  // Delivery address
  if (orderDetails.orderType === 'delivery' && orderDetails.address) {
    lines.push('');
    lines.push('Lieferadresse:');
    lines.push(orderDetails.address.street);
    lines.push(orderDetails.address.zipCity);
  }
  
  // Additional notes
  if (orderDetails.notes) {
    lines.push('');
    lines.push(`Anmerkungen: ${orderDetails.notes}`);
  }
  
  // Footer
  lines.push('');
  lines.push('Vielen Dank!');
  
  return lines.join('\n');
};

/**
 * Cleans a phone number to E.164 format
 */
const cleanPhoneNumber = (whatsappNumber: string): string => {
  // Clean the number - remove all non-numeric characters
  let cleanNumber = whatsappNumber.replace(/\D/g, '');
  
  // If it starts with 0, assume German number and add country code
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '49' + cleanNumber.substring(1);
  }
  
  // If it doesn't start with a country code, add German code
  if (!cleanNumber.startsWith('49') && cleanNumber.length <= 11) {
    cleanNumber = '49' + cleanNumber;
  }
  
  return cleanNumber;
};

/**
 * Generates a WhatsApp URL with the order message (simple version)
 * @param whatsappNumber - Phone number in E.164 format without + (e.g., "491701234567")
 * @param message - The message to send (will be URL encoded)
 */
export function generateWhatsAppUrl(whatsappNumber: string, message: string): string;

/**
 * Generates a WhatsApp URL with order details (extended version)
 */
export function generateWhatsAppUrl(
  whatsappNumber: string,
  restaurantName: string,
  items: Map<string, SelectedItemData>,
  orderDetails: OrderDetails
): string;

export function generateWhatsAppUrl(
  whatsappNumber: string,
  messageOrRestaurantName: string,
  items?: Map<string, SelectedItemData>,
  orderDetails?: OrderDetails
): string {
  const cleanNumber = cleanPhoneNumber(whatsappNumber);
  
  let message: string;
  if (items && orderDetails) {
    // Extended version with order details
    message = generateWhatsAppMessageWithDetails(items, messageOrRestaurantName, orderDetails);
  } else {
    // Simple version - messageOrRestaurantName is the message
    message = messageOrRestaurantName;
  }
  
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Check if WhatsApp is likely available
 * Note: This is a heuristic, not 100% reliable
 */
export const isWhatsAppLikelyAvailable = (): boolean => {
  // On desktop, WhatsApp Web is always accessible
  // So we return true for all devices
  return true;
};

/**
 * Opens WhatsApp with the order (simple version)
 */
export const openWhatsAppOrder = (
  items: Map<string, CartItem>,
  restaurantName: string,
  whatsappNumber: string
): void => {
  const message = generateWhatsAppMessage(items, restaurantName);
  const url = generateWhatsAppUrl(whatsappNumber, message);
  window.open(url, '_blank');
};
