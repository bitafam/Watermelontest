# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# قوانین مایکت برای اینکه کلاسهای پرداخت پاک نشن
-keep class ir.mservices.market.billing.** { *; }
-keep interface ir.mservices.market.billing.** { *; }

# قوانین تپسل برای اینکه تبلیغات و وبویوهای تبلیغاتی پاک نشن
-keep class ir.tapsell.plus.** { *; }
-keep interface ir.tapsell.plus.** { *; }
-keep class miladesign.cordova.** { *; }
-keep class com.google.android.gms.ads.** { *; }
-dontwarn ir.tapsell.plus.**
-dontwarn miladesign.cordova.**

