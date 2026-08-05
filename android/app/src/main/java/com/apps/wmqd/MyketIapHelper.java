package com.apps.wmqd;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import ir.myket.billingclient.util.IabHelper;
import ir.myket.billingclient.util.IabResult;
import ir.myket.billingclient.util.Inventory;
import ir.myket.billingclient.util.Purchase;

public class MyketIapHelper {
    private static final String TAG = "MyketIapHelper";
    private static final String RSA_PUBLIC_KEY = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+21H2+aGGTB7daEX2rm1/dKRKmFEkQ0Ao1tLUx10/1Agl3FvDNhQvQw+q7AIZuKoVDJ8pWGY1Hm+gOmaHpgN94gvS8plu1g87nAC/slx2RXgG+bUjmu+9GlvX5RmsIaD5PjzQkB2KdOQZVWFM1ersnKxQceSAMMnYuQQ2r1eRUQIDAQAB";
    public static final String SKU_FULL_VERSION = "Fullversion";
    public static final int RC_REQUEST = 10001;

    private static IabHelper mHelper;

    public interface BillingSetupListener {
        void onSetupSuccess(boolean isPremium);
        void onSetupFailed(String error);
    }

    public interface PurchaseListener {
        void onPurchaseSuccess();
        void onPurchaseFailed(String error);
    }

    public static void initialize(final Context context, final BillingSetupListener listener) {
        if (mHelper != null) {
            queryPurchases(context, listener);
            return;
        }

        try {
            mHelper = new IabHelper(context.getApplicationContext(), RSA_PUBLIC_KEY);
            mHelper.enableDebugLogging(true);

            mHelper.startSetup(new IabHelper.OnIabSetupFinishedListener() {
                @Override
                public void onIabSetupFinished(IabResult result) {
                    if (result.isSuccess()) {
                        Log.d(TAG, "Myket Billing Service Connected Successfully");
                        queryPurchases(context, listener);
                    } else {
                        Log.e(TAG, "Failed to connect to Myket Billing Service: " + result.getMessage());
                        if (listener != null) {
                            listener.onSetupFailed(result.getMessage());
                        }
                    }
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Exception during Myket Billing Setup", e);
            if (listener != null) {
                listener.onSetupFailed(e.getMessage());
            }
        }
    }

    public static void queryPurchases(final Context context, final BillingSetupListener listener) {
        if (mHelper == null) {
            if (listener != null) {
                listener.onSetupFailed("Billing helper is not initialized");
            }
            return;
        }

        try {
            mHelper.queryInventoryAsync(new IabHelper.QueryInventoryFinishedListener() {
                @Override
                public void onQueryInventoryFinished(IabResult result, Inventory inv) {
                    if (result.isSuccess() && inv != null) {
                        boolean hasPremium = inv.hasPurchase(SKU_FULL_VERSION);
                        Log.d(TAG, "Inventory query success. Premium user: " + hasPremium);
                        MonetizationManager.getInstance(context).setPremiumUser(hasPremium);
                        if (listener != null) {
                            listener.onSetupSuccess(hasPremium);
                        }
                    } else {
                        String errMsg = result != null ? result.getMessage() : "Unknown error querying inventory";
                        Log.e(TAG, "Failed to query inventory: " + errMsg);
                        if (listener != null) {
                            listener.onSetupFailed(errMsg);
                        }
                    }
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Exception during queryInventoryAsync", e);
            if (listener != null) {
                listener.onSetupFailed(e.getMessage());
            }
        }
    }

    public static void launchPurchase(Activity activity, final PurchaseListener listener) {
        if (mHelper == null) {
            if (listener != null) {
                listener.onPurchaseFailed("سرویس پرداخت مایکت آماده نیست. لطفاً مجدداً تلاش کنید.");
            }
            return;
        }

        try {
            mHelper.launchPurchaseFlow(activity, SKU_FULL_VERSION, RC_REQUEST, new IabHelper.OnIabPurchaseFinishedListener() {
                @Override
                public void onIabPurchaseFinished(IabResult result, Purchase info) {
                    if (result.isSuccess() && info != null) {
                        if (SKU_FULL_VERSION.equals(info.getSku())) {
                            Log.d(TAG, "Purchase successful for Fullversion!");
                            MonetizationManager.getInstance(activity).setPremiumUser(true);
                            if (listener != null) {
                                listener.onPurchaseSuccess();
                            }
                        } else {
                            if (listener != null) {
                                listener.onPurchaseFailed("محصول خریداری شده مطابقت ندارد.");
                            }
                        }
                    } else {
                        String errMsg = result != null ? result.getMessage() : "پرداخت لغو شد یا با خطا مواجه گردید.";
                        Log.e(TAG, "Purchase failed: " + errMsg);
                        if (listener != null) {
                            listener.onPurchaseFailed(errMsg);
                        }
                    }
                }
            }, "watermelon_payload_premium");
        } catch (Exception e) {
            Log.e(TAG, "Exception launching purchase flow", e);
            if (listener != null) {
                listener.onPurchaseFailed("خطا در اجرای فرآیند خرید: " + e.getMessage());
            }
        }
    }

    public static boolean handleActivityResult(int requestCode, int resultCode, Intent data) {
        if (mHelper != null) {
            try {
                return mHelper.handleActivityResult(requestCode, resultCode, data);
            } catch (Exception e) {
                Log.e(TAG, "Error handling activity result in billing helper", e);
            }
        }
        return false;
    }

    public static void dispose() {
        if (mHelper != null) {
            try {
                mHelper.dispose();
                Log.d(TAG, "Myket Billing Helper Disposed");
            } catch (Exception e) {
                Log.e(TAG, "Error disposing billing helper", e);
            } finally {
                mHelper = null;
            }
        }
    }
}
