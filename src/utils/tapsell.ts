// Tapsell Plus (Mediation) Real Ad Integration & Myket Billing for Capacitor / Android Native
// Uses Native Tapsell Plus Mediation SDK (Standard Banner & Rewarded Video) and Myket In-App Purchase

export const APP_TOKEN = "qgsppfsspbeljgffmmmmnnoinbohsqnpjbijbtgljkgnahoromfeelinjodndfmrntfbhk";
export const BANNER_ZONE_ID = "6a5e6056470fa5291867c9ab";
export const REWARDED_ZONE_ID = "6a5df86f64fbcb2234b83d4e";

declare global {
  interface Window {
    TapsellPlus?: any;
    cordova?: any;
    Capacitor?: any;
  }
}

// System Logger for Tapsell & Myket Billing
export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warn';
  message: string;
  details?: any;
}

const systemLogs: LogEntry[] = [];
let logListeners: ((logs: LogEntry[]) => void)[] = [];

export const addLog = (type: LogEntry['type'], message: string, details?: any) => {
  const entry: LogEntry = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString('fa-IR'),
    type,
    message,
    details
  };
  systemLogs.unshift(entry);
  if (systemLogs.length > 150) systemLogs.pop();
  console.log(`[${type.toUpperCase()}] ${message}`, details || '');
  logListeners.forEach(fn => fn([...systemLogs]));
};

export const getSystemLogs = (): LogEntry[] => [...systemLogs];

export const subscribeSystemLogs = (fn: (logs: LogEntry[]) => void): (() => void) => {
  logListeners.push(fn);
  fn([...systemLogs]);
  return () => {
    logListeners = logListeners.filter(l => l !== fn);
  };
};

// Check if running on native device via Cordova / Capacitor
export const isNativePlatform = (): boolean => {
  if (typeof window === "undefined") return false;
  const win = window as any;
  return typeof win.cordova !== "undefined" || !!win.Capacitor?.isNativePlatform?.();
};

// Ensure window.TapsellPlus exists and has all bridge methods attached on native Android
const ensureTapsellNativeBridge = () => {
  if (typeof window === "undefined") return;
  const win = window as any;

  if (!win.TapsellPlus) {
    if (win.cordova?.plugins?.TapsellPlus) {
      win.TapsellPlus = win.cordova.plugins.TapsellPlus;
    } else {
      win.TapsellPlus = {};
    }
  }

  if (!win.TapsellPlus._listeners) win.TapsellPlus._listeners = {};
  if (!win.TapsellPlus.on) {
    win.TapsellPlus.on = (evtName: string, cb: any) => {
      if (!win.TapsellPlus._listeners[evtName]) win.TapsellPlus._listeners[evtName] = [];
      win.TapsellPlus._listeners[evtName].push(cb);
    };
  }
  if (!win.TapsellPlus.emit) {
    win.TapsellPlus.emit = (evtName: string, data: any) => {
      if (win.TapsellPlus._listeners?.[evtName]) {
        win.TapsellPlus._listeners[evtName].forEach((cb: any) => {
          try { cb(data); } catch (e) { console.error(e); }
        });
      }
    };
  }

  const execCall = (action: string, args: any[], successCallback?: any, errorCallback?: any) => {
    if (win.cordova && win.cordova.exec) {
      win.cordova.exec(
        successCallback,
        (err: any) => {
          if (win.cordova && win.cordova.exec) {
            win.cordova.exec(successCallback, errorCallback, 'TapsellPlus', action, args);
          } else if (errorCallback) {
            errorCallback(err);
          }
        },
        'TapsellPlusPlugin',
        action,
        args
      );
    } else if (errorCallback) {
      errorCallback("Cordova/Capacitor bridge is not ready");
    }
  };

  // Attach standard methods to window.TapsellPlus according to Tapsell Plus Mediation spec
  if (!win.TapsellPlus.initialize) {
    win.TapsellPlus.initialize = (appKey: string, s?: any, e?: any) => execCall('initialize', [appKey], s, e);
  }
  if (!win.TapsellPlus.requestRewardedVideoAd) {
    win.TapsellPlus.requestRewardedVideoAd = (zoneId: string, s?: any, e?: any) => execCall('requestRewardedVideoAd', [zoneId], s, e);
  }
  if (!win.TapsellPlus.requestRewardedVideo) {
    win.TapsellPlus.requestRewardedVideo = (zoneId: string, s?: any, e?: any) => execCall('requestRewardedVideoAd', [zoneId], s, e);
  }
  if (!win.TapsellPlus.showRewardedVideoAd) {
    win.TapsellPlus.showRewardedVideoAd = (responseId: string, s?: any, e?: any) => execCall('showRewardedVideoAd', [responseId], s, e);
  }
  if (!win.TapsellPlus.showRewardedVideo) {
    win.TapsellPlus.showRewardedVideo = (responseId: string, s?: any, e?: any) => execCall('showRewardedVideoAd', [responseId], s, e);
  }
  if (!win.TapsellPlus.requestStandardBannerAd) {
    win.TapsellPlus.requestStandardBannerAd = (zoneId: string, pos = 2, size = 1, s?: any, e?: any) => execCall('createBanner', [zoneId, pos, size], s, e);
  }
  if (!win.TapsellPlus.showBannerAd) {
    win.TapsellPlus.showBannerAd = (zoneId: string, pos = 2, size = 1, s?: any, e?: any) => execCall('createBanner', [zoneId, pos, size], s, e);
  }
  if (!win.TapsellPlus.createBanner) {
    win.TapsellPlus.createBanner = (zoneId: string, pos = 2, size = 1, s?: any, e?: any) => execCall('createBanner', [zoneId, pos, size], s, e);
  }
  if (!win.TapsellPlus.hideBanner) {
    win.TapsellPlus.hideBanner = (s?: any, e?: any) => execCall('hideBanner', [], s, e);
  }
  if (!win.TapsellPlus.removeBanner) {
    win.TapsellPlus.removeBanner = (s?: any, e?: any) => execCall('removeBanner', [], s, e);
  }
  if (!win.TapsellPlus.purchaseFullVersion) {
    win.TapsellPlus.purchaseFullVersion = (s?: any, e?: any) => execCall('purchaseFullVersion', [], s, e);
  }
  if (!win.TapsellPlus.checkFullVersion) {
    win.TapsellPlus.checkFullVersion = (s?: any, e?: any) => execCall('checkFullVersion', [], s, e);
  }
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

// Register global document & window event listeners for Cordova / Capacitor TapsellPlus
const registerGlobalEventListeners = () => {
  if (hasRegisteredEvents || typeof window === "undefined") return;
  hasRegisteredEvents = true;

  addLog('info', "ثبت شنوندگان رویدادهای Tapsell Plus Mediation در لایه نیتیو اندروید");

  const processedEvents = new Set<string>();
  const isDuplicate = (eventName: string, data: any) => {
    const key = `${eventName}:${JSON.stringify(data || {})}`;
    if (processedEvents.has(key)) return true;
    processedEvents.add(key);
    setTimeout(() => processedEvents.delete(key), 150);
    return false;
  };

  const addUniversalListener = (eventName: string, handler: (e: any) => void) => {
    const listener = (e: any) => {
      const data = e.detail || e.data || e;
      if (isDuplicate(eventName, data)) return;
      handler(e);
    };
    document.addEventListener(eventName, listener);
    window.addEventListener(eventName, listener);
    const win = window as any;
    if (win.TapsellPlus && typeof win.TapsellPlus.on === "function") {
      win.TapsellPlus.on(eventName, (data: any) => listener({ detail: data, data }));
    }
  };

  addUniversalListener('onInitializeSuccess', () => {
    addLog('success', "تپسل پلاس: مقداردهی اولیه SDK نیتیو اندروید با موفقیت انجام شد");
    isPreloading = false;
    preloadRewardedAd();
    if (localStorage.getItem("is_full_version") !== "true") {
      showStandardBannerAd();
    }
  });

  addUniversalListener('onInitializeFailed', (e: any) => {
    addLog('error', "تپسل پلاس: خطا در مقداردهی اولیه SDK نیتیو اندروید", e);
  });

  addUniversalListener('response', (e: any) => {
    if (preloadTimeout) { clearTimeout(preloadTimeout); preloadTimeout = null; }
    const data = e.detail || e.data || e;
    const resId = data.responseId || e.responseId;
    const adType = (data.adType || e.adType || "").toString();

    addLog('info', `تپسل پلاس: پاسخ دریافت شد (${adType}) - ID: ${resId || 'نامشخص'}`, data);

    const isRewarded = !adType || adType.toLowerCase().includes("reward");
    if (isRewarded && resId) {
      preloadedAdId = resId;
      isPreloading = false;
      isPreloaded = true;
      addLog('success', `تپسل پلاس: تبلیغ ویدیویی جایزه‌ای آماده نمایش شد - ResponseId: ${resId}`);
      if (onAdPreloadedCallback) onAdPreloadedCallback();
    }
  });

  addUniversalListener('error', (e: any) => {
    if (preloadTimeout) { clearTimeout(preloadTimeout); preloadTimeout = null; }
    const data = e.detail || e.data || e;
    const adType = (data.adType || e.adType || "").toString();
    const message = data.message || e.message || "خطا در دریافت تبلیغ از شبکه تپسل";

    addLog('error', `تپسل پلاس: خطا در درخواست تبلیغ (${adType}): ${message}`, data);

    const isRewarded = !adType || adType.toLowerCase().includes("reward");
    if (isRewarded) {
      isPreloading = false;
      isPreloaded = false;
      setTimeout(() => preloadRewardedAd(), 8000);
    }
  });

  addUniversalListener('onOpened', (e: any) => {
    const data = e.detail || e.data || e;
    const adType = (data.adType || e.adType || "").toString();
    addLog('info', `تپسل پلاس: تبلیغ ویدیویی نیتیو باز شد (${adType})`);
    
    const isRewarded = !adType || adType.toLowerCase().includes("reward");
    if (isRewarded && activeAdCallbacks?.onAdOpened) {
      activeAdCallbacks.onAdOpened();
    }
  });

  addUniversalListener('onClosed', (e: any) => {
    const data = e.detail || e.data || e;
    const adType = (data.adType || e.adType || "").toString();
    addLog('info', `تپسل پلاس: تبلیغ ویدیویی نیتیو بسته شد (${adType})`);
    
    const isRewarded = !adType || adType.toLowerCase().includes("reward");
    if (isRewarded) {
      const cb = activeAdCallbacks?.onAdClosed;
      activeAdCallbacks = null;
      if (cb) cb();
      isPreloading = false;
      isPreloaded = false;
      preloadedAdId = null;
      preloadRewardedAd();
    }
  });

  addUniversalListener('onRewarded', (e: any) => {
    const data = e.detail || e.data || e;
    const adType = (data.adType || e.adType || "").toString();
    addLog('success', `تپسل پلاس: پاداش تبلیغ ویدیویی به کاربر اعطا شد (${adType})`);
    
    const isRewarded = !adType || adType.toLowerCase().includes("reward");
    if (isRewarded && activeAdCallbacks?.onAdRewarded) {
      activeAdCallbacks.onAdRewarded();
    }
  });

  addUniversalListener('onError', (e: any) => {
    const data = e.detail || e.data || e;
    const adType = (data.adType || e.adType || "").toString();
    const message = data.message || e.message;
    addLog('error', `تپسل پلاس: خطا در نمایش تبلیغ (${adType}): ${message}`);
    
    const isRewarded = !adType || adType.toLowerCase().includes("reward");
    if (isRewarded) {
      const cb = activeAdCallbacks?.onAdShowFailed;
      activeAdCallbacks = null;
      if (cb) cb(message);
      isPreloading = false;
      isPreloaded = false;
      preloadedAdId = null;
      preloadRewardedAd();
    }
  });
};

let hasInitializedTapsell = false;

// Initialize Tapsell Plus SDK
export const initializeTapsell = (): void => {
  const runInit = () => {
    if (hasInitializedTapsell) return;

    if (isNativePlatform()) {
      ensureTapsellNativeBridge();
      registerGlobalEventListeners();
      hasInitializedTapsell = true;
      try {
        addLog('info', `تپسل پلاس: راه اندازی SDK نیتیو با APP_TOKEN...`, APP_TOKEN.substring(0, 10) + '...');
        if (window.TapsellPlus && typeof window.TapsellPlus.initialize === "function") {
          window.TapsellPlus.initialize(APP_TOKEN);
        }
      } catch (e) {
        hasInitializedTapsell = false;
        addLog('error', "تپسل پلاس: استثنا در زمان مقداردهی اولیه", e);
      }
    } else {
      hasInitializedTapsell = true;
      addLog('info', "برنامه در حال اجرا در محیط وب است. تبلیغات نیتیو تپسل روی دستگاه اندروید اجرا می‌شوند.");
    }
  };

  if (typeof document === "undefined") return;

  if (isNativePlatform()) {
    document.addEventListener("deviceready", runInit, { once: true });
    runInit();
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (hasInitializedTapsell || attempts > 15) {
        clearInterval(interval);
      } else {
        runInit();
      }
    }, 200);
  } else {
    runInit();
  }
};

// Register preloaded callback
export const registerPreloadedCallback = (callback: () => void) => {
  onAdPreloadedCallback = callback;
  if (isPreloaded && callback) {
    callback();
  }
};

let preloadTimeout: any = null;

// Preload Rewarded Video Ad on Native Android
export const preloadRewardedAd = (): void => {
  if (localStorage.getItem("is_full_version") === "true") {
    addLog('info', "نسخه کامل فعال است؛ پیش‌بارگذاری تبلیغ انجام نشد.");
    return;
  }
  if (isPreloading || isPreloaded) return;
  isPreloading = true;

  if (preloadTimeout) {
    clearTimeout(preloadTimeout);
    preloadTimeout = null;
  }

  preloadTimeout = setTimeout(() => {
    if (isPreloading && !isPreloaded) {
      addLog('warn', "تپسل پلاس: مهلت پیش‌بارگذاری تمام شد؛ امکان درخواست مجدد فعال شد.");
      isPreloading = false;
    }
  }, 15000);

  if (isNativePlatform()) {
    ensureTapsellNativeBridge();
    try {
      addLog('info', "تپسل پلاس: درخواست پیش‌بارگذاری ویدیو جایزه‌ای...", REWARDED_ZONE_ID);
      if (window.TapsellPlus && typeof window.TapsellPlus.requestRewardedVideoAd === "function") {
        window.TapsellPlus.requestRewardedVideoAd(REWARDED_ZONE_ID);
      } else if (window.TapsellPlus && typeof window.TapsellPlus.requestRewardedVideo === "function") {
        window.TapsellPlus.requestRewardedVideo(REWARDED_ZONE_ID);
      }
    } catch (e) {
      isPreloading = false;
      if (preloadTimeout) { clearTimeout(preloadTimeout); preloadTimeout = null; }
      addLog('error', "تپسل پلاس: استثنا در درخواست پیش‌بارگذاری ویدیو", e);
    }
  } else {
    isPreloading = false;
    isPreloaded = false;
  }
};

// Check if rewarded video ad is ready
export const isRewardedAdReady = (): boolean => {
  return isPreloaded && preloadedAdId !== null;
};

// Request live and show Rewarded Video Ad
export const requestAndShowRewardedAd = (
  onAdOpened: () => void,
  onAdClosed: () => void,
  onAdRewarded: () => void,
  onAdShowFailed: (err?: any) => void
): void => {
  if (localStorage.getItem("is_full_version") === "true") {
    onAdRewarded();
    onAdClosed();
    return;
  }

  if (isRewardedAdReady()) {
    showRewardedAd(onAdOpened, onAdClosed, onAdRewarded, onAdShowFailed);
    return;
  }

  if (!isNativePlatform()) {
    // In browser preview, fulfill reward directly without fake ad video overlays
    onAdRewarded();
    onAdClosed();
    return;
  }

  addLog('info', "ویدیو از قبل آماده نبود؛ درخواست آنلاین تبلیغ ویدیویی تپسل...");

  let timeoutTimer: any = null;
  let hasHandled = false;

  const cleanup = () => {
    if (timeoutTimer) clearTimeout(timeoutTimer);
  };

  const handleSuccess = () => {
    if (hasHandled) return;
    hasHandled = true;
    cleanup();
    showRewardedAd(onAdOpened, onAdClosed, onAdRewarded, onAdShowFailed);
  };

  const handleFailure = (errReason: any) => {
    if (hasHandled) return;
    hasHandled = true;
    cleanup();
    addLog('warn', "عدم دریافت تبلیغ ویدیویی زنده در مهلت تعیین شده", errReason);
    onAdShowFailed(errReason);
  };

  const checkInterval = setInterval(() => {
    if (isRewardedAdReady()) {
      clearInterval(checkInterval);
      handleSuccess();
    }
  }, 300);

  timeoutTimer = setTimeout(() => {
    clearInterval(checkInterval);
    if (!hasHandled) {
      handleFailure("تایم‌اوت دریافت تبلیغ ویدیویی تپسل");
    }
  }, 10000);

  isPreloading = false;
  preloadRewardedAd();
};

// Show Rewarded Video Ad
export const showRewardedAd = (
  onAdOpened: () => void,
  onAdClosed: () => void,
  onAdRewarded: () => void,
  onAdShowFailed: (err?: any) => void
): void => {
  if (!isPreloaded || !preloadedAdId) {
    onAdShowFailed("ویدیو تبلیغاتی هنوز آماده نشده است");
    return;
  }

  if (isNativePlatform()) {
    try {
      const activeAdId = preloadedAdId;
      preloadedAdId = null;
      isPreloaded = false;

      activeAdCallbacks = {
        onAdOpened,
        onAdClosed,
        onAdRewarded,
        onAdShowFailed
      };

      addLog('info', `تپسل پلاس: دستور نمایش ویدیو جایزه‌ای نیتیو با ID: ${activeAdId}`);
      if (window.TapsellPlus && typeof window.TapsellPlus.showRewardedVideoAd === "function") {
        window.TapsellPlus.showRewardedVideoAd(activeAdId);
      } else if (window.TapsellPlus && typeof window.TapsellPlus.showRewardedVideo === "function") {
        window.TapsellPlus.showRewardedVideo(activeAdId);
      }
    } catch (e) {
      addLog('error', "تپسل پلاس: استثنا در فراخوانی showRewardedVideo", e);
      onAdShowFailed(e);
      preloadRewardedAd();
    }
  } else {
    onAdRewarded();
    onAdClosed();
  }
};

// Show standard banner at the bottom center of the page across all screens via Native Android SDK
export const showStandardBannerAd = (): void => {
  if (localStorage.getItem("is_full_version") === "true") {
    addLog('info', "نسخه کامل فعال است؛ نمایش تبلیغ بنری لغو شد.");
    return;
  }
  if (isNativePlatform()) {
    try {
      addLog('info', "تپسل پلاس: درخواست ساخت تبلیغ بنری استاندارد در پایین صفحه (Gravity.BOTTOM)...");
      ensureTapsellNativeBridge();
      if (typeof window.TapsellPlus.requestStandardBannerAd === "function") {
        window.TapsellPlus.requestStandardBannerAd(BANNER_ZONE_ID, 2, 1);
      } else if (typeof window.TapsellPlus.showBannerAd === "function") {
        window.TapsellPlus.showBannerAd(BANNER_ZONE_ID, 2, 1);
      } else if (typeof window.TapsellPlus.createBanner === "function") {
        window.TapsellPlus.createBanner(BANNER_ZONE_ID, 2, 1);
      }
    } catch (e) {
      addLog('error', "تپسل پلاس: استثنا در درخواست تبلیغ بنری", e);
    }
  } else {
    addLog('info', "تپسل پلاس: بنر استاندارد روی دستگاه اندروید در پایین صفحه چسبیده نمایش داده می‌شود.");
  }
};

// Stop/Hide Standard Banner Ad
export const hideStandardBannerAd = (): void => {
  if (isNativePlatform()) {
    try {
      addLog('info', "تپسل پلاس: مخفی‌سازی بنر استاندارد");
      if (window.TapsellPlus && typeof window.TapsellPlus.hideBanner === "function") {
        window.TapsellPlus.hideBanner();
      }
    } catch (e) {
      addLog('error', "تپسل پلاس: خطا در مخفی‌سازی بنر", e);
    }
  }
};

// Completely remove the standard banner ad from view and memory
export const removeStandardBannerAd = (): void => {
  if (isNativePlatform()) {
    try {
      addLog('info', "تپسل پلاس: حذف کامل بنر استاندارد از حافظه");
      if (window.TapsellPlus && typeof window.TapsellPlus.removeBanner === "function") {
        window.TapsellPlus.removeBanner();
      }
    } catch (e) {
      addLog('error', "تپسل پلاس: خطا در حذف بنر", e);
    }
  }
};

let bannerTimer: any = null;

// Start Refresh Banner Ads every 60 seconds
export const startBannerRefresh = (): void => {
  if (localStorage.getItem("is_full_version") === "true") {
    return;
  }
  stopBannerRefresh();
  
  showStandardBannerAd();

  bannerTimer = setInterval(() => {
    addLog('info', "تپسل پلاس: بازنشانی/بروزرسانی خودکار بنر استاندارد...");
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
        addLog('info', `مایکت: استعلام وضعیت خرید: ${result}`);
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
        addLog('error', "مایکت: خطا در استعلام خرید", e);
        resolve(localStorage.getItem("is_full_version") === "true");
      }
    });
  } else {
    return localStorage.getItem("is_full_version") === "true";
  }
};

// Purchase full version: triggers purchase flow and returns "success", "already_owned", or throws error
export const purchaseFullVersion = async (): Promise<string> => {
  if (isNativePlatform()) {
    return new Promise((resolve, reject) => {
      const handleSuccess = (result: string) => {
        addLog('success', `مایکت: نتیجه فرایند پرداخت: ${result}`);
        if (result === "success" || result === "already_owned") {
          localStorage.setItem("is_full_version", "true");
        }
        resolve(result);
      };

      const handleError = (error: any) => {
        addLog('error', "مایکت: خطا یا انصراف در فرایند پرداخت", error);
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
        addLog('info', "مایکت: ارسال درخواست شروع درگاه خرید درون‌برنامه‌ای...");
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
        addLog('error', "مایکت: استثنا در فراخوانی درگاه خرید", e);
        tryDirectCordova("TapsellPlusPlugin");
      }
    });
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem("is_full_version", "true");
        addLog('success', "پرداخت: خرید نسخه کامل انجام شد.");
        resolve("success");
      }, 1000);
    });
  }
};
