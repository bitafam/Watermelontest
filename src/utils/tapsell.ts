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
  return typeof window.TapsellPlus !== "undefined" && window.TapsellPlus !== null;
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

// Register global document & window event listeners for Cordova / TapsellPlus
const registerGlobalEventListeners = () => {
  if (hasRegisteredEvents || typeof window === "undefined") return;
  hasRegisteredEvents = true;

  console.log("Tapsell: Registering global Cordova and DOM event listeners...");

  const handleInitSuccess = () => {
    console.log("Tapsell Event: onInitializeSuccess received!");
    hasRealSdkInitializedSuccessfully = true;
    
    // Start preloading rewarded ad & start banner refresh
    preloadRewardedAd();
    startBannerRefresh();
  };

  const handleInitFailed = () => {
    console.error("Tapsell Event: onInitializeFailed received.");
    hasRealSdkInitializedSuccessfully = false;
    hasInitializedReal = false; // Allow retry on failure
    if (onErrorCallback) {
      onErrorCallback("اتصال اولیه تپسل با شکست مواجه شد");
    }
  };

  const handleResponse = (e: any) => {
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
  };

  const handleError = (e: any) => {
    const data = e.detail || e.data || e;
    const adType = data.adType || "";
    const message = data.message;

    console.error("Tapsell Event: error", { adType, message });
    if (onErrorCallback && message) {
      onErrorCallback(`خطای دریافت ${adType}: ${message}`);
    }

    const isRewarded = adType.toLowerCase() === "rewardvideo" || adType.toLowerCase() === "rewardedvideo";
    if (isRewarded) {
      isPreloading = false;
      isPreloaded = false;
      // Retry preloading after 15 seconds
      setTimeout(() => preloadRewardedAd(), 15000);
    }
  };

  const handleOpened = (e: any) => {
    const data = e.detail || e.data || e;
    const adType = data.adType || "";
    console.log("Tapsell Event: onOpened", { adType });
    
    const isRewarded = adType.toLowerCase() === "rewardvideo" || adType.toLowerCase() === "rewardedvideo";
    if (isRewarded && activeAdCallbacks?.onAdOpened) {
      activeAdCallbacks.onAdOpened();
    }
  };

  const handleClosed = (e: any) => {
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
  };

  const handleRewarded = (e: any) => {
    const data = e.detail || e.data || e;
    const adType = data.adType || "";
    console.log("Tapsell Event: onRewarded", { adType });
    
    const isRewarded = adType.toLowerCase() === "rewardvideo" || adType.toLowerCase() === "rewardedvideo";
    if (isRewarded && activeAdCallbacks?.onAdRewarded) {
      activeAdCallbacks.onAdRewarded();
    }
  };

  const handleShowError = (e: any) => {
    const data = e.detail || e.data || e;
    const adType = data.adType || "";
    const message = data.message;
    console.error("Tapsell Event: onError", { adType, message });
    
    if (onErrorCallback && message) {
      onErrorCallback(`خطای نمایش ${adType}: ${message}`);
    }
    
    const isRewarded = adType.toLowerCase() === "rewardvideo" || adType.toLowerCase() === "rewardedvideo";
    if (isRewarded) {
      const cb = activeAdCallbacks?.onAdShowFailed;
      activeAdCallbacks = null;
      if (cb) cb(message);
      // Preload next ad immediately
      preloadRewardedAd();
    }
  };

  // Register on document and window for complete safety
  document.addEventListener('onInitializeSuccess', handleInitSuccess);
  window.addEventListener('onInitializeSuccess', handleInitSuccess);

  document.addEventListener('onInitializeFailed', handleInitFailed);
  window.addEventListener('onInitializeFailed', handleInitFailed);

  document.addEventListener('response', handleResponse);
  window.addEventListener('response', handleResponse);

  document.addEventListener('error', handleError);
  window.addEventListener('error', handleError);

  document.addEventListener('onOpened', handleOpened);
  window.addEventListener('onOpened', handleOpened);

  document.addEventListener('onClosed', handleClosed);
  window.addEventListener('onClosed', handleClosed);

  document.addEventListener('onRewarded', handleRewarded);
  window.addEventListener('onRewarded', handleRewarded);

  document.addEventListener('onError', handleShowError);
  window.addEventListener('onError', handleShowError);
};

// Initialize Real Native Tapsell SDK
const initRealSdk = (): void => {
  if (hasInitializedReal) return;
  if (!isNativePlatform()) {
    console.log("Tapsell: window.TapsellPlus not present yet.");
    return;
  }

  hasInitializedReal = true;
  hasInitializedSim = false;
  registerGlobalEventListeners();

  try {
    console.log("Tapsell: Initializing real SDK with token:", APP_TOKEN);
    console.log("Tapsell: window.TapsellPlus methods:", Object.keys(window.TapsellPlus));
    window.TapsellPlus.initialize(APP_TOKEN);

    // Fallback: If onInitializeSuccess event is delayed or not received within 5 seconds,
    // proceed with preloading and banner refresh
    setTimeout(() => {
      if (!hasRealSdkInitializedSuccessfully) {
        console.log("Tapsell Fallback: onInitializeSuccess not received in 5s. Proceeding with fallback init...");
        hasRealSdkInitializedSuccessfully = true;
        preloadRewardedAd();
        startBannerRefresh();
      }
    }, 5000);
  } catch (e) {
    console.error("Tapsell: Exception during initialize()", e);
    hasInitializedReal = false;
  }
};

// Initialize Simulator for Browser Testing
const initSim = (): void => {
  if (hasInitializedSim || hasInitializedReal) return;
  hasInitializedSim = true;
  hasRealSdkInitializedSuccessfully = true;
  console.log("Tapsell: Web Browser mode - Simulator Initialized with token", APP_TOKEN);
  preloadRewardedAd();
};

// Main entry point for initializing Tapsell
export const initializeTapsell = (): void => {
  if (typeof document === "undefined") return;

  // 1. If TapsellPlus is already injected on window, initialize directly
  if (isNativePlatform()) {
    console.log("Tapsell: TapsellPlus already available on window. Initializing...");
    initRealSdk();
    return;
  }

  // 2. If running inside native container (Capacitor/Cordova)
  if (isRealNativeApp()) {
    console.log("Tapsell: Native container detected. Setting up deviceready listener and polling...");
    
    const onDeviceReady = () => {
      console.log("Tapsell: deviceready event triggered");
      console.log("Tapsell: window.TapsellPlus is:", window.TapsellPlus);
      if (isNativePlatform()) {
        initRealSdk();
      }
    };

    document.addEventListener("deviceready", onDeviceReady, false);

    // Also poll every 300ms for up to 10 seconds in case deviceready already fired
    let pollCount = 0;
    const interval = setInterval(() => {
      pollCount++;
      if (isNativePlatform()) {
        console.log("Tapsell: Polling discovered window.TapsellPlus!");
        clearInterval(interval);
        initRealSdk();
      } else if (pollCount >= 30) {
        clearInterval(interval);
        console.log("Tapsell: Polling ended. TapsellPlus plugin not found on window.");
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
    console.log("Tapsell: Preload requested before initialization. Initializing now...");
    initializeTapsell();
    return;
  }

  isPreloading = true;

  if (isNativePlatform()) {
    try {
      console.log("Tapsell: Requesting real rewarded video from zone:", REWARDED_ZONE_ID);
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

      console.log("Tapsell: Displaying real rewarded video with ID:", activeAdId);
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
    if (!hasInitializedReal) {
      console.log("Tapsell: Banner requested before initialization. Initializing now...");
      initializeTapsell();
      return;
    }
    try {
      console.log("Tapsell: Creating real bottom standard banner for zone:", BANNER_ZONE_ID);
      
      // Determine position using SDK constants, default to 7 (BOTTOM_CENTER)
      const position = (window.TapsellPlus?.AD_POSITION?.BOTTOM_CENTER !== undefined)
        ? window.TapsellPlus.AD_POSITION.BOTTOM_CENTER
        : 7; // BOTTOM_CENTER
        
      // Determine size using SDK constants, default to 1 (BANNER_320x50)
      const size = (window.TapsellPlus?.AD_SIZE?.BANNER_320x50 !== undefined)
        ? window.TapsellPlus.AD_SIZE.BANNER_320x50
        : 1; // BANNER_320x50

      console.log(`Tapsell: createBanner(zone=${BANNER_ZONE_ID}, pos=${position}, size=${size})`);
      
      window.TapsellPlus.createBanner(
        BANNER_ZONE_ID,
        position,
        size
      );
    } catch (e) {
      console.error("Tapsell: Error requesting standard banner", e);
    }
  } else {
    console.log("Tapsell Simulator: Displaying bottom standard banner ad");
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
