
# Optimized ProGuard rules for Cracklix to minimize APK size.

# Keep Capacitor's core functionality intact.
-keep public class com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin

# Preserve native plugins and their methods.
-keep class com.cracklix.app.SecurityPlugin { *; }

# Aggressively shrink AndroidX and Google Play Services.
# These rules are safe for most apps but can be fine-tuned if issues arise.
-dontwarn androidx.**
-keep class androidx.** { *; }
-keep interface androidx.** { *; }
-keep,allowobfuscation,allowshrinking class com.google.android.gms.**
-keep,allowobfuscation,allowshrinking class com.google.firebase.**
-keep class com.google.android.gms.common.internal.safeparcel.SafeParcelable {
    public static final *** CREATOR;
}

# Retain critical annotations and metadata.
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# Keep custom Application and Activity classes.
-keep public class com.cracklix.app.MainActivity
-keep public class android.app.Application

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
# public *;
#}

# For debugging, you can preserve line numbers.
#-keepattributes SourceFile,LineNumberTable

# And hide the original source file name.
#-renamesourcefileattribute SourceFile
