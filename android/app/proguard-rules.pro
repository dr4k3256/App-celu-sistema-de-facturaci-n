# Add project specific ProGuard rules here.

# ===== CAPACITOR CORE =====
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    @com.getcapacitor.annotation.PluginMethod public *;
}

# ===== WEBVIEW JAVASCRIPT INTERFACE =====
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ===== APP CUSTOM CLASSES =====
-keep class com.sistemafacturacion.celu.** { *; }

# ===== ADMOB =====
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }

# ===== SQLITE =====
-keep class io.ionic.libs.** { *; }
-keep class com.capacitorcommunitysqlite.** { *; }

# ===== PLAY CORE (app-update, review) =====
-keep class com.google.android.play.core.** { *; }

# ===== KOTLIN & COROUTINES =====
-keep class kotlin.** { *; }
-keep class kotlinx.coroutines.** { *; }
-dontwarn kotlinx.coroutines.**

# ===== RETROFIT / GSON (si aplica) =====
-dontwarn okhttp3.**
-dontwarn retrofit2.**

# ===== DEBUGGING: preservar números de línea en stack traces =====
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
