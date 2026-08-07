// Tapsell Plus Ad Integration for Capacitor / Web
// Handles standard banners and rewarded videos with real native Cordova support

export const APP_TOKEN = "87385b4e-06dc-4524-81dc-ed80044d583f";
export const BANNER_ZONE_ID = "6a7312c02d8bc412b49fd3f0";
export const REWARDED_ZONE_ID = "6a7312aa2d8bc412b49fd3ef";

declare global {
  interface Window {
    TapsellPlus?: any;
    Capacitor?: any;
    cordova?: any;
  }
}

// Check if running on native device via Capacitor (window.TapsellPlus is injected)
export const isNativePlatform = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!window.TapsellPlus;
};

// State variables for preloading rewarded ads
let preloadedAdId: string | null = null;
let isPreloading = false;
let isPreloaded = false;
let onAdPreloadedCallback: (() => void) | null = null;

// Track active show ad callbacks
let activeAdCallbacks: {
  onAdOpened?: () => void;
  onAdClosed?: () => void;
  onAdRewarded?: () => void;
  onAdShowFailed?: (err?: any) => void;
} | null = null;

let hasRegisteredEvents = false;

// Register global document event listeners for Cordova TapsellPlus
const registerGlobalEventListeners = () => {
  if (hasRegisteredEvents || typeof window === "undefined") return;
  hasRegisteredEvents = true;

  console.log("Tapsell: Registering global Cordova event listeners...");

  document.addEventListener('response', (e: any) => {
    const data = e.detail || e.data || e;
    const resId = data.responseId;
    const adType = data.adType || "";

    console.log("Tapsell Event: response", { resId, adType });

    const isRewarded = adType.toLowerCase() === "rewardvideo" || adType.toLowerCase() === "rewardedvideo";
    if (isRewarded) {
      preloadedAdId = resId;
      isPreloading = false;
      isPreloaded = true;
      if (onAdPreloadedCallback) onAdPreloadedCallback();
    }
  });

  document.addEventListener('error', (e: any) => {
    const data = e.detail || e.data || e;
    const adType = data.adType || "";
    const message = data.message;

    console.error("Tapsell Event: error", { adType, message });

    const isRewarded = adType.toLowerCase() === "rewardvideo" || adType.toLowerCase() === "rewardedvideo";
    if (isRewarded) {
      isPreloading = false;
      isPreloaded = false;
      // Retry preloading after 15 seconds
      setTimeout(() => preloadRewardedAd(), 15000);
    }
  });

  document.addEventListener('onOpened', (e: any) => {
    const data = e.detail || e.data || e;
    const adType = data.adType || "";
    console.log("Tapsell Event: onOpened", { adType });
    
    const isRewarded = adType.toLowerCase() === "rewardvideo" || adType.toLowerCase() === "rewardedvideo";
    if (isRewarded && activeAdCallbacks?.onAdOpened) {
      activeAdCallbacks.onAdOpened();
    }
  });

  document.addEventListener('onClosed', (e: any) => {
    const data = e.detail || e.data || e;
    const adType = data.adType || "";
    console.log("Tapsell Event: onClosed", { adType });
    
    const isRewarded = adType.toLowerCase() === "rewardvideo" || adType.toLowerCase() === "rewardedvideo";
    if (isRewarded) {
      const cb = activeAdCallbacks?.onAdClosed;
      activeAdCallbacks = null;
      if (cb) cb();
      // Preload next ad immediately
      preloadRewardedAd();
    }
  });

  document.addEventListener('onRewarded', (e: any) => {
    const data = e.detail || e.data || e;
    const adType = data.adType || "";
    console.log("Tapsell Event: onRewarded", { adType });
    
    const isRewarded = adType.toLowerCase() === "rewardvideo" || adType.toLowerCase() === "rewardedvideo";
    if (isRewarded && activeAdCallbacks?.onAdRewarded) {
      activeAdCallbacks.onAdRewarded();
    }
  });

  document.addEventListener('onError', (e: any) => {
    const data = e.detail || e.data || e;
    const adType = data.adType || "";
    const message = data.message;
    console.error("Tapsell Event: onError", { adType, message });
    
    const isRewarded = adType.toLowerCase() === "rewardvideo" || adType.toLowerCase() === "rewardedvideo";
    if (isRewarded) {
      const cb = activeAdCallbacks?.onAdShowFailed;
      activeAdCallbacks = null;
      if (cb) cb(message);
      // Preload next ad immediately
      preloadRewardedAd();
    }
  });
};

// Check if running on a real native webview wrapper (Capacitor/Cordova)
export const isRealNativeApp = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(
    window.Capacitor || 
    window.cordova || 
    window.location.href.startsWith("capacitor://") || 
    window.location.href.startsWith("http://localhost/")
  );
};

// Initialize Tapsell Plus
export const initializeTapsell = (): void => {
  const init = () => {
    if (isNativePlatform()) {
      registerGlobalEventListeners();
      try {
        console.log("Tapsell: Initializing real SDK with token", APP_TOKEN);
        window.TapsellPlus.initialize(APP_TOKEN);
        // Preload the first rewarded ad immediately
        preloadRewardedAd();
        
        // Auto-load standard banner once initialized successfully on native platform
        setTimeout(() => {
          showStandardBannerAd();
        }, 1500);
      } catch (e) {
        console.error("Tapsell: Exception during initialization", e);
      }
    } else {
      console.log("Tapsell: Web mode - Simulator Initialized with token", APP_TOKEN);
      preloadRewardedAd();
    }
  };

  if (typeof document !== "undefined") {
    if (isNativePlatform()) {
      init();
    } else if (isRealNativeApp()) {
      console.log("Tapsell: Native App webview detected. Strictly waiting for deviceready event...");
      document.addEventListener("deviceready", () => {
        console.log("Tapsell: deviceready fired in native app.");
        init();
      }, false);
    } else {
      // In standard web browser testing, wait 1 second fallback to initialize simulator
      setTimeout(() => {
        if (!hasRegisteredEvents) {
          init();
        }
      }, 1000);
    }
  }
};

// Register preloaded callback
export const registerPreloadedCallback = (callback: () => void) => {
  onAdPreloadedCallback = callback;
  if (isPreloaded && callback) {
    callback();
  }
};

// Preload Rewarded Video Ad
export const preloadRewardedAd = (): void => {
  if (isPreloading || isPreloaded) return;
  isPreloading = true;

  if (isNativePlatform()) {
    try {
      console.log("Tapsell: Preloading real rewarded video...");
      window.TapsellPlus.requestRewardedVideo(REWARDED_ZONE_ID);
    } catch (e) {
      isPreloading = false;
      console.error("Tapsell: Error requesting rewarded ad", e);
    }
  } else {
    // Web Simulator
    console.log("Tapsell Simulator: Loading sponsored video ad...");
    setTimeout(() => {
      preloadedAdId = "mock-rewarded-ad-id";
      isPreloading = false;
      isPreloaded = true;
      console.log("Tapsell Simulator: Video ad is preloaded and ready to show.");
      if (onAdPreloadedCallback) onAdPreloadedCallback();
    }, 2000);
  }
};

// Check if rewarded video ad is ready
export const isRewardedAdReady = (): boolean => {
  return isPreloaded && preloadedAdId !== null;
};

// Show Rewarded Video Ad
export const showRewardedAd = (
  onAdOpened: () => void,
  onAdClosed: () => void,
  onAdRewarded: () => void,
  onAdShowFailed: (err?: any) => void
): void => {
  if (!isPreloaded || !preloadedAdId) {
    onAdShowFailed("Ad not preloaded yet");
    return;
  }

  if (isNativePlatform()) {
    try {
      const activeAdId = preloadedAdId;
      // Reset preload states for the next cycle
      preloadedAdId = null;
      isPreloaded = false;

      // Store callbacks to be executed when native events are received
      activeAdCallbacks = {
        onAdOpened,
        onAdClosed,
        onAdRewarded,
        onAdShowFailed
      };

      console.log("Tapsell: Displaying real rewarded video...", activeAdId);
      window.TapsellPlus.showRewardedVideo(activeAdId);
    } catch (e) {
      console.error("Tapsell: Error showing rewarded ad", e);
      onAdShowFailed(e);
      preloadRewardedAd();
    }
  } else {
    // Simulator flow
    onAdOpened();
  }
};

// Simulated Ad Completion helper for Web Browser Simulator
export const completeSimulatedAd = (
  onAdRewarded: () => void,
  onAdClosed: () => void
): void => {
  preloadedAdId = null;
  isPreloaded = false;
  onAdRewarded();
  onAdClosed();
  // Preload next mock ad
  preloadRewardedAd();
};

// Helper to check if the user is a premium user
export const isPremiumUser = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("watermelon_premium_user") === "true";
};

// Standard Banner Ad state
let bannerTimer: any = null;

// Show standard banner at the bottom center of the page
export const showStandardBannerAd = (): void => {
  if (isPremiumUser()) {
    console.log("Tapsell: User is Premium. Suppressing banner ad.");
    removeStandardBannerAd();
    return;
  }

  if (isNativePlatform()) {
    try {
      console.log("Tapsell: Creating real bottom standard banner...");
      
      // Determine correct position using SDK constants, fallback to 7 (BOTTOM_CENTER) if not defined
      const position = (window.TapsellPlus && window.TapsellPlus.AD_POSITION && window.TapsellPlus.AD_POSITION.BOTTOM_CENTER !== undefined)
        ? window.TapsellPlus.AD_POSITION.BOTTOM_CENTER
        : 7; // BOTTOM_CENTER
        
      // Determine correct size using SDK constants, fallback to 1 (BANNER_320x50) if not defined
      const size = (window.TapsellPlus && window.TapsellPlus.AD_SIZE && window.TapsellPlus.AD_SIZE.BANNER_320x50 !== undefined)
        ? window.TapsellPlus.AD_SIZE.BANNER_320x50
        : 1; // BANNER_320x50

      console.log(`Tapsell: createBanner positions: pos=${position}, size=${size}`);
      
      window.TapsellPlus.createBanner(
        BANNER_ZONE_ID,
        position,
        size
      );
    } catch (e) {
      console.error("Tapsell: Error requesting standard banner", e);
    }
  } else {
    console.log("Tapsell Simulator: Requesting standard banner at bottom center");
  }
};

// Stop/Hide Standard Banner Ad
export const hideStandardBannerAd = (): void => {
  if (isNativePlatform()) {
    try {
      window.TapsellPlus.hideBanner();
    } catch (e) {
      console.error("Tapsell: Error hiding standard banner", e);
    }
  }
};

// Completely remove the standard banner ad from view and memory
export const removeStandardBannerAd = (): void => {
  if (isNativePlatform()) {
    try {
      window.TapsellPlus.removeBanner();
    } catch (e) {
      console.error("Tapsell: Error removing standard banner", e);
    }
  }
};

// Start Refresh Banner Ads every 60 seconds
export const startBannerRefresh = (): void => {
  if (isPremiumUser()) {
    console.log("Tapsell: User is Premium. Suppressing banner refresh.");
    removeStandardBannerAd();
    return;
  }

  stopBannerRefresh();
  
  // Show first banner
  showStandardBannerAd();

  // Schedule auto refresh every 60 seconds
  bannerTimer = setInterval(() => {
    if (isPremiumUser()) {
      stopBannerRefresh();
      return;
    }
    console.log("Tapsell: Refreshing standard banner ad...");
    showStandardBannerAd();
  }, 60000);
};

// Stop Banner Auto Refresh
export const stopBannerRefresh = (): void => {
  if (bannerTimer) {
    clearInterval(bannerTimer);
    bannerTimer = null;
  }
  removeStandardBannerAd();
};
