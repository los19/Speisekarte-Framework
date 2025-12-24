#!/bin/bash

# Speisekarte Framework Deploy Script
# This script deploys the framework to a restaurant's menu app
# Usage: ./scripts/deploy.sh <target-directory>

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <target-directory>"
    echo "Example: $0 ../citygrill-menu"
    exit 1
fi

TARGET_DIR="$1"

if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Target directory '$TARGET_DIR' does not exist"
    exit 1
fi

echo "Deploying Speisekarte Framework to: $TARGET_DIR"

# Build the framework
echo "Building framework..."
npm run build

# Backup existing config files
echo "Backing up configuration files..."
if [ -d "$TARGET_DIR/public/config" ]; then
    cp -r "$TARGET_DIR/public/config" "$TARGET_DIR/public/config.backup"
fi

if [ -f "$TARGET_DIR/public/menu.json" ]; then
    cp "$TARGET_DIR/public/menu.json" "$TARGET_DIR/public/menu.json.backup"
fi

if [ -f "$TARGET_DIR/public/logo.png" ]; then
    cp "$TARGET_DIR/public/logo.png" "$TARGET_DIR/public/logo.png.backup"
fi

# Deploy built files
echo "Deploying built files..."
rm -rf "$TARGET_DIR/dist"
cp -r dist "$TARGET_DIR/dist"

# Restore config files to dist
echo "Restoring configuration files to dist..."
if [ -d "$TARGET_DIR/public/config.backup" ]; then
    mkdir -p "$TARGET_DIR/dist/config"
    cp -r "$TARGET_DIR/public/config.backup/"* "$TARGET_DIR/dist/config/"
    rm -rf "$TARGET_DIR/public/config.backup"
fi

if [ -f "$TARGET_DIR/public/menu.json.backup" ]; then
    cp "$TARGET_DIR/public/menu.json.backup" "$TARGET_DIR/dist/menu.json"
    rm "$TARGET_DIR/public/menu.json.backup"
fi

if [ -f "$TARGET_DIR/public/logo.png.backup" ]; then
    cp "$TARGET_DIR/public/logo.png.backup" "$TARGET_DIR/dist/logo.png"
    rm "$TARGET_DIR/public/logo.png.backup"
fi

echo "Deployment complete!"
echo ""
echo "The following files were updated:"
echo "  - $TARGET_DIR/dist/assets/*"
echo "  - $TARGET_DIR/dist/index.html"
echo ""
echo "The following files were preserved:"
echo "  - $TARGET_DIR/dist/config/*"
echo "  - $TARGET_DIR/dist/menu.json"
echo "  - $TARGET_DIR/dist/logo.png"

