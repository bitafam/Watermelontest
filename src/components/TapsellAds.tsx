import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

declare global {
  interface Window {
    TapsellPlus?: any;
  }
}

const TAPSELL_APP_KEY = "87385b4e-06dc-4524-81dc-ed80044d583f";
const ZONE_BANNER = "6a7312c02d8bc412b49fd3f0";
const ZONE_VIDEO = "6a7312aa2d8bc412b49fd3ef";

let isTapsellInitialized = false;

export function TapsellBanner() {
  const isPremium = localStorage.getItem("isPremium") === "true";

  useEffect(() => {
    if (isPremium) return;
    
    const initAndShowBanner = () => {
      if (!window.TapsellPlus) return;
      
      try {
        if (!isTapsellInitialized) {
          window.TapsellPlus.initialize(TAPSELL_APP_KEY);
          isTapsellInitialized = true;
        }

        window.TapsellPlus.requestRewardedVideo(ZONE_VIDEO); // preload video
        
        window.TapsellPlus.createBanner(
          ZONE_BANNER,
          window.TapsellPlus.AD_POSITION.BOTTOM_CENTER,
          window.TapsellPlus.AD_SIZE.BANNER_320x50
        );
        window.TapsellPlus.showBanner();
      } catch (err) {
        console.error("Tapsell Banner error:", err);
      }
    };

    // Small delay to ensure Cordova/Capacitor is ready
    setTimeout(initAndShowBanner, 1000);

    return () => {
      if (window.TapsellPlus) {
        try {
          window.TapsellPlus.hideBanner();
          window.TapsellPlus.removeBanner();
        } catch (e) {}
      }
    };
  }, [isPremium]);

  return null; // The banner is rendered natively by Tapsell plugin
}

export function TapsellVideoAd({ onComplete }: { onComplete: () => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let adTimeout: any;
    let isCompleted = false;

    const finishAd = () => {
      if (!isCompleted) {
        isCompleted = true;
        onComplete();
      }
    };

    if (!window.TapsellPlus) {
      // Not in native app or plugin not available
      finishAd();
      return;
    }

    try {
      if (!isTapsellInitialized) {
        window.TapsellPlus.initialize(TAPSELL_APP_KEY);
        isTapsellInitialized = true;
      }

      const onResponse = (e: any) => {
        if (e.adType === "rewardedVideo") {
          window.TapsellPlus.showRewardedVideo(e.responseId);
          setLoading(false);
        }
      };

      const onError = (e: any) => {
        if (e.adType === "rewardedVideo") {
          console.error("Tapsell Video Error", e.message);
          finishAd(); // fail gracefully
        }
      };

      const onClosed = (e: any) => {
        if (e.adType === "rewardedVideo") {
          finishAd();
        }
      };

      const onRewarded = (e: any) => {
        if (e.adType === "rewardedVideo") {
          // Rewarded successfully
        }
      };

      document.addEventListener("response", onResponse);
      document.addEventListener("error", onError);
      document.addEventListener("onClosed", onClosed);
      document.addEventListener("onRewarded", onRewarded);
      document.addEventListener("onError", onError);

      window.TapsellPlus.requestRewardedVideo(ZONE_VIDEO);

      // Timeout fallback: if no ad after 7 seconds, just proceed
      adTimeout = setTimeout(() => {
        finishAd();
      }, 7000);

      return () => {
        document.removeEventListener("response", onResponse);
        document.removeEventListener("error", onError);
        document.removeEventListener("onClosed", onClosed);
        document.removeEventListener("onRewarded", onRewarded);
        document.removeEventListener("onError", onError);
        clearTimeout(adTimeout);
      };
    } catch (err) {
      console.error("Tapsell Video Init Error:", err);
      finishAd();
    }
  }, [onComplete]);

  if (!loading) return null; // Video is showing natively, so no web UI needed

  // Loading UI while requesting ad
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center"
      >
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-white font-bold mb-2">در حال بارگذاری ویدیو...</p>
        <p className="text-emerald-400 text-sm">لطفاً صبر کنید</p>
      </motion.div>
    </div>
  );
}

