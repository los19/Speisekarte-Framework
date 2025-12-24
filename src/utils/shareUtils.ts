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
  };
  quantity: number;
  variant?: string;
  variantPrice?: number;
}

/**
 * Generates a formatted WhatsApp message for ordering
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
 * Generates a WhatsApp URL with the order message
 * @param whatsappNumber - Phone number in E.164 format without + (e.g., "491701234567")
 * @param message - The message to send (will be URL encoded)
 */
export const generateWhatsAppUrl = (whatsappNumber: string, message: string): string => {
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
  
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

/**
 * Check if WhatsApp is likely available
 * Note: This is a heuristic, not 100% reliable
 */
export const isWhatsAppLikelyAvailable = (): boolean => {
  // On mobile devices, WhatsApp is likely available
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // On desktop, WhatsApp Web is always accessible
  // So we return true for all devices
  return true;
};

/**
 * Opens WhatsApp with the order
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
