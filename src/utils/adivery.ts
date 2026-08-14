// Adivery (Yektanet) Ad Integration for Capacitor / Cordova / Web
// Supports Banner Ads and Rewarded Video Ads according to Adivery specifications

export const ADIVERY_APP_ID = "abc3d937-bdb8-4188-9d18-4680bb07d90f";
export const REWARDED_ZONE_ID = "cd218660-4ca4-434c-9029-b8bb9362db8e";
export const BANNER_ZONE_ID = "60da29bc-34f9-4943-a3e0-8dbd0e28611e";

declare global {
  interface Window {
    Adivery?: any;
    adivery?: any;
    Capacitor?: any;
    cordova?: any;
  }
}

// Check if running on native device via Capacitor / Cordova where Adivery is available
export const isNativePlatform = (): boolean => {
  if (typeof window === "undefined") return false;
  return typeof window.Adivery !== "undefined" && window.Adivery !== null;
};

// Check if running on a real native webview wrapper (Capacitor/Cordova)
export const isRealNativeApp = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(
    (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) ||
    window.Capacitor ||
    window.cordova ||
    window.location.href.startsWith("capacitor://") ||
    window.location.href.startsWith("http://localhost/")
  );
};

// State variables for preloading rewarded ads
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
export let hasInitializedReal = false;
export let hasInitializedSim = false;
export let hasRealSdkInitializedSuccessfully = false;

let onErrorCallback: ((msg: string) => void) | null = null;

export const registerErrorCallback = (callback: (msg: string) => void) => {
  onErrorCallback = callback;
};

// Helper to check if the user is a premium user
export const isPremiumUser = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("watermelon_premium_user") === "true";
};

// Register global document & window event listeners for Cordova / Adivery
const registerGlobalEventListeners = () => {
  if (hasRegisteredEvents || typeof window === "undefined") return;
  hasRegisteredEvents = true;

  console.log("Adivery: Registering global Cordova and DOM event listeners...");

  const handleAdLoaded = (e: any) => {
    const data = e.detail || e.data || e || {};
    const adType = (data.adType || "").toLowerCase();
    console.log("Adivery Event: onAdLoaded", data);

    if (adType === "rewarded" || adType === "rewardvideo" || adType === "") {
      isPreloading = false;
      isPreloaded = true;
      if (onAdPreloadedCallback) onAdPreloadedCallback();
    }
  };

  const handleAdRewarded = (e: any) => {
    const data = e.detail || e.data || e || {};
    console.log("Adivery Event: onAdRewarded", data);
    
    if (activeAdCallbacks?.onAdRewarded) {
      activeAdCallbacks.onAdRewarded();
    }
  };

  const handleShowFailed = (e: any) => {
    const data = e.detail || e.data || e || {};
    const message = data.message || "خطا در نمایش تبلیغ ادیوری";
    console.error("Adivery Event: onShowFailed", message);
    
    if (onErrorCallback) {
      onErrorCallback(message);
    }
    
    const cb = activeAdCallbacks?.onAdShowFailed;
    activeAdCallbacks = null;
    isPreloading = false;
    isPreloaded = false;
    if (cb) cb(message);
    
    // Retry preloading after delay
    setTimeout(() => preloadRewardedAd(), 10000);
  };

  const handleAdClosed = (e: any) => {
    console.log("Adivery Event: onAdClosed", e);
    const cb = activeAdCallbacks?.onAdClosed;
    activeAdCallbacks = null;
    isPreloaded = false;
    if (cb) cb();
    
    // Automatically preload next rewarded ad
    preloadRewardedAd();
  };

  // Register on document and window for safety across Capacitor / Cordova
  document.addEventListener("onAdLoaded", handleAdLoaded);
  window.addEventListener("onAdLoaded", handleAdLoaded);

  document.addEventListener("onAdRewarded", handleAdRewarded);
  window.addEventListener("onAdRewarded", handleAdRewarded);

  document.addEventListener("onShowFailed", handleShowFailed);
  window.addEventListener("onShowFailed", handleShowFailed);

  document.addEventListener("onAdClosed", handleAdClosed);
  window.addEventListener("onAdClosed", handleAdClosed);
};

// Initialize Real Native Adivery SDK
const initRealSdk = (): void => {
  if (hasInitializedReal) return;
  if (!isNativePlatform()) {
    console.log("Adivery: window.Adivery not present yet.");
    return;
  }

  hasInitializedReal = true;
  hasInitializedSim = false;
  registerGlobalEventListeners();

  try {
    console.log("Adivery: Initializing native SDK with App ID:", ADIVERY_APP_ID);
    window.Adivery.initialize(ADIVERY_APP_ID);
    hasRealSdkInitializedSuccessfully = true;

    // Start preloading rewarded ad
    preloadRewardedAd();
    
    // Start banner after brief handshake delay
    setTimeout(() => {
      startBannerRefresh();
    }, 1200);
  } catch (e) {
    console.error("Adivery: Exception during initialize()", e);
    hasInitializedReal = false;
  }
};

// Initialize Simulator for Browser / AI Studio preview
const initSim = (): void => {
  if (hasInitializedSim || hasInitializedReal) return;
  hasInitializedSim = true;
  hasRealSdkInitializedSuccessfully = true;
  console.log("Adivery: Web Browser mode - Simulator Initialized with App ID", ADIVERY_APP_ID);
  preloadRewardedAd();
};

// Main entry point for initializing Adivery
export const initializeAdivery = (): void => {
  if (typeof document === "undefined") return;

  // 1. If Adivery is already injected on window, initialize directly
  if (isNativePlatform()) {
    console.log("Adivery: window.Adivery already available. Initializing...");
    initRealSdk();
    return;
  }

  // 2. If running inside native container (Capacitor/Cordova)
  if (isRealNativeApp()) {
    console.log("Adivery: Native container detected. Setting up deviceready listener and polling...");
    
    const onDeviceReady = () => {
      console.log("Adivery: deviceready event triggered");
      if (isNativePlatform()) {
        initRealSdk();
      }
    };

    document.addEventListener("deviceready", onDeviceReady, false);

    // Also poll every 300ms for up to 10 seconds
    let pollCount = 0;
    const interval = setInterval(() => {
      pollCount++;
      if (isNativePlatform()) {
        console.log("Adivery: Polling discovered window.Adivery!");
        clearInterval(interval);
        initRealSdk();
      } else if (pollCount >= 30) {
        clearInterval(interval);
        console.log("Adivery: Polling ended. Adivery plugin not found on window.");
      }
    }, 300);
  } else {
    // 3. Pure web browser - initialize simulator after brief delay
    setTimeout(() => {
      if (!isNativePlatform()) {
        initSim();
      }
    }, 500);
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

  if (isNativePlatform() && !hasInitializedReal) {
    console.log("Adivery: Preload requested before initialization. Initializing now...");
    initializeAdivery();
    return;
  }

  isPreloading = true;

  if (isNativePlatform()) {
    try {
      console.log("Adivery: Requesting real rewarded video from zone:", REWARDED_ZONE_ID);
      window.Adivery.requestRewardedAd(REWARDED_ZONE_ID);
    } catch (e) {
      isPreloading = false;
      console.error("Adivery: Error requesting rewarded ad", e);
    }
  } else {
    // Web Simulator
    console.log("Adivery Simulator: Loading sponsored rewarded video ad...");
    setTimeout(() => {
      isPreloading = false;
      isPreloaded = true;
      console.log("Adivery Simulator: Video ad is preloaded and ready to show.");
      if (onAdPreloadedCallback) onAdPreloadedCallback();
    }, 1500);
  }
};

// Check if rewarded video ad is ready
export const isRewardedAdReady = (): boolean => {
  return isPreloaded;
};

// Show Rewarded Video Ad
export const showRewardedAd = (
  onAdOpened: () => void,
  onAdClosed: () => void,
  onAdRewarded: () => void,
  onAdShowFailed: (err?: any) => void
): void => {
  if (!isPreloaded) {
    onAdShowFailed("تبلیغ هنوز آماده نشده است");
    return;
  }

  if (isNativePlatform()) {
    try {
      // Store callbacks to be executed when native events are received
      activeAdCallbacks = {
        onAdOpened,
        onAdClosed,
        onAdRewarded,
        onAdShowFailed
      };

      console.log("Adivery: Displaying real rewarded video...");
      onAdOpened();
      window.Adivery.showAd();
    } catch (e) {
      console.error("Adivery: Error showing rewarded ad", e);
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
  isPreloaded = false;
  onAdRewarded();
  onAdClosed();
  // Preload next mock ad
  preloadRewardedAd();
};

// Standard Banner Ad state
let bannerTimer: any = null;

// Show standard banner at the bottom center of the page
export const showStandardBannerAd = (): void => {
  if (isPremiumUser()) {
    console.log("Adivery: User is Premium. Suppressing banner ad.");
    removeStandardBannerAd();
    return;
  }

  if (isNativePlatform()) {
    if (!hasInitializedReal) {
      console.log("Adivery: Banner requested before initialization. Initializing now...");
      initializeAdivery();
      return;
    }
    try {
      console.log("Adivery: Creating real bottom banner for zone:", BANNER_ZONE_ID);
      
      // Position: BOTTOM_CENTER (7)
      const position = (window.Adivery?.AD_POSITION?.BOTTOM_CENTER !== undefined)
        ? window.Adivery.AD_POSITION.BOTTOM_CENTER
        : 7;
        
      // Size: BANNER_320x50 (1)
      const size = (window.Adivery?.AD_SIZE?.BANNER_320x50 !== undefined)
        ? window.Adivery.AD_SIZE.BANNER_320x50
        : 1;

      console.log(`Adivery: createBanner(zone=${BANNER_ZONE_ID}, pos=${position}, size=${size})`);
      
      window.Adivery.createBanner(
        BANNER_ZONE_ID,
        position,
        size
      );
    } catch (e) {
      console.error("Adivery: Error requesting standard banner", e);
    }
  } else {
    console.log("Adivery Simulator: Displaying bottom banner ad");
  }
};

// Stop/Hide Standard Banner Ad
export const hideStandardBannerAd = (): void => {
  if (isNativePlatform()) {
    try {
      window.Adivery.hideBanner();
    } catch (e) {
      console.error("Adivery: Error hiding standard banner", e);
    }
  }
};

// Completely remove the standard banner ad from view and memory
export const removeStandardBannerAd = (): void => {
  if (isNativePlatform()) {
    try {
      window.Adivery.removeBanner();
    } catch (e) {
      console.error("Adivery: Error removing standard banner", e);
    }
  }
};

// Start Refresh Banner Ads every 60 seconds
export const startBannerRefresh = (): void => {
  if (isPremiumUser()) {
    console.log("Adivery: User is Premium. Suppressing banner refresh.");
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
    console.log("Adivery: Refreshing banner ad...");
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
