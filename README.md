# Speisekarte Framework

Ein konfigurierbares React-Framework für digitale Speisekarten.

## Features

- **Konfigurierbar**: Alle Restaurant-spezifischen Daten werden über JSON-Dateien konfiguriert
- **Feature-Flags**: Funktionen können pro Restaurant aktiviert/deaktiviert werden
- **Themes**: Farben und Design über `theme.json` anpassbar
- **Updatebar**: Framework-Code kann unabhängig von Konfigurationsdaten aktualisiert werden

## Projektstruktur

```
speisekarte-framework/
├── src/                              # Framework-Code
│   ├── App.tsx                       # Hauptkomponente
│   ├── components/                   # React-Komponenten
│   ├── config/ConfigProvider.tsx     # Konfigurationslogik
│   ├── hooks/                        # Custom Hooks
│   ├── styles/                       # CSS-Styles
│   ├── types/                        # TypeScript-Interfaces
│   └── utils/                        # Hilfsfunktionen
├── public/
│   ├── config/                       # Konfigurationsdateien
│   │   ├── restaurant.json           # Restaurant-Infos
│   │   ├── openingHours.json         # Öffnungszeiten
│   │   ├── features.json             # Feature-Flags
│   │   ├── theme.json                # Design/Farben
│   │   └── specialOffers.json        # Sonderangebote
│   ├── menu.json                     # Speisekarte
│   └── logo.png                      # Restaurant-Logo
└── scripts/
    ├── deploy.sh                     # Deploy-Script
    └── init-restaurant.sh            # Neues Restaurant erstellen
```

## Konfigurationsdateien

### restaurant.json

```json
{
  "name": "Restaurant Name",
  "subtitle": "Untertitel",
  "address": "Straße, PLZ Stadt",
  "phone": "01234567890",
  "googleMapsUrl": "https://...",
  "footer": {
    "tagline": "Slogan"
  },
  "cartStorageKey": "restaurant-cart"
}
```

### features.json

```json
{
  "enablePriceVariants": true,      // Mehrere Preise pro Produkt (z.B. Pizzagrößen)
  "enableSpecialOffers": true,      // Sonderangebote/Tagesangebote
  "enableCategoryNavigation": true, // Navigation zu Kategorien
  "enableWhatsAppOrder": false,     // WhatsApp-Bestellung (zukünftig)
  "ui": {
    "cartIcon": "cart",             // "cart" oder "clipboard"
    "showHeaderSubtitle": true      // Untertitel im Header anzeigen
  }
}
```

### theme.json

```json
{
  "colors": {
    "primary": "#8B4513",
    "primaryDark": "#6B3410",
    "primaryLight": "#A0522D",
    "accent": "#D2691E",
    "bgMain": "#F5E6D3",
    "textDark": "#3D2914",
    ...
  }
}
```

### specialOffers.json

```json
[
  {
    "dayAbbr": "Mo.",
    "dayIndex": 1,
    "specialPrice": 6.0,
    "targetCategory": "Kebab-Spezialitäten",
    "description": "Kleine Kebab Tasche"
  }
]
```

## Menu-JSON-Format

```json
{
  "Kategorie": [
    {
      "nr": 1,
      "gericht": "Gericht Name",
      "preis": 12.00
    },
    {
      "nr": 2,
      "gericht": "Gericht mit Varianten",
      "preis": {
        "klein": 8.00,
        "groß": 12.00
      }
    }
  ]
}
```

## Verwendung

### Entwicklung

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Neues Restaurant erstellen

```bash
./scripts/init-restaurant.sh <zielverzeichnis> "Restaurant Name"
```

### Framework auf bestehendes Restaurant deployen

```bash
./scripts/deploy.sh <zielverzeichnis>
```

## Update-Strategie

1. Änderungen am Framework in `speisekarte-framework/src/` machen
2. `npm run build` ausführen
3. Mit `deploy.sh` auf alle Restaurants deployen

Die Konfigurationsdateien (`config/`, `menu.json`, `logo.png`) bleiben dabei unverändert.
