// Tapsell Plus Ad Integration for Capacitor / Web
// Handles standard banners and rewarded videos with browser mock support

export const APP_TOKEN = "qgsppfsspbeljgffmmmmnnoinbohsqnpjbijbtgljkgnahoromfeelinjodndfmrntfbhk";
export const BANNER_ZONE_ID = "6a5e6056470fa5291867c9ab";
export const REWARDED_ZONE_ID = "6a5df86f64fbcb2234b83d4e";

declare global {
  interface Window {
    TapsellPlus?: any;
  }
}

// Check if running on native device via Capacitor
export const isNativePlatform = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!window.TapsellPlus;
};

// State variables for preloading rewarded ads
let preloadedAdId: string | null = null;
let isPreloading = false;
let isPreloaded = false;
let onAdPreloadedCallback: (() => void) | null = null;

// Initialize Tapsell Plus
export const initializeTapsell = (): void => {
  if (isNativePlatform()) {
    try {
      window.TapsellPlus.initialize(
        APP_TOKEN,
        () => {
          console.log("Tapsell: SDK Initialized successfully");
          // Preload the first rewarded ad immediately
          preloadRewardedAd();
        },
        (err: any) => {
          console.error("Tapsell: SDK Initialization failed", err);
        }
      );
    } catch (e) {
      console.error("Tapsell: Exception during initialization", e);
    }
  } else {
    console.log("Tapsell: Web mode - Simulator Initialized with token", APP_TOKEN);
    // Simulate preloading rewarded ad in web browser
    preloadRewardedAd();
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
      window.TapsellPlus.requestRewardedVideo(
        REWARDED_ZONE_ID,
        (adId: string) => {
          preloadedAdId = adId;
          isPreloading = false;
          isPreloaded = true;
          console.log("Tapsell: Rewarded video preloaded", adId);
          if (onAdPreloadedCallback) onAdPreloadedCallback();
        },
        (err: any) => {
          isPreloading = false;
          isPreloaded = false;
          console.error("Tapsell: Rewarded video preload failed", err);
          // Retry preloading after 15 seconds
          setTimeout(() => preloadRewardedAd(), 15000);
        }
      );
    } catch (e) {
      isPreloading = false;
      console.error("Tapsell: Error preloading ad", e);
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
    onAdShowFailed("Ad not preloaded");
    return;
  }

  if (isNativePlatform()) {
    try {
      const activeAdId = preloadedAdId;
      // Reset state so next ad can be preloaded
      preloadedAdId = null;
      isPreloaded = false;

      window.TapsellPlus.showAd(
        activeAdId,
        () => {
          console.log("Tapsell: Rewarded video opened");
          onAdOpened();
        },
        () => {
          console.log("Tapsell: Rewarded video closed");
          onAdClosed();
          // Preload next ad immediately
          preloadRewardedAd();
        },
        () => {
          console.log("Tapsell: Rewarded video completed successfully! Reward earned.");
          onAdRewarded();
        },
        (err: any) => {
          console.error("Tapsell: Rewarded video show failed", err);
          onAdShowFailed(err);
          // Preload next ad immediately
          preloadRewardedAd();
        }
      );
    } catch (e) {
      console.error("Tapsell: Error showing ad", e);
      onAdShowFailed(e);
      preloadRewardedAd();
    }
  } else {
    // Simulator flow - handled in UI component
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
let activeBannerId: string | null = null;
let bannerTimer: any = null;

// Show standard banner at the bottom of the page
export const showStandardBannerAd = (): void => {
  if (isNativePlatform()) {
    try {
      // Hide active banner first if exists
      if (activeBannerId) {
        window.TapsellPlus.hideStandardBanner(
          () => {},
          () => {}
        );
      }

      const bannerType = 1; // BANNER_320x50
      const gravity = 2; // GRAVITY_BOTTOM

      window.TapsellPlus.requestStandardBanner(
        BANNER_ZONE_ID,
        bannerType,
        (adId: string) => {
          activeBannerId = adId;
          window.TapsellPlus.showStandardBanner(
            adId,
            gravity,
            () => {
              console.log("Tapsell: Standard banner shown at bottom");
            },
            (err: any) => {
              console.error("Tapsell: Show standard banner failed", err);
            }
          );
        },
        (err: any) => {
          console.error("Tapsell: Request standard banner failed", err);
        }
      );
    } catch (e) {
      console.error("Tapsell: Error requesting standard banner", e);
    }
  } else {
    console.log("Tapsell Simulator: Requesting standard banner at bottom");
  }
};

// Start Refresh Banner Ads every 60 seconds
export const startBannerRefresh = (): void => {
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
};
