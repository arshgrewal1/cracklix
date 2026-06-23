#!/bin/bash

# Generate Android Release Keystore
# This script creates a keystore file for signing Android APKs

set -e

KEYSTORE_FILE="my-release-key.keystore"
KEYSTORE_PASSWORD="CrackLix@2026Release!"
KEY_ALIAS="cracklix"
KEY_PASSWORD="CrackLix@2026Release!"

echo "🔐 Generating Android Release Keystore..."
echo "=========================================="

# Generate keystore with default values (non-interactive)
keytool -genkey -v \
  -keystore "$KEYSTORE_FILE" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias "$KEY_ALIAS" \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  -dname "CN=Cracklix Developer, OU=Development, O=Cracklix, L=India, ST=India, C=IN"

echo ""
echo "✅ Keystore generated successfully!"
echo ""
echo "📄 Keystore Details:"
echo "  File: $KEYSTORE_FILE"
echo "  Alias: $KEY_ALIAS"
echo "  Validity: 10000 days (~27 years)"
echo ""

# Encode to base64
echo "📝 Encoding keystore to base64..."
echo ""

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  BASE64_ENCODED=$(base64 < "$KEYSTORE_FILE")
else
  # Linux
  BASE64_ENCODED=$(base64 -w 0 < "$KEYSTORE_FILE")
fi

echo "🔑 KEYSTORE_BASE64 Secret (copy this):"
echo "========================================"
echo "$BASE64_ENCODED"
echo ""
echo ""

echo "📋 All GitHub Actions Secrets to Add:"
echo "====================================="
echo "1. KEYSTORE_BASE64"
echo "   Value: [Base64 string above - copy and paste]"
echo ""
echo "2. KEYSTORE_PASSWORD"
echo "   Value: $KEYSTORE_PASSWORD"
echo ""
echo "3. KEY_ALIAS"
echo "   Value: $KEY_ALIAS"
echo ""
echo "4. KEY_PASSWORD"
echo "   Value: $KEY_PASSWORD"
echo ""

# Optional: Save to a safe file
cat > keystore-secrets.txt << EOF
# Android Keystore Secrets
# Generated: $(date)
# ⚠️  KEEP THIS FILE SECURE AND DO NOT COMMIT TO GIT

KEYSTORE_BASE64=$BASE64_ENCODED

KEYSTORE_PASSWORD=$KEYSTORE_PASSWORD

KEY_ALIAS=$KEY_ALIAS

KEY_PASSWORD=$KEY_PASSWORD
EOF

echo "💾 Secrets saved to: keystore-secrets.txt"
echo ""
echo "✨ Next steps:"
echo "   1. Go to GitHub Settings > Secrets and variables > Actions"
echo "   2. Add each secret from the list above"
echo "   3. Delete keystore-secrets.txt and $KEYSTORE_FILE after adding secrets"
echo "   4. Never commit the keystore file to git"
