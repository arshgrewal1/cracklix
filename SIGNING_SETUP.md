# Cracklix Signed APK Build Setup

## 🔐 Signing Configuration Status

Your `android/app/build.gradle` is configured to use environment variables for signing:

```gradle
signingConfigs {
    release {
        storeFile file(System.getenv('KEYSTORE_PATH') ?: 'keystore.jks')
        storePassword System.getenv('KEYSTORE_PASSWORD')
        keyAlias System.getenv('KEY_ALIAS')
        keyPassword System.getenv('KEY_PASSWORD')
    }
}
```

## 📋 Required GitHub Secrets

Set these secrets in: **Settings → Secrets and variables → Actions**

| Secret Name | Description | Example |
|-------------|-------------|----------|
| `KEYSTORE_PASSWORD` | Keystore file password | `your_secure_password` |
| `KEY_ALIAS` | Key alias in keystore | `cracklix_key` |
| `KEY_PASSWORD` | Key password | `your_key_password` |

## 🔑 Generate Keystore (If You Don't Have One)

Run this command locally:

```bash
keytool -genkey -v -keystore android/app/keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias cracklix_key \
  -dname "CN=Cracklix,O=Cracklix,L=Punjab,ST=Punjab,C=IN"
```

When prompted:
- **Keystore Password**: Enter a strong password (remember this for secrets)
- **Key Password**: Same or different (remember this for secrets)

## 📤 Commit Keystore to Repository

⚠️ **IMPORTANT**: Only commit keystore if your repo is PRIVATE!

```bash
# Add to git
git add android/app/keystore.jks
git commit -m "Add keystore for signing"
git push origin main
```

## ✅ Verify Setup

1. ✓ Keystore file: `android/app/keystore.jks`
2. ✓ GitHub Secrets configured (3 secrets)
3. ✓ `build.gradle` has signing config (already done)
4. ✓ Workflow file uses secrets (already done)

## 🚀 Trigger Build

Push any change to main:

```bash
git push origin main
```

Or manually trigger in GitHub Actions tab.

## 📥 Download APK

1. Go to **Actions** tab
2. Find latest workflow run
3. Download `cracklix-release-apk` artifact
4. Extract and install: `adb install -r cracklix-release.apk`

## 🎯 Your App Icon

The signed APK will use icons from:
- `public/icons/icon-192x192.png` (default launcher icon)
- `public/icons/icon-512x512.png` (splash screen)

Ensure these PNG files exist in your `/public/icons/` folder on your website.

## 🔧 Build Configuration

- **Min SDK**: 24
- **Target SDK**: 34
- **Compile SDK**: 34
- **App ID**: `com.cracklix.app`
- **Version**: 1.0.5
- **Signing**: RSA-2048, 10-year validity
- **Optimization**: ProGuard minification + resource shrinking
