#!/bin/bash

# Cracklix APK Build Script
set -e

echo "🔨 Preparing Web Assets..."
export BUILD_TARGET=android
npm run build:android

echo "📦 Syncing with Capacitor..."
npx cap sync android

echo "🏗️ Building Release APK..."
cd android
./gradlew clean assembleRelease

if [ $? -eq 0 ]; then
    echo "✅ Release APK built successfully!"
    mv app/build/outputs/apk/release/app-release.apk app/build/outputs/apk/release/cracklix.apk
    echo "📍 Release APK: android/app/build/outputs/apk/release/cracklix.apk"
else
    echo "❌ Build failed"
    exit 1
fi

echo "🎉 Process complete!"
