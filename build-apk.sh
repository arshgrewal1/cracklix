#!/bin/bash

# Cracklix APK Build Script
set -e

echo "🔨 Preparing Web Assets..."
export BUILD_TARGET=android
npm run build:android

echo "📦 Syncing with Capacitor..."
# Synchronize using the 'out' directory as configured in capacitor.config.ts
npx cap sync android

echo "🏗️ Building Release APK..."
cd android
./gradlew clean assembleRelease --stacktrace --info

if [ $? -eq 0 ]; then
    echo "✅ Release APK built successfully!"
    echo "📍 Listing contents of app/build/outputs/apk..."
    ls -l app/build/outputs/apk
    echo "📍 Listing contents of app/build/outputs/apk/release..."
    ls -l app/build/outputs/apk/release
    echo "📍 Location: app/build/outputs/apk/release/app-release.apk"
else
    echo "❌ Build failed"
    exit 1
fi

echo "🎉 Process complete!"
