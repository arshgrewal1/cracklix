# Cracklix APK Setup Guide

## 📱 Build Options

### 1. Local Build (Script)
Run the automated script to build your APK:
```bash
chmod +x build-apk.sh
./build-apk.sh
```

### 2. Manual Android Studio Build
1. Open the `android/` folder in Android Studio.
2. Build -> Generate Signed Bundle / APK.

### 3. GitHub Actions
The project is configured to build the APK on every push to `main`. Download the artifact from the Actions tab.

## 🖼️ Icon Requirements
To fix the "logo not appearing offline" issue, ensure the following PNG files exist in `public/icons/`:
- `icon-192x192.png`
- `icon-512x512.png`
- `icon-maskable-192x192.png`
- `icon-maskable-512x512.png`

## 🎯 Configuration Summary
- **Package Name**: com.cracklix.app
- **Target SDK**: 34 (Android 14)
- **Primary Color**: #2563EB