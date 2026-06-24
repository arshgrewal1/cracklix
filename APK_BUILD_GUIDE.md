# Cracklix App

## Build Instructions

### Prerequisites
- Android SDK 34
- Java 11+
- Gradle 8.0+
- Node.js 16+

### Build APK (Debug)

```bash
cd android
./gradlew assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`

### Build APK (Release)

1. **Create Keystore** (first time only):
```bash
keytool -genkey -v -keystore keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias cracklix
```

2. **Set Environment Variables**:
```bash
export KEYSTORE_PASSWORD="your_password"
export KEY_ALIAS="cracklix"
export KEY_PASSWORD="your_password"
```

3. **Build Release APK**:
```bash
cd android
./gradlew assembleRelease
```

Output: `app/build/outputs/apk/release/app-release.apk`

### Install APK on Device

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### Icon Assets

Place Cracklix logo in:
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png` (48x48)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png` (72x72)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png` (96x96)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png` (144x144)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` (192x192)
- `android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png` (48x48)
- `android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png` (72x72)
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png` (96x96)
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png` (144x144)
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png` (192x192)

### Upload to Play Store

1. Sign up for Google Play Developer Account
2. Create app listing
3. Upload signed APK (app-release.apk)
4. Add screenshots, description, privacy policy
5. Submit for review

