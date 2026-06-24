# Cracklix PWA to APK Conversion Guide

## 📱 APK Setup Complete!

Your PWA is now configured for APK conversion. Here's how to generate the APK:

### Option 1: Using Android Studio (Recommended)

1. Open `android/` folder in Android Studio
2. Wait for Gradle to sync
3. Go to **Build → Generate Signed Bundle / APK**
4. Select APK and follow wizard
5. APK will be generated in `android/app/build/outputs/apk/`

### Option 2: Using Command Line

```bash
# Make script executable
chmod +x build-apk.sh

# Run build script
./build-apk.sh
```

### Option 3: GitHub Actions (CI/CD)

Create `.github/workflows/build-apk.yml`:

```yaml
name: Build APK

on:
  push:
    branches: [ main ]
    paths:
      - 'android/**'
      - 'src/**'
      - 'package.json'

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Setup Android SDK
      uses: android-actions/setup-android@v3
    
    - name: Install dependencies
      run: npm install
    
    - name: Build APK
      working-directory: ./android
      run: |
        chmod +x ./gradlew
        ./gradlew clean assembleDebug
    
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: cracklix-debug.apk
        path: android/app/build/outputs/apk/debug/app-debug.apk
```

## 📋 Icon Setup Required

You need to add the Cracklix logo in these sizes:

**Web Icons** (public/icons/):
- `icon-192x192.png` - 192x192px
- `icon-512x512.png` - 512x512px
- `icon-maskable-192x192.png` - 192x192px (maskable)
- `icon-maskable-512x512.png` - 512x512px (maskable)

**Android Icons** (android/app/src/main/res/):
- `mipmap-mdpi/ic_launcher.png` - 48x48px
- `mipmap-hdpi/ic_launcher.png` - 72x72px
- `mipmap-xhdpi/ic_launcher.png` - 96x96px
- `mipmap-xxhdpi/ic_launcher.png` - 144x144px
- `mipmap-xxxhdpi/ic_launcher.png` - 192x192px
- (Same sizes with `_round` suffix for rounded variant)

## 🔐 Signing for Release

### Create Keystore:
```bash
keytool -genkey -v -keystore keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias cracklix
```

### Build Release APK:
```bash
export KEYSTORE_PASSWORD="your_secure_password"
export KEY_ALIAS="cracklix"
export KEY_PASSWORD="your_secure_password"

cd android
./gradlew assembleRelease
```

### Output:
```
android/app/build/outputs/apk/release/app-release.apk
```

## 📦 Next Steps

1. **Add Icon Assets** - Place PNG logos in directories above
2. **Test APK** - Install on device or emulator
3. **Generate Release Build** - Create signed release APK
4. **Upload to Play Store** - Follow Google Play submission process
5. **Configure App Store Listing** - Add descriptions, screenshots, privacy policy

## ✅ File Checklist

- [x] `android/app/build.gradle` - Build configuration
- [x] `android/app/src/main/AndroidManifest.xml` - App manifest
- [x] `android/app/src/main/res/values/strings.xml` - App strings
- [x] `android/app/src/main/res/values/themes.xml` - App themes
- [x] `android/app/src/main/res/values/colors.xml` - App colors
- [ ] Icon assets (PNG files) - **YOU NEED TO ADD THESE**
- [ ] Keystore file (for signing) - **CREATE THIS**
- [x] `public/manifest.json` - Web manifest

## 🎯 Key Information

- **Package Name**: `com.cracklix.app`
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 34 (Android 14)
- **Theme Color**: #2563EB (Blue)
- **App Name**: Cracklix

## 🆘 Troubleshooting

**Build fails?**
- Update Android SDK to latest version
- Run `./gradlew clean` before building
- Check Java version (need 11+)

**Icons not showing?**
- Ensure PNG files are in correct resolution
- Check file names match exactly
- Rebuild after adding icons

**App crashes on launch?**
- Check AndroidManifest permissions
- Ensure all required meta-data is present
- Review Logcat for detailed errors

