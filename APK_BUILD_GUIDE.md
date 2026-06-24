# Cracklix App Build Guide

## Prerequisites
- Android SDK 34
- Java 11+
- Gradle 8.0+
- Node.js 18+

## Quick Build Steps (Debug APK)

1. Sync Capacitor:
   ```bash
   npx cap sync android
   ```

2. Run the build script:
   ```bash
   chmod +x build-apk.sh
   ./build-apk.sh
   ```

## Release Build

1. **Create Keystore** (If you don't have one):
   ```bash
   keytool -genkey -v -keystore android/app/keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias cracklix
   ```

2. **Set Credentials**:
   Edit `android/app/build.gradle` signingConfigs or set environment variables.

3. **Build**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

## Icon Assets Checklist
Ensure PNG icons are placed in:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `android/app/src/main/res/mipmap-*/ic_launcher_round.png`

## Offline Support
To ensure the logo appears in offline mode:
1. Icons must be in `public/icons/`.
2. `public/manifest.json` must reference these paths correctly.
3. The PWA must be successfully installed on the device.