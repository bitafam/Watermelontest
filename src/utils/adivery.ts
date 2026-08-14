// Adivery (Yektanet) Ad Integration for Capacitor / Cordova / Web
// Supports Banner Ads and Rewarded Video Ads according to Adivery specifications

export const ADIVERY_APP_ID = "abc3d937-bdb8-4188-9d18-4680bb07d90f";
export const REWARDED_ZONE_ID = "cd218660-4ca4-434c-9029-b8bb9362db8e";
export const BANNER_ZONE_ID = "60da29bc-34f9-4943-a3e0-8dbd0e28611e";

// Global constant to enable or disable In-App Banner Diagnostic Panel
export const BANNER_DEBUG = true;

declare global {
  interface Window {
    Adivery?: any;
    adivery?: any;
    Capacitor?: any;
    cordova?: any;
  }
}

// ----------------------------------------------------
// Banner Diagnostic State & Types
// ----------------------------------------------------
export type BannerAdStatus =
  | "Initializing"
  | "Request Started"
  | "Loading"
  | "Loaded"
  | "Attached"
  | "Visible"
  | "Failed"
  | "Retrying"
  | "Removed";

export interface BannerDebugLogItem {
  id: string;
  time: string;
  type: string;
  message: string;
  status?: string;
  raw?: any;
}

export interface BannerDiagnosticState {
  status: BannerAdStatus;
  zoneId: string;
  position: string;
  size: string;
  targetWidthDp: number;
  targetHeightDp: number;
  targetWidthPx: number;
  targetHeightPx: number;
  density: number;
  requestState: "IDLE" | "IN_PROGRESS" | "SUCCESS" | "FAILED";

  // Step-by-step Pipeline Execution Flags
  jsRequestStarted: boolean;
  cordovaExecCalled: boolean;
  cordovaExecReturned: boolean;
  nativeActionReceived: boolean;
  sdkCallStarted: boolean;
  sdkCallReturned: boolean;
  sdkCallbackReceived: boolean;
  sdkCallbackType: "LOADED" | "ERROR" | "CLICKED" | "TIMEOUT" | "NONE";
  sdkCallbackReason: string | null;
  isTimeout: boolean;
  threadInfo: string | null;
  isMainThread: boolean | null;
  isAdiveryConfigured: boolean;

  // View Inspection
  isLoaded: boolean;
  isAttached: boolean;
  isVisible: boolean;
  viewClass: string;
  viewWidthPx: number;
  viewHeightPx: number;
  viewVisibility: string;
  parentExists: boolean;
  parentChildCount: number;
  rootWidth: number;
  rootHeight: number;
  lastError: string | null;
  retryAttempt: number;
  nextRetrySeconds: number | null;
  events: BannerDebugLogItem[];
}

let bannerDiagState: BannerDiagnosticState = {
  status: "Initializing",
  zoneId: BANNER_ZONE_ID,
  position: "BOTTOM_CENTER",
  size: "320dp × 50dp",
  targetWidthDp: 320,
  targetHeightDp: 50,
  targetWidthPx: 320,
  targetHeightPx: 50,
  density: 1,
  requestState: "IDLE",

  jsRequestStarted: false,
  cordovaExecCalled: false,
  cordovaExecReturned: false,
  nativeActionReceived: false,
  sdkCallStarted: false,
  sdkCallReturned: false,
  sdkCallbackReceived: false,
  sdkCallbackType: "NONE",
  sdkCallbackReason: null,
  isTimeout: false,
  threadInfo: null,
  isMainThread: null,
  isAdiveryConfigured: false,

  isLoaded: false,
  isAttached: false,
  isVisible: false,
  viewClass: "Pending",
  viewWidthPx: 0,
  viewHeightPx: 0,
  viewVisibility: "PENDING",
  parentExists: false,
  parentChildCount: 0,
  rootWidth: 0,
  rootHeight: 0,
  lastError: null,
  retryAttempt: 0,
  nextRetrySeconds: null,
  events: []
};

type BannerDiagListener = (state: BannerDiagnosticState) => void;
const bannerDiagListeners = new Set<BannerDiagListener>();

export const getBannerDiagnosticState = (): BannerDiagnosticState => ({ ...bannerDiagState });

export const subscribeBannerDiagnostic = (listener: BannerDiagListener) => {
  bannerDiagListeners.add(listener);
  listener(getBannerDiagnosticState());
  return () => {
    bannerDiagListeners.delete(listener);
  };
};

const notifyBannerDiag = () => {
  const current = getBannerDiagnosticState();
  bannerDiagListeners.forEach(fn => {
    try {
      fn(current);
    } catch (e) {
      console.error("Banner Diagnostic listener error:", e);
    }
  });
};

const addBannerDebugEvent = (type: string, message: string, raw?: any, statusOverride?: BannerAdStatus) => {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  
  const newLog: BannerDebugLogItem = {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    time: timeStr,
    type,
    message,
    status: statusOverride || bannerDiagState.status,
    raw
  };

  // Retain maximum last 25 events
  const newEvents = [newLog, ...bannerDiagState.events].slice(0, 25);

  bannerDiagState = {
    ...bannerDiagState,
    status: statusOverride || bannerDiagState.status,
    events: newEvents
  };

  notifyBannerDiag();
};

export const clearBannerDebugLogs = () => {
  bannerDiagState = {
    ...bannerDiagState,
    events: []
  };
  notifyBannerDiag();
};

// ----------------------------------------------------
// Platform & Rewarded Ad State (UNCHANGED)
// ----------------------------------------------------

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

// State variables for preloading rewarded ads (100% untouched)
let isPreloading = false;
let isPreloaded = false;
let onAdPreloadedCallback: (() => void) | null = null;

// Track active show ad callbacks (100% untouched)
let activeAdCallbacks: {
  onAdOpened?: () => void;
  onAdClosed?: () => void;
  onAdRewarded?: () => void;
  onAdShowFailed?: (err?: any) => void;
} | null = null;

// Standard Banner Ad state & controls
let isBannerActive = false;
let isBannerLoaded = false;
let isBannerRequestInProgress = false;
let bannerRetryAttempt = 0;
let bannerRetryTimer: any = null;
let bannerCountdownTimer: any = null;
let bannerRefreshTimer: any = null;
let bannerDiagnosticTimeoutTimer: any = null;

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

// Parse JSON safely from event detail or string
const parseEventPayload = (e: any): any => {
  if (!e) return {};
  const target = e.detail !== undefined ? e.detail : (e.data !== undefined ? e.data : e);
  if (typeof target === "string") {
    try {
      return JSON.parse(target);
    } catch {
      return { raw: target };
    }
  }
  return typeof target === "object" ? target : { raw: target };
};

// Register global document & window event listeners for Cordova / Adivery
const registerGlobalEventListeners = () => {
  if (hasRegisteredEvents || typeof window === "undefined") return;
  hasRegisteredEvents = true;

  console.log("Adivery: Registering global Cordova and DOM event listeners...");

  // Handler for JS cordova.exec calling event
  const handleBannerCordovaExecCalling = (e: any) => {
    const data = parseEventPayload(e);
    console.log("Adivery Event: onBannerCordovaExecCalling", data);
    bannerDiagState = {
      ...bannerDiagState,
      cordovaExecCalled: true
    };
    addBannerDebugEvent("cordova_exec_calling", "JS: Calling cordova.exec('Adivery', 'createBanner')", data);
  };

  // Handler for JS cordova.exec returned event
  const handleBannerCordovaExecReturned = (e: any) => {
    const data = parseEventPayload(e);
    console.log("Adivery Event: onBannerCordovaExecReturned", data);
    bannerDiagState = {
      ...bannerDiagState,
      cordovaExecReturned: true
    };
    addBannerDebugEvent("cordova_exec_returned", "JS: cordova.exec('createBanner') returned synchronously", data);
  };

  // Handler for JS cordova.exec error
  const handleBannerCordovaExecError = (e: any) => {
    const data = parseEventPayload(e);
    console.error("Adivery Event: onBannerCordovaExecError", data);
    bannerDiagState = {
      ...bannerDiagState,
      status: "Failed",
      lastError: String(data.error || "cordova.exec error")
    };
    addBannerDebugEvent("cordova_exec_error", `JS: cordova.exec error: ${JSON.stringify(data.error)}`, data, "Failed");
  };

  // Handler for native action received
  const handleBannerNativeActionReceived = (e: any) => {
    const data = parseEventPayload(e);
    console.log("Adivery Event: onBannerNativeActionReceived", data);
    bannerDiagState = {
      ...bannerDiagState,
      nativeActionReceived: true,
      threadInfo: data.thread || "pool-thread",
      isMainThread: data.isMainThread === true,
      isAdiveryConfigured: data.isConfigured === true
    };
    addBannerDebugEvent(
      "native_action",
      `Native: createBanner action received (thread: ${data.thread}, main: ${data.isMainThread})`,
      data
    );
  };

  // Handler for SDK call starting
  const handleSdkCallStarting = (e: any) => {
    const data = parseEventPayload(e);
    console.log("Adivery Event: onSdkCallStarting", data);
    bannerDiagState = {
      ...bannerDiagState,
      sdkCallStarted: true,
      threadInfo: data.thread || bannerDiagState.threadInfo,
      isMainThread: data.isMainThread === true
    };
    addBannerDebugEvent(
      "sdk_call_starting",
      `Native: Adivery.requestBannerAd() starting on thread: ${data.thread}`,
      data
    );
  };

  // Handler for SDK call returned
  const handleSdkCallReturned = (e: any) => {
    const data = parseEventPayload(e);
    console.log("Adivery Event: onSdkCallReturned", data);
    bannerDiagState = {
      ...bannerDiagState,
      sdkCallReturned: true
    };
    addBannerDebugEvent(
      "sdk_call_returned",
      "Native: Adivery.requestBannerAd() invocation completed",
      data
    );
  };

  // Handler for SDK callback received (LOADED / ERROR / CLICKED)
  const handleSdkCallbackReceived = (e: any) => {
    const data = parseEventPayload(e);
    console.log("Adivery Event: onSdkCallbackReceived", data);

    if (bannerDiagnosticTimeoutTimer) {
      clearTimeout(bannerDiagnosticTimeoutTimer);
      bannerDiagnosticTimeoutTimer = null;
    }

    const cbType = data.callbackType || "NONE";
    bannerDiagState = {
      ...bannerDiagState,
      sdkCallbackReceived: true,
      sdkCallbackType: cbType,
      sdkCallbackReason: data.reason || null,
      threadInfo: data.thread || bannerDiagState.threadInfo,
      isMainThread: data.isMainThread === true
    };

    addBannerDebugEvent(
      "sdk_callback",
      `Native Callback: AdiveryBannerCallback.${cbType} (thread: ${data.thread}${data.reason ? ", reason: " + data.reason : ""})`,
      data
    );
  };

  // Handler for native SDK exceptions
  const handleBannerSdkException = (e: any) => {
    const data = parseEventPayload(e);
    console.error("Adivery Event: onBannerSdkException", data);

    if (bannerDiagnosticTimeoutTimer) {
      clearTimeout(bannerDiagnosticTimeoutTimer);
      bannerDiagnosticTimeoutTimer = null;
    }

    bannerDiagState = {
      ...bannerDiagState,
      status: "Failed",
      requestState: "FAILED",
      lastError: `SDK Exception: ${data.errorClass} - ${data.message}`
    };

    addBannerDebugEvent(
      "sdk_exception",
      `Native SDK Exception: ${data.errorClass}: ${data.message}`,
      data,
      "Failed"
    );
  };

  // Handler for SDK configure initialization event
  const handleSdkInitialized = (e: any) => {
    const data = parseEventPayload(e);
    console.log("Adivery Event: onSdkInitialized", data);
    const isConfig = data.isConfigured === true || data.status === "CONFIGURED";
    bannerDiagState = {
      ...bannerDiagState,
      isAdiveryConfigured: isConfig
    };
    addBannerDebugEvent(
      "sdk_initialized",
      `SDK Config: ${data.status} (App ID: ${data.appId || "configured"})`,
      data
    );
  };

  // Handler for banner requested
  const handleBannerRequested = (e: any) => {
    const data = parseEventPayload(e);
    console.log("Adivery Event: onBannerRequested", data);

    bannerDiagState = {
      ...bannerDiagState,
      status: "Request Started",
      requestState: "IN_PROGRESS",
      zoneId: data.zone || BANNER_ZONE_ID,
      position: data.position || "BOTTOM_CENTER",
      size: data.size || "320dp × 50dp",
      targetWidthDp: data.targetWidthDp || 320,
      targetHeightDp: data.targetHeightDp || 50,
      targetWidthPx: data.targetWidthPx || 320,
      targetHeightPx: data.targetHeightPx || 50,
      density: data.density || 1,
      threadInfo: data.thread || bannerDiagState.threadInfo,
      isMainThread: data.isMainThread === true,
      nextRetrySeconds: null
    };

    addBannerDebugEvent("onBannerRequested", `Requesting banner (Zone: ${data.zone || BANNER_ZONE_ID})`, data, "Request Started");
  };

  // Handler for loaded ads (distinguishes Banner vs Rewarded)
  const handleAdLoaded = (e: any) => {
    const data = parseEventPayload(e);
    const rawType = typeof data === "string" ? data : (data.adType || data.type || "");
    const adType = String(rawType).toLowerCase();

    console.log("Adivery Event: onAdLoaded / onBannerLoaded", data);

    if (adType === "banner") {
      // Banner loaded successfully
      isBannerLoaded = true;
      isBannerRequestInProgress = false;
      bannerRetryAttempt = 0;

      if (bannerDiagnosticTimeoutTimer) {
        clearTimeout(bannerDiagnosticTimeoutTimer);
        bannerDiagnosticTimeoutTimer = null;
      }
      if (bannerRetryTimer) {
        clearTimeout(bannerRetryTimer);
        bannerRetryTimer = null;
      }
      if (bannerCountdownTimer) {
        clearInterval(bannerCountdownTimer);
        bannerCountdownTimer = null;
      }

      const viewW = Number(data.viewWidth) || 0;
      const viewH = Number(data.viewHeight) || 0;
      const isVis = data.viewVisibility === "VISIBLE" || data.isVisible === true;
      const isAtt = data.parentExists === true || data.isAttached === true;
      const status: BannerAdStatus = (isAtt && isVis && (viewW > 0 || viewH > 0)) ? "Visible" : (isAtt ? "Attached" : "Loaded");

      bannerDiagState = {
        ...bannerDiagState,
        status,
        requestState: "SUCCESS",
        sdkCallbackReceived: true,
        sdkCallbackType: "LOADED",
        isLoaded: true,
        isAttached: isAtt,
        isVisible: isVis,
        viewClass: data.viewClass || "com.adivery.sdk.views.AdiveryBannerAdView",
        viewWidthPx: viewW,
        viewHeightPx: viewH,
        viewVisibility: data.viewVisibility || (isVis ? "VISIBLE" : "HIDDEN"),
        parentExists: isAtt,
        parentChildCount: Number(data.parentChildCount) || 1,
        rootWidth: Number(data.rootWidth) || 0,
        rootHeight: Number(data.rootHeight) || 0,
        density: Number(data.density) || bannerDiagState.density,
        targetWidthPx: Number(data.targetWidthPx) || bannerDiagState.targetWidthPx,
        targetHeightPx: Number(data.targetHeightPx) || bannerDiagState.targetHeightPx,
        retryAttempt: 0,
        nextRetrySeconds: null
      };

      addBannerDebugEvent("onBannerLoaded", `Banner Loaded & Attached (${viewW}x${viewH}px)`, data, status);
      console.log("Adivery: Banner ad loaded and attached successfully");
      return;
    }

    // Rewarded / Interstitial loaded (100% untouched)
    if (adType === "rewarded" || adType === "rewardvideo" || adType === "") {
      isPreloading = false;
      isPreloaded = true;
      if (onAdPreloadedCallback) onAdPreloadedCallback();
    }
  };

  // Handler for banner attached telemetry
  const handleBannerAttached = (e: any) => {
    const data = parseEventPayload(e);
    console.log("Adivery Event: onBannerAttached", data);

    const viewW = Number(data.viewWidth) || bannerDiagState.viewWidthPx;
    const viewH = Number(data.viewHeight) || bannerDiagState.viewHeightPx;
    const isVis = data.viewVisibility === "VISIBLE" || data.isVisible === true;
    const isAtt = data.parentExists === true || data.isAttached === true;
    const status: BannerAdStatus = (isAtt && isVis) ? "Visible" : "Attached";

    bannerDiagState = {
      ...bannerDiagState,
      status,
      isAttached: isAtt,
      isVisible: isVis,
      viewClass: data.viewClass || bannerDiagState.viewClass,
      viewWidthPx: viewW,
      viewHeightPx: viewH,
      viewVisibility: data.viewVisibility || (isVis ? "VISIBLE" : "HIDDEN"),
      parentExists: isAtt,
      parentChildCount: Number(data.parentChildCount) || bannerDiagState.parentChildCount,
      rootWidth: Number(data.rootWidth) || bannerDiagState.rootWidth,
      rootHeight: Number(data.rootHeight) || bannerDiagState.rootHeight
    };

    addBannerDebugEvent("onBannerAttached", `Banner View Attached (${viewW}x${viewH}px, ${data.viewVisibility || "VISIBLE"})`, data, status);
  };

  // Handler for show failed / request error
  const handleShowFailed = (e: any) => {
    const data = parseEventPayload(e);
    const rawType = typeof data === "string" ? "" : (data.adType || data.type || "");
    const adType = String(rawType).toLowerCase();
    
    // Extract actual raw error without generic fallback
    const rawReason = data.reason || data.message || (typeof data === "string" ? data : "");
    const message = rawReason && rawReason.trim().length > 0 ? rawReason.trim() : "No Ad Available";

    if (adType === "banner") {
      // Handle banner error separately - DO NOT touch Rewarded callbacks!
      isBannerLoaded = false;
      isBannerRequestInProgress = false;
      console.warn("Adivery Banner Event: Failed to load banner ad. Reason:", message);

      if (bannerDiagnosticTimeoutTimer) {
        clearTimeout(bannerDiagnosticTimeoutTimer);
        bannerDiagnosticTimeoutTimer = null;
      }
      if (bannerRetryTimer) clearTimeout(bannerRetryTimer);
      if (bannerCountdownTimer) clearInterval(bannerCountdownTimer);

      bannerRetryAttempt++;
      const backoffDelay = bannerRetryAttempt === 1 ? 5000 : bannerRetryAttempt === 2 ? 10000 : bannerRetryAttempt === 3 ? 30000 : 60000;
      let remainingSecs = Math.round(backoffDelay / 1000);

      bannerDiagState = {
        ...bannerDiagState,
        status: "Failed",
        requestState: "FAILED",
        sdkCallbackReceived: true,
        sdkCallbackType: "ERROR",
        sdkCallbackReason: message,
        isLoaded: false,
        isVisible: false,
        lastError: message,
        retryAttempt: bannerRetryAttempt,
        nextRetrySeconds: remainingSecs
      };

      addBannerDebugEvent("onBannerFailed", `Banner Failed: ${message} (Retry in ${remainingSecs}s)`, data, "Failed");

      // Start Countdown timer for next retry
      bannerCountdownTimer = setInterval(() => {
        remainingSecs--;
        if (remainingSecs <= 0) {
          clearInterval(bannerCountdownTimer);
          bannerCountdownTimer = null;
          bannerDiagState = {
            ...bannerDiagState,
            status: "Retrying",
            nextRetrySeconds: 0
          };
          notifyBannerDiag();
        } else {
          bannerDiagState = {
            ...bannerDiagState,
            status: "Failed",
            nextRetrySeconds: remainingSecs
          };
          notifyBannerDiag();
        }
      }, 1000);

      // Controlled retry with exponential backoff if banner is still requested and not premium
      if (isBannerActive && !isPremiumUser()) {
        console.log(`Adivery Banner: Scheduling retry attempt #${bannerRetryAttempt} in ${backoffDelay / 1000}s...`);
        bannerRetryTimer = setTimeout(() => {
          if (bannerCountdownTimer) {
            clearInterval(bannerCountdownTimer);
            bannerCountdownTimer = null;
          }
          if (isBannerActive && !isPremiumUser()) {
            showStandardBannerAd();
          }
        }, backoffDelay);
      }
      return;
    }

    // Rewarded ad failure handling (100% untouched)
    console.error("Adivery Rewarded Event: onShowFailed", message);
    if (onErrorCallback) {
      onErrorCallback(message);
    }
    
    const cb = activeAdCallbacks?.onAdShowFailed;
    activeAdCallbacks = null;
    isPreloading = false;
    isPreloaded = false;
    if (cb) cb(message);
    
    // Retry preloading rewarded after 10s delay
    setTimeout(() => preloadRewardedAd(), 10000);
  };

  const handleBannerRemoved = (e: any) => {
    const data = parseEventPayload(e);
    console.log("Adivery Banner Event: onBannerRemoved", data);
    isBannerLoaded = false;
    isBannerRequestInProgress = false;

    if (bannerDiagnosticTimeoutTimer) {
      clearTimeout(bannerDiagnosticTimeoutTimer);
      bannerDiagnosticTimeoutTimer = null;
    }

    bannerDiagState = {
      ...bannerDiagState,
      status: "Removed",
      requestState: "IDLE",
      isLoaded: false,
      isAttached: false,
      isVisible: false,
      viewVisibility: "REMOVED",
      nextRetrySeconds: null
    };

    addBannerDebugEvent("onBannerRemoved", "Banner removed from view hierarchy", data, "Removed");
  };

  const handleBannerClicked = (e: any) => {
    const data = parseEventPayload(e);
    console.log("Adivery Banner Event: clicked", data);
    addBannerDebugEvent("onBannerClicked", "Banner Clicked by user", data);
  };

  const handleAdRewarded = (e: any) => {
    const data = parseEventPayload(e);
    console.log("Adivery Event: onAdRewarded", data);
    
    if (activeAdCallbacks?.onAdRewarded) {
      activeAdCallbacks.onAdRewarded();
    }
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
  window.addEventListener("onBannerCordovaExecCalling", handleBannerCordovaExecCalling);
  window.addEventListener("onBannerCordovaExecReturned", handleBannerCordovaExecReturned);
  window.addEventListener("onBannerCordovaExecError", handleBannerCordovaExecError);

  document.addEventListener("onBannerNativeActionReceived", handleBannerNativeActionReceived);
  window.addEventListener("onBannerNativeActionReceived", handleBannerNativeActionReceived);

  document.addEventListener("onSdkCallStarting", handleSdkCallStarting);
  window.addEventListener("onSdkCallStarting", handleSdkCallStarting);

  document.addEventListener("onSdkCallReturned", handleSdkCallReturned);
  window.addEventListener("onSdkCallReturned", handleSdkCallReturned);

  document.addEventListener("onSdkCallbackReceived", handleSdkCallbackReceived);
  window.addEventListener("onSdkCallbackReceived", handleSdkCallbackReceived);

  document.addEventListener("onBannerSdkException", handleBannerSdkException);
  window.addEventListener("onBannerSdkException", handleBannerSdkException);

  document.addEventListener("onSdkInitialized", handleSdkInitialized);
  window.addEventListener("onSdkInitialized", handleSdkInitialized);

  document.addEventListener("onBannerRequested", handleBannerRequested);
  window.addEventListener("onBannerRequested", handleBannerRequested);

  document.addEventListener("onBannerLoaded", handleAdLoaded);
  window.addEventListener("onBannerLoaded", handleAdLoaded);

  document.addEventListener("onBannerAttached", handleBannerAttached);
  window.addEventListener("onBannerAttached", handleBannerAttached);

  document.addEventListener("onAdLoaded", handleAdLoaded);
  window.addEventListener("onAdLoaded", handleAdLoaded);

  document.addEventListener("onBannerFailed", handleShowFailed);
  window.addEventListener("onBannerFailed", handleShowFailed);

  document.addEventListener("onShowFailed", handleShowFailed);
  window.addEventListener("onShowFailed", handleShowFailed);

  document.addEventListener("onBannerRemoved", handleBannerRemoved);
  window.addEventListener("onBannerRemoved", handleBannerRemoved);

  document.addEventListener("onBannerClicked", handleBannerClicked);
  window.addEventListener("onBannerClicked", handleBannerClicked);

  document.addEventListener("onAdRewarded", handleAdRewarded);
  window.addEventListener("onAdRewarded", handleAdRewarded);

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
    console.log("==================================================");
    console.log("Adivery: Initializing native SDK with App ID:", ADIVERY_APP_ID);
    console.log("==================================================");
    window.Adivery.initialize(ADIVERY_APP_ID);
    hasRealSdkInitializedSuccessfully = true;

    bannerDiagState = {
      ...bannerDiagState,
      status: "Initializing",
      isAdiveryConfigured: true
    };
    addBannerDebugEvent("initialize", `Initialized SDK with App ID: ${ADIVERY_APP_ID}`, null, "Initializing");

    // Start preloading rewarded ad (untouched)
    preloadRewardedAd();
    
    // Start banner immediately once native SDK is initialized
    if (!isPremiumUser()) {
      startBannerRefresh();
    }
  } catch (e: any) {
    console.error("Adivery: Exception during initialize()", e);
    hasInitializedReal = false;
    bannerDiagState = {
      ...bannerDiagState,
      status: "Failed",
      lastError: e?.message || "Exception during initialize()"
    };
    addBannerDebugEvent("initialize_error", `Initialize Exception: ${e?.message}`, e, "Failed");
  }
};

// Initialize Simulator for Browser / AI Studio preview
const initSim = (): void => {
  if (hasInitializedSim || hasInitializedReal) return;
  hasInitializedSim = true;
  hasRealSdkInitializedSuccessfully = true;
  registerGlobalEventListeners();
  console.log("Adivery: Web Browser mode - Simulator Initialized with App ID", ADIVERY_APP_ID);
  
  bannerDiagState = {
    ...bannerDiagState,
    status: "Initializing",
    viewClass: "SimulatorWebBanner",
    isAdiveryConfigured: true,
    density: window.devicePixelRatio || 1
  };
  addBannerDebugEvent("initialize_sim", "Simulator initialized in Web Preview", null, "Initializing");

  preloadRewardedAd();
  if (!isPremiumUser()) {
    showStandardBannerAd();
  }
};

// Main entry point for initializing Adivery
export const initializeAdivery = (): void => {
  if (typeof document === "undefined") return;

  registerGlobalEventListeners();

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

// Register preloaded callback (100% untouched)
export const registerPreloadedCallback = (callback: () => void) => {
  onAdPreloadedCallback = callback;
  if (isPreloaded && callback) {
    callback();
  }
};

// Preload Rewarded Video Ad (100% untouched)
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

// Check if rewarded video ad is ready (100% untouched)
export const isRewardedAdReady = (): boolean => {
  return isPreloaded;
};

// Show Rewarded Video Ad (100% untouched)
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

// Simulated Ad Completion helper for Web Browser Simulator (100% untouched)
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

// Show standard banner at the bottom center of the page
export const showStandardBannerAd = (): void => {
  if (isPremiumUser()) {
    console.log("Adivery: User is Premium. Suppressing banner ad.");
    removeStandardBannerAd();
    return;
  }

  isBannerActive = true;

  // Reset pipeline stage flags for a fresh trace
  bannerDiagState = {
    ...bannerDiagState,
    status: "Request Started",
    requestState: "IN_PROGRESS",
    zoneId: BANNER_ZONE_ID,
    jsRequestStarted: true,
    cordovaExecCalled: false,
    cordovaExecReturned: false,
    nativeActionReceived: false,
    sdkCallStarted: false,
    sdkCallReturned: false,
    sdkCallbackReceived: false,
    sdkCallbackType: "NONE",
    sdkCallbackReason: null,
    isTimeout: false,
    lastError: null
  };
  addBannerDebugEvent("requestBanner", `JS showStandardBannerAd: Invoking createBanner for zone: ${BANNER_ZONE_ID}`, null, "Request Started");

  // Start 15s Diagnostic Timeout (purely diagnostic)
  if (bannerDiagnosticTimeoutTimer) {
    clearTimeout(bannerDiagnosticTimeoutTimer);
    bannerDiagnosticTimeoutTimer = null;
  }
  bannerDiagnosticTimeoutTimer = setTimeout(() => {
    if (isBannerRequestInProgress && !bannerDiagState.sdkCallbackReceived) {
      console.warn("Adivery Diagnostic: 15s timeout elapsed with no SDK callback.");
      bannerDiagState = {
        ...bannerDiagState,
        isTimeout: true,
        sdkCallbackType: "TIMEOUT",
        status: "Failed",
        lastError: "SDK Callback Timeout (15s): No response from Adivery SDK (onAdLoaded or onError was not received)"
      };
      addBannerDebugEvent(
        "sdk_timeout",
        "SDK Callback Timeout (15s) - Adivery SDK did not trigger onAdLoaded or onError",
        null,
        "Failed"
      );
    }
  }, 15000);

  if (isNativePlatform()) {
    if (!hasInitializedReal) {
      console.log("Adivery: Banner requested before initialization. Initializing native SDK now...");
      initializeAdivery();
      return;
    }

    if (isBannerRequestInProgress) {
      console.log("Adivery: Banner ad request already in progress, skipping duplicate call.");
      return;
    }

    try {
      isBannerRequestInProgress = true;
      console.log("==================================================");
      console.log("Adivery Banner: Requesting Real Native Banner");
      console.log("  Zone ID:", BANNER_ZONE_ID);
      console.log("  Position: BOTTOM_CENTER (7)");
      console.log("  Size: BANNER_320x50 (1)");
      console.log("==================================================");

      const position = (window.Adivery?.AD_POSITION?.BOTTOM_CENTER !== undefined)
        ? window.Adivery.AD_POSITION.BOTTOM_CENTER
        : 7;
        
      const size = (window.Adivery?.AD_SIZE?.BANNER_320x50 !== undefined)
        ? window.Adivery.AD_SIZE.BANNER_320x50
        : 1;

      window.Adivery.createBanner(
        BANNER_ZONE_ID,
        position,
        size
      );
    } catch (e: any) {
      isBannerRequestInProgress = false;
      if (bannerDiagnosticTimeoutTimer) {
        clearTimeout(bannerDiagnosticTimeoutTimer);
        bannerDiagnosticTimeoutTimer = null;
      }
      console.error("Adivery: Exception calling window.Adivery.createBanner()", e);
      bannerDiagState = {
        ...bannerDiagState,
        status: "Failed",
        requestState: "FAILED",
        lastError: e?.message || "createBanner invocation exception"
      };
      addBannerDebugEvent("createBanner_exception", e?.message || "Exception invoking createBanner", e, "Failed");
    }
  } else {
    // Simulator
    console.log("Adivery Simulator: Bottom banner active (zone:", BANNER_ZONE_ID, ")");
    setTimeout(() => {
      isBannerLoaded = true;
      isBannerRequestInProgress = false;
      if (bannerDiagnosticTimeoutTimer) {
        clearTimeout(bannerDiagnosticTimeoutTimer);
        bannerDiagnosticTimeoutTimer = null;
      }
      bannerDiagState = {
        ...bannerDiagState,
        status: "Visible",
        requestState: "SUCCESS",
        jsRequestStarted: true,
        cordovaExecCalled: true,
        cordovaExecReturned: true,
        nativeActionReceived: true,
        sdkCallStarted: true,
        sdkCallReturned: true,
        sdkCallbackReceived: true,
        sdkCallbackType: "LOADED",
        isLoaded: true,
        isAttached: true,
        isVisible: true,
        viewClass: "SimulatorBannerAdView",
        viewWidthPx: Math.round(320 * (window.devicePixelRatio || 1)),
        viewHeightPx: Math.round(50 * (window.devicePixelRatio || 1)),
        viewVisibility: "VISIBLE",
        parentExists: true,
        parentChildCount: 1,
        rootWidth: window.innerWidth,
        rootHeight: window.innerHeight,
        density: window.devicePixelRatio || 1,
        targetWidthPx: Math.round(320 * (window.devicePixelRatio || 1)),
        targetHeightPx: Math.round(50 * (window.devicePixelRatio || 1)),
        lastError: null,
        nextRetrySeconds: null
      };
      addBannerDebugEvent("sim_loaded", `Simulator Banner Active (${bannerDiagState.viewWidthPx}x${bannerDiagState.viewHeightPx}px)`, null, "Visible");
    }, 600);
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
  if (bannerDiagnosticTimeoutTimer) {
    clearTimeout(bannerDiagnosticTimeoutTimer);
    bannerDiagnosticTimeoutTimer = null;
  }
  if (bannerRetryTimer) {
    clearTimeout(bannerRetryTimer);
    bannerRetryTimer = null;
  }
  if (bannerCountdownTimer) {
    clearInterval(bannerCountdownTimer);
    bannerCountdownTimer = null;
  }

  isBannerActive = false;
  isBannerLoaded = false;
  isBannerRequestInProgress = false;
  bannerRetryAttempt = 0;

  bannerDiagState = {
    ...bannerDiagState,
    status: "Removed",
    requestState: "IDLE",
    isLoaded: false,
    isAttached: false,
    isVisible: false,
    viewVisibility: "REMOVED",
    nextRetrySeconds: null
  };
  addBannerDebugEvent("removeBanner", "Invoked removeStandardBannerAd", null, "Removed");

  if (isNativePlatform()) {
    try {
      console.log("Adivery: Calling window.Adivery.removeBanner()");
      window.Adivery.removeBanner();
    } catch (e) {
      console.error("Adivery: Error calling removeBanner()", e);
    }
  }
};

// Debug trigger to explicitly remove then re-request a banner in clean sequence
export const triggerBannerDebugRequest = (): void => {
  console.log("Adivery Debug: User requested banner test re-fetch");
  removeStandardBannerAd();
  setTimeout(() => {
    showStandardBannerAd();
  }, 350);
};

// Debug trigger to explicitly remove banner
export const triggerBannerDebugRemove = (): void => {
  console.log("Adivery Debug: User requested banner removal");
  removeStandardBannerAd();
};

// Start Refresh Banner Ads every 60 seconds
export const startBannerRefresh = (): void => {
  if (isPremiumUser()) {
    console.log("Adivery: User is Premium. Suppressing banner refresh.");
    removeStandardBannerAd();
    return;
  }

  // Clear any existing refresh interval
  if (bannerRefreshTimer) {
    clearInterval(bannerRefreshTimer);
    bannerRefreshTimer = null;
  }

  // Show banner immediately
  showStandardBannerAd();

  // Schedule auto refresh every 60 seconds (only if banner is loaded and not in error retry)
  bannerRefreshTimer = setInterval(() => {
    if (isPremiumUser()) {
      stopBannerRefresh();
      return;
    }
    if (isBannerActive && !isBannerRequestInProgress && bannerRetryAttempt === 0) {
      console.log("Adivery: Auto-refreshing banner ad (60s cycle)...");
      showStandardBannerAd();
    }
  }, 60000);
};

// Stop Banner Auto Refresh
export const stopBannerRefresh = (): void => {
  if (bannerRefreshTimer) {
    clearInterval(bannerRefreshTimer);
    bannerRefreshTimer = null;
  }
  removeStandardBannerAd();
};
