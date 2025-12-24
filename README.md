# Speisekarte Framework

Ein konfigurierbares React-Framework für digitale Restaurant-Speisekarten.

## Installation

```bash
npm install @los19/speisekarte-framework
```

## Features

- 🎨 **Vollständig konfigurierbar** - Farben, Logo, Texte über JSON-Dateien
- 🔄 **Feature-Flags** - Funktionen pro Restaurant aktivieren/deaktivieren
- 📱 **Responsive** - Optimiert für Mobile, Tablet und Desktop
- 🛒 **Warenkorb** - Mit LocalStorage-Persistierung und Teilen-Funktion
- 📞 **Kontakt** - Anrufen, Route planen, WhatsApp-Bestellung
- ⏰ **Öffnungszeiten** - Live-Status mit Countdown
- 🏷️ **Sonderangebote** - Tagesangebote mit automatischer Anzeige

## Verwendung in Restaurant-Projekten

```tsx
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App, ConfigProvider } from '@los19/speisekarte-framework';
import '@los19/speisekarte-framework/styles';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </StrictMode>
);
```

## Konfigurationsdateien

Lege diese Dateien in `public/config/` ab:

| Datei | Beschreibung |
|-------|-------------|
| `restaurant.json` | Name, Adresse, Telefon, WhatsApp |
| `openingHours.json` | Öffnungszeiten pro Tag |
| `features.json` | Feature-Flags |
| `theme.json` | Farben und Design |
| `specialOffers.json` | Tagesangebote |
| `legal.json` | Impressum & Datenschutz |
| `version.json` | Versionsnummer |

Plus:
- `public/menu.json` - Die Speisekarte
- `public/logo.png` - Restaurant-Logo

### Beispiel: features.json

```json
{
  "enablePriceVariants": true,
  "enableSpecialOffers": true,
  "enableCategoryNavigation": true,
  "enableWhatsAppOrder": false,
  "ui": {
    "cartIcon": "cart",
    "showHeaderSubtitle": true
  }
}
```

## Entwicklung

```bash
# Klonen
git clone https://github.com/los19/Speisekarte-Framework.git
cd Speisekarte-Framework

# Installieren
npm install

# Lokaler Dev-Server
npm run dev

# Library bauen
npm run build:lib
```

## Veröffentlichung

```bash
npm version patch  # oder minor/major
git push && git push --tags
```

GitHub Action veröffentlicht automatisch auf GitHub Packages.

## Lizenz

MIT
