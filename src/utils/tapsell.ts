// Tapsell Plus Ad Integration for Capacitor / Web
// Handles standard banners and rewarded videos with real native Cordova support

export const APP_TOKEN = "qgsppfsspbeljgffmmmmnnoinbohsqnpjbijbtgljkgnahoromfeelinjodndfmrntfbhk";
export const BANNER_ZONE_ID = "6a5e6056470fa5291867c9ab";
export const REWARDED_ZONE_ID = "6a5df86f64fbcb2234b83d4e";

declare global {
  interface Window {
    TapsellPlus?: any;
    cordova?: any;
  }
}

// Check if running on native device via Capacitor (window.TapsellPlus is injected)
export const isNativePlatform = (): boolean => {
  if (typeof window === "undefined") return false;
  
  if (!window.TapsellPlus && typeof window.cordova !== "undefined") {
    window.TapsellPlus = {};
  }

  if (window.TapsellPlus) {
    if (!window.TapsellPlus.purchaseFullVersion) {
      window.TapsellPlus.purchaseFullVersion = function(successCallback: any, errorCallback: any) {
        if (window.cordova && window.cordova.exec) {
          window.cordova.exec(
            successCallback,
            (err: any) => {
              // Fallback to TapsellPlusPlugin if TapsellPlus service is not matched
              if (window.cordova && window.cordova.exec) {
                window.cordova.exec(
                  successCallback,
                  errorCallback,
                  'TapsellPlusPlugin',
                  'purchaseFullVersion',
                  []
                );
              } else if (errorCallback) {
                errorCallback(err);
              }
            },
            'TapsellPlus',
            'purchaseFullVersion',
            []
          );
        } else {
          if (errorCallback) errorCallback("Cordova/Capacitor is not available to trigger purchase");
        }
      };
    }
    if (!window.TapsellPlus.checkFullVersion) {
      window.TapsellPlus.checkFullVersion = function(successCallback: any, errorCallback: any) {
        if (window.cordova && window.cordova.exec) {
          window.cordova.exec(
            successCallback,
            (err: any) => {
              if (window.cordova && window.cordova.exec) {
                window.cordova.exec(
                  successCallback,
                  errorCallback,
                  'TapsellPlusPlugin',
                  'checkFullVersion',
                  []
                );
              } else if (errorCallback) {
                errorCallback(err);
              }
            },
            'TapsellPlus',
            'checkFullVersion',
            []
          );
        } else {
          if (errorCallback) errorCallback("Cordova/Capacitor is not available to check version");
        }
      };
    }
  }

  return !!window.TapsellPlus || (typeof window.cordova !== "undefined");
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
    } else {
      // In native environment, wait for deviceready to ensure TapsellPlus is injected
      document.addEventListener("deviceready", () => {
        init();
      }, false);
      
      // Fallback check after 1 second for faster startup or standard browser testing
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

// Standard Banner Ad state
let bannerTimer: any = null;

// Show standard banner at the bottom center of the page
export const showStandardBannerAd = (): void => {
  if (localStorage.getItem("is_full_version") === "true") {
    console.log("Tapsell: Premium active. Standard banner blocked.");
    return;
  }
  if (isNativePlatform()) {
    try {
      console.log("Tapsell: Creating real bottom standard banner (Gravity.BOTTOM)...");
      if (typeof window.TapsellPlus.showBannerAd === "function") {
        window.TapsellPlus.showBannerAd(BANNER_ZONE_ID, 2, 1); // Gravity.BOTTOM, BANNER_320x50
      } else if (typeof window.TapsellPlus.requestBannerAd === "function") {
        window.TapsellPlus.requestBannerAd(BANNER_ZONE_ID, 2, 1);
      } else if (typeof window.TapsellPlus.createBanner === "function") {
        window.TapsellPlus.createBanner(
          BANNER_ZONE_ID,
          2, // 2 = Gravity.BOTTOM
          1  // BANNER_320x50
        );
      }
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
  if (localStorage.getItem("is_full_version") === "true") {
    console.log("Tapsell: Premium active. Banner refresh blocked.");
    return;
  }
  stopBannerRefresh();
  
  // Show first banner
  showStandardBannerAd();

  // Schedule auto refresh every 60 seconds
  bannerTimer = setInterval(() => {
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

// Premium check: returns true if the user has purchased the full version
export const isFullVersionActive = async (): Promise<boolean> => {
  if (isNativePlatform()) {
    return new Promise((resolve) => {
      const handleSuccess = (result: string) => {
        console.log("Myket Check result:", result);
        const active = result === "true";
        localStorage.setItem("is_full_version", active ? "true" : "false");
        resolve(active);
      };

      const handleFallback = () => {
        const win = window as any;
        if (win.cordova && win.cordova.exec) {
          win.cordova.exec(
            handleSuccess,
            () => resolve(localStorage.getItem("is_full_version") === "true"),
            "TapsellPlus",
            "checkFullVersion",
            []
          );
        } else {
          resolve(localStorage.getItem("is_full_version") === "true");
        }
      };

      try {
        if (window.TapsellPlus && typeof window.TapsellPlus.checkFullVersion === "function") {
          window.TapsellPlus.checkFullVersion(handleSuccess, (err: any) => {
            if (err === "Class not found" || (typeof err === "string" && err.includes("not found"))) {
              handleFallback();
            } else {
              resolve(localStorage.getItem("is_full_version") === "true");
            }
          });
        } else {
          handleFallback();
        }
      } catch (e) {
        console.error("Myket check error:", e);
        resolve(localStorage.getItem("is_full_version") === "true");
      }
    });
  } else {
    // Simulator flow
    return localStorage.getItem("is_full_version") === "true";
  }
};

// Purchase full version: triggers purchase flow and returns "success", "already_owned", or throws error
export const purchaseFullVersion = async (): Promise<string> => {
  if (isNativePlatform()) {
    return new Promise((resolve, reject) => {
      const handleSuccess = (result: string) => {
        console.log("Myket purchase result:", result);
        if (result === "success" || result === "already_owned") {
          localStorage.setItem("is_full_version", "true");
        }
        resolve(result);
      };

      const handleError = (error: any) => {
        console.error("Myket purchase error:", error);
        let errMsg = "خطا در فرآیند پرداخت.";
        if (typeof error === "string") {
          if (error === "canceled") {
            errMsg = "پرداخت توسط شما لغو شد.";
          } else {
            errMsg = error;
          }
        } else if (error && error.message) {
          errMsg = error.message;
        }
        reject(new Error(errMsg));
      };

      const tryDirectCordova = (serviceName: string) => {
        const win = window as any;
        if (win.cordova && win.cordova.exec) {
          win.cordova.exec(handleSuccess, (err: any) => {
            if (serviceName === "TapsellPlusPlugin") {
              tryDirectCordova("TapsellPlus");
            } else {
              handleError(err);
            }
          }, serviceName, "purchaseFullVersion", []);
        } else {
          handleError("Cordova exec not available");
        }
      };

      try {
        if (window.TapsellPlus && typeof window.TapsellPlus.purchaseFullVersion === "function") {
          window.TapsellPlus.purchaseFullVersion(
            handleSuccess,
            (error: any) => {
              if (error === "Class not found" || (typeof error === "string" && error.includes("not found"))) {
                tryDirectCordova("TapsellPlusPlugin");
              } else {
                handleError(error);
              }
            }
          );
        } else {
          tryDirectCordova("TapsellPlusPlugin");
        }
      } catch (e) {
        console.error("Myket purchase exception:", e);
        tryDirectCordova("TapsellPlusPlugin");
      }
    });
  } else {
    // Simulator flow: successful simulated purchase after 1 second
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem("is_full_version", "true");
        resolve("success");
      }, 1000);
    });
  }
};
