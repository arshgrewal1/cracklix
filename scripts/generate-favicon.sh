#!/usr/bin/env bash
# scripts/generate-favicon.sh
# Generate multi-size favicon.ico and PNG icons from the original logo
# Usage: ./scripts/generate-favicon.sh
# Requirements: ImageMagick (convert), pngquant or pngcrush (optional)

set -euo pipefail

SRC="public/logo/cracklix-icon.png"
ICONS_DIR="public/icons"
FAVICON="public/favicon.ico"

if [ ! -f "$SRC" ]; then
  echo "Source logo not found: $SRC"
  exit 1
fi

mkdir -p "$ICONS_DIR"

# Create standardized sizes
convert "$SRC" -resize 16x16^ -gravity center -background transparent -extent 16x16 "$ICONS_DIR/icon-16x16.png"
convert "$SRC" -resize 32x32^ -gravity center -background transparent -extent 32x32 "$ICONS_DIR/icon-32x32.png"
convert "$SRC" -resize 48x48^ -gravity center -background transparent -extent 48x48 "$ICONS_DIR/icon-48x48.png"
convert "$SRC" -resize 72x72^ -gravity center -background transparent -extent 72x72 "$ICONS_DIR/icon-72x72.png"
convert "$SRC" -resize 96x96^ -gravity center -background transparent -extent 96x96 "$ICONS_DIR/icon-96x96.png"
convert "$SRC" -resize 128x128^ -gravity center -background transparent -extent 128x128 "$ICONS_DIR/icon-128x128.png"
convert "$SRC" -resize 144x144^ -gravity center -background transparent -extent 144x144 "$ICONS_DIR/icon-144x144.png"
convert "$SRC" -resize 152x152^ -gravity center -background transparent -extent 152x152 "$ICONS_DIR/icon-152x152.png"
convert "$SRC" -resize 192x192^ -gravity center -background transparent -extent 192x192 "$ICONS_DIR/icon-192x192.png"
convert "$SRC" -resize 384x384^ -gravity center -background transparent -extent 384x384 "$ICONS_DIR/icon-384x384.png"
convert "$SRC" -resize 512x512^ -gravity center -background transparent -extent 512x512 "$ICONS_DIR/icon-512x512.png"

# Create an ICO containing multiple sizes (16,32,48)
convert "$ICONS_DIR/icon-16x16.png" "$ICONS_DIR/icon-32x32.png" "$ICONS_DIR/icon-48x48.png" "$FAVICON"

# Optional optimization with pngquant (if available)
if command -v pngquant >/dev/null 2>&1; then
  echo "Optimizing PNGs with pngquant..."
  for f in "$ICONS_DIR"/*.png; do
    pngquant --ext .png --force --quality=65-90 "$f" || true
  done
fi

# Optional optimization with pngcrush
if command -v pngcrush >/dev/null 2>&1; then
  echo "Further optimizing PNGs with pngcrush..."
  for f in "$ICONS_DIR"/*.png; do
    tmp="${f}.crushed"
    pngcrush -rem alla -brute "$f" "$tmp" >/dev/null 2>&1 || continue
    mv "$tmp" "$f"
  done
fi

echo "Generated favicon and icons in $ICONS_DIR and $FAVICON"

# Print verification commands
cat <<EOF
After running this script, verify with:
  curl -I https://<your-domain>/favicon.ico
  curl -I https://<your-domain>/icons/icon-48x48.png

Then in Google Search Console, use URL Inspection for your homepage and Request Indexing to speed up favicon refresh.
EOF
