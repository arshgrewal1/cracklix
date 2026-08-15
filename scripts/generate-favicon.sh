#!/usr/bin/env bash
# scripts/generate-favicon.sh
# Generate multi-size favicon.ico and PNG icons from the best available source logo.
# Usage: ./scripts/generate-favicon.sh
# Requirements: ImageMagick (convert), pngquant or pngcrush (optional)

set -euo pipefail

# Prefer the blue institutional icon in public/icons if present, otherwise fall back to public/logo/cracklix-icon.png
if [ -f "public/icons/icon-512x512.png" ]; then
  SRC="public/icons/icon-512x512.png"
elif [ -f "public/icons/icon-192x192.png" ]; then
  SRC="public/icons/icon-192x192.png"
elif [ -f "public/logo/cracklix-icon.png" ]; then
  SRC="public/logo/cracklix-icon.png"
else
  echo "No source logo found. Please add public/icons/icon-512x512.png or public/logo/cracklix-icon.png"
  exit 1
fi

ICONS_DIR="public/icons"
FAVICON="public/favicon.ico"

mkdir -p "$ICONS_DIR"

echo "Using source: $SRC"

# Create a clean centered square master (transparent background)
convert "$SRC" -trim +repage -resize 512x512^ -gravity center -background transparent -extent 512x512 "$ICONS_DIR/master-512.png"

# Generate sharp, downscaled PNGs (Lanczos + unsharp to keep logos crisp)
convert "$ICONS_DIR/master-512.png" -filter Lanczos -resize 512x512 "$ICONS_DIR/icon-512x512.png"
convert "$ICONS_DIR/master-512.png" -filter Lanczos -resize 384x384 -unsharp 0x0.75+0.75+0.008 "$ICONS_DIR/icon-384x384.png"
convert "$ICONS_DIR/master-512.png" -filter Lanczos -resize 192x192 -unsharp 0x0.75+0.75+0.008 "$ICONS_DIR/icon-192x192.png"
convert "$ICONS_DIR/master-512.png" -filter Lanczos -resize 152x152 -unsharp 0x0.75+0.75+0.008 "$ICONS_DIR/icon-152x152.png"
convert "$ICONS_DIR/master-512.png" -filter Lanczos -resize 144x144 -unsharp 0x0.75+0.75+0.008 "$ICONS_DIR/icon-144x144.png"
convert "$ICONS_DIR/master-512.png" -filter Lanczos -resize 128x128 -unsharp 0x0.75+0.75+0.008 "$ICONS_DIR/icon-128x128.png"
convert "$ICONS_DIR/master-512.png" -filter Lanczos -resize 96x96 -unsharp 0x0.75+0.75+0.008 "$ICONS_DIR/icon-96x96.png"
convert "$ICONS_DIR/master-512.png" -filter Lanczos -resize 72x72 -unsharp 0x0.75+0.75+0.008 "$ICONS_DIR/icon-72x72.png"
convert "$ICONS_DIR/master-512.png" -filter Lanczos -resize 48x48 -unsharp 0x0.75+0.75+0.008 "$ICONS_DIR/icon-48x48.png"
convert "$ICONS_DIR/master-512.png" -filter Lanczos -resize 32x32 -unsharp 0x0.75+0.75+0.008 "$ICONS_DIR/icon-32x32.png"
convert "$ICONS_DIR/master-512.png" -filter Lanczos -resize 16x16 -unsharp 0x0.75+0.75+0.008 "$ICONS_DIR/icon-16x16.png"

# Create an ICO containing multiple sizes (16,32,48) for broad compatibility
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

cat <<EOF
After the script runs, verify with:
  curl -I https://cracklix.in/favicon.ico
  curl -I https://cracklix.in/icons/icon-48x48.png

If you want me to run the workflow, click Actions → Generate Favicon → Run workflow. Share the logs if anything fails and I'll help.
EOF
