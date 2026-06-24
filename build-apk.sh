#!/bin/bash

# Cracklix APK Build Script

set -e

echo "🔨 Building Cracklix APK..."

# Check if Android SDK is installed
if [ -z "$ANDROID_SDK_ROOT" ]; then
    echo "❌ ANDROID_SDK_ROOT not set. Please install Android SDK."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd android
./gradlew clean

# Build debug APK
echo "🏗️ Building debug APK..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ Debug APK built successfully!"
    echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ Build failed"
    exit 1
fi

# Build release APK (optional)
read -p "Build release APK? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔐 Building release APK..."
    ./gradlew assembleRelease
    if [ $? -eq 0 ]; then
        echo "✅ Release APK built successfully!"
        echo "📍 Location: android/app/build/outputs/apk/release/app-release.apk"
    else
        echo "❌ Release build failed"
        exit 1
    fi
fi

echo "🎉 Build complete!"
