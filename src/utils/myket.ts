// Myket In-App Billing Integration for Capacitor / Cordova
// Handles Myket market initialization, querying purchases, and buying non-consumables.
// Includes a fully functional web simulator fallback for browser/AI Studio testing.

export const MYKET_PUBLIC_KEY = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+21H2+aGGTB7daEX2rm1/dKRKmFEkQ0Ao1tLUx10/1Agl3FvDNhQvQw+q7AIZuKoVDJ8pWGY1Hm+gOmaHpgN94gvS8plu1g87nAC/slx2RXgG+bUjmu+9GlvX5RmsIaD5PjzQkB2KdOQZVWFM1ersnKxQceSAMMnYuQQ2r1eRUQIDAQAB";
export const PRODUCT_ID = "Fullversion";

declare global {
  interface Window {
    inappbilling?: any;
  }
}

// Check if running on a native platform with the billing plugin installed
export const isBillingSupported = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!window.inappbilling;
};

// Initialize Myket In-App Billing
export const initMyketBilling = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isBillingSupported()) {
      console.log("Myket Billing: Web simulator active (no native plugin found)");
      resolve(true); // Always return true for simulator
      return;
    }

    try {
      console.log("Myket Billing: Initializing native billing client with public key...");
      window.inappbilling.init(
        () => {
          console.log("Myket Billing: Native initialization successful");
          resolve(true);
        },
        (err: any) => {
          console.error("Myket Billing: Native initialization failed", err);
          resolve(false);
        },
        { showLog: true },
        "ir.mservices.market", // Myket market package
        "ir.mservices.market.InAppBillingService.BIND", // Myket binder service intent
        MYKET_PUBLIC_KEY
      );
    } catch (e) {
      console.error("Myket Billing: Exception during native initialization", e);
      resolve(false);
    }
  });
};

// Check if the user already purchased "Fullversion"
export const checkOwnsFullVersion = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check localStorage fallback/cache first
    const cachedPremium = localStorage.getItem("watermelon_premium_user") === "true";
    if (cachedPremium) {
      resolve(true);
      return;
    }

    if (!isBillingSupported()) {
      // For simulator, check localStorage cache
      resolve(cachedPremium);
      return;
    }

    try {
      console.log("Myket Billing: Querying owned purchases from Myket...");
      window.inappbilling.getPurchases(
        (purchases: any[]) => {
          console.log("Myket Billing: Retrieved purchases:", purchases);
          if (Array.isArray(purchases)) {
            const owns = purchases.some((p: any) => {
              if (typeof p === "string") return p === PRODUCT_ID;
              return p && p.productId === PRODUCT_ID;
            });
            
            if (owns) {
              localStorage.setItem("watermelon_premium_user", "true");
              resolve(true);
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        },
        (err: any) => {
          console.error("Myket Billing: Error getting purchases", err);
          resolve(cachedPremium); // Fallback to cached state on error
        }
      );
    } catch (e) {
      console.error("Myket Billing: Exception getting purchases", e);
      resolve(cachedPremium);
    }
  });
};

// Purchase "Fullversion"
export const buyFullVersion = (onSimulatorConfirm?: () => Promise<boolean>): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isBillingSupported()) {
      console.log("Myket Billing: Triggering web simulated purchase...");
      if (onSimulatorConfirm) {
        onSimulatorConfirm().then((confirmed) => {
          if (confirmed) {
            localStorage.setItem("watermelon_premium_user", "true");
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        // Instant buy for simulator if no confirmation callback provided
        localStorage.setItem("watermelon_premium_user", "true");
        resolve(true);
      }
      return;
    }

    try {
      console.log(`Myket Billing: Initiating native purchase for ${PRODUCT_ID}...`);
      window.inappbilling.buy(
        (result: any) => {
          console.log("Myket Billing: Purchase successful", result);
          localStorage.setItem("watermelon_premium_user", "true");
          resolve(true);
        },
        (err: any) => {
          console.error("Myket Billing: Purchase failed", err);
          resolve(false);
        },
        PRODUCT_ID
      );
    } catch (e) {
      console.error("Myket Billing: Exception during purchase", e);
      resolve(false);
    }
  });
};

// Reset premium for testing purposes
export const resetPremiumStatus = (): void => {
  localStorage.removeItem("watermelon_premium_user");
};
