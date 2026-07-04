#!/bin/bash

# Cracklix APK Build Script
set -e

echo "🔨 Preparing Web Assets..."
export BUILD_TARGET=android
npm run build:android

echo "📦 Syncing with Capacitor..."
# Synchronize using the 'out' directory as configured in capacitor.config.ts
npx cap sync android

echo "🏗️ Building Debug APK..."
cd android
./gradlew clean assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ Debug APK built successfully!"
    echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ Build failed"
    exit 1
fi

echo "🎉 Process complete!"
