#!/bin/bash

# Initialize a new restaurant menu from the framework
# Usage: ./scripts/init-restaurant.sh <target-directory> <restaurant-name>

set -e

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: $0 <target-directory> <restaurant-name>"
    echo "Example: $0 ../my-restaurant-menu 'My Restaurant'"
    exit 1
fi

TARGET_DIR="$1"
RESTAURANT_NAME="$2"
STORAGE_KEY=$(echo "$RESTAURANT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')-cart

echo "Initializing new restaurant menu: $RESTAURANT_NAME"
echo "Target directory: $TARGET_DIR"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy the entire framework
echo "Copying framework files..."
cp -r . "$TARGET_DIR"

# Clean up unnecessary files
rm -rf "$TARGET_DIR/.git"
rm -rf "$TARGET_DIR/node_modules"
rm -rf "$TARGET_DIR/scripts"

# Update restaurant.json with the new name
cat > "$TARGET_DIR/public/config/restaurant.json" << EOF
{
  "name": "$RESTAURANT_NAME",
  "subtitle": "",
  "address": "Adresse eingeben",
  "phone": "Telefon eingeben",
  "googleMapsUrl": "https://www.google.com/maps",
  "footer": {
    "tagline": ""
  },
  "cartStorageKey": "$STORAGE_KEY"
}
EOF

echo ""
echo "Restaurant menu initialized successfully!"
echo ""
echo "Next steps:"
echo "  1. cd $TARGET_DIR"
echo "  2. npm install"
echo "  3. Edit public/config/restaurant.json with your restaurant details"
echo "  4. Edit public/config/openingHours.json with your opening hours"
echo "  5. Edit public/config/theme.json with your brand colors"
echo "  6. Edit public/config/features.json to enable/disable features"
echo "  7. Replace public/logo.png with your restaurant logo"
echo "  8. Replace public/menu.json with your menu data"
echo "  9. npm run dev to start development server"

