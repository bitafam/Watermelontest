package com.apps.wmqd;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.android.vending.billing.IInAppBillingService;

import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "MyketBilling")
public class MyketBillingPlugin extends Plugin {

    private static final String LOG_TAG = "MyketBillingPlugin";
    private static final int RC_REQUEST = 10001;

    private IInAppBillingService mService;
    private ServiceConnection mServiceConn;
    private boolean isBound = false;
    private PluginCall activePurchaseCall;

    private String base64EncodedPublicKey = "";

    @Override
    public void load() {
        super.load();
        initBillingService();
    }

    private synchronized void initBillingService() {
        if (mService != null || isBound) return;

        mServiceConn = new ServiceConnection() {
            @Override
            public void onServiceDisconnected(ComponentName name) {
                mService = null;
                isBound = false;
                Log.i(LOG_TAG, "Myket billing service disconnected");
            }

            @Override
            public void onServiceConnected(ComponentName name, IBinder service) {
                mService = IInAppBillingService.Stub.asInterface(service);
                isBound = true;
                Log.i(LOG_TAG, "Myket billing service connected successfully!");
            }
        };

        try {
            Context ctx = getContext();
            String[] possibleActions = new String[]{
                "ir.mservices.market.InAppBillingService.BIND",
                "ir.mservices.market.billing.InAppBillingService.BIND",
                "ir.myket.iab.BIND"
            };
            String[] possiblePackages = new String[]{
                "ir.mservices.market",
                "ir.myket"
            };

            for (String pkg : possiblePackages) {
                for (String act : possibleActions) {
                    Intent serviceIntent = new Intent(act);
                    serviceIntent.setPackage(pkg);
                    List<ResolveInfo> intentServices = ctx.getPackageManager().queryIntentServices(serviceIntent, 0);
                    if (intentServices != null && !intentServices.isEmpty()) {
                        boolean bound = ctx.bindService(serviceIntent, mServiceConn, Context.BIND_AUTO_CREATE);
                        if (bound) {
                            Log.i(LOG_TAG, "Successfully bound to Myket service package=" + pkg + " action=" + act);
                            return;
                        }
                    }
                }
            }
        } catch (Exception e) {
            Log.e(LOG_TAG, "Error binding Myket service: " + e.getMessage());
        }
    }

    private boolean isMyketInstalled() {
        PackageManager pm = getContext().getPackageManager();
        try {
            pm.getPackageInfo("ir.mservices.market", 0);
            return true;
        } catch (Exception e) {
            try {
                pm.getPackageInfo("ir.myket", 0);
                return true;
            } catch (Exception e2) {
                return false;
            }
        }
    }

    @PluginMethod
    public void init(PluginCall call) {
        String key = call.getString("publicKey", call.getString("key", ""));
        if (key != null && !key.isEmpty()) {
            this.base64EncodedPublicKey = key;
        }
        initBillingService();
        call.resolve();
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String sku = call.getString("sku", call.getString("productId", "full_version"));
        if (sku == null || sku.isEmpty()) {
            sku = "full_version";
        }
        
        activePurchaseCall = call;

        if (mService == null) {
            initBillingService();
            for (int i = 0; i < 20; i++) {
                if (mService != null) break;
                try {
                    Thread.sleep(100);
                } catch (Exception ignored) {}
            }
        }

        if (mService == null) {
            if (!isMyketInstalled()) {
                call.reject("برنامه مایکت روی دستگاه شما نصب نیست. لطفاً ابتدا برنامه مایکت را نصب نمایید.");
            } else {
                try {
                    Intent myketIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("myket://details?id=" + getContext().getPackageName()));
                    myketIntent.setPackage("ir.mservices.market");
                    myketIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    getContext().startActivity(myketIntent);
                    call.reject("درگاه مایکت باز شد. لطفاً خرید را انجام دهید.");
                } catch (Exception ex) {
                    call.reject("ارتباط با مایکت برقرار نشد. لطفاً از بروز بودن مایکت اطمینان حاصل کنید.");
                }
            }
            return;
        }

        final String finalSku = sku;
        getActivity().runOnUiThread(() -> {
            try {
                String packageName = getContext().getPackageName();
                Bundle buyIntentBundle = mService.getBuyIntent(3, packageName, finalSku, "inapp", "developerPayload_" + System.currentTimeMillis());
                
                int responseCode = getResponseCodeFromBundle(buyIntentBundle);
                if (responseCode == 0) {
                    android.app.PendingIntent pendingIntent = buyIntentBundle.getParcelable("BUY_INTENT");
                    if (pendingIntent != null) {
                        getActivity().startIntentSenderForResult(
                            pendingIntent.getIntentSender(),
                            RC_REQUEST,
                            new Intent(),
                            0, 0, 0, null
                        );
                    } else {
                        call.reject("خرید ناموفق بود: خطای دریافت Intent از مایکت");
                    }
                } else if (responseCode == 7) {
                    JSObject ret = new JSObject();
                    ret.put("purchaseToken", "already_owned");
                    ret.put("orderId", "already_owned");
                    ret.put("sku", finalSku);
                    call.resolve(ret);
                } else {
                    call.reject("خطا در شروع خرید مایکت، کد: " + responseCode);
                }
            } catch (Exception e) {
                Log.e(LOG_TAG, "Error launching purchase flow", e);
                call.reject("خطا در انجام خرید: " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void checkPurchase(PluginCall call) {
        if (mService == null) {
            initBillingService();
            for (int i = 0; i < 15; i++) {
                if (mService != null) break;
                try { Thread.sleep(100); } catch (Exception ignored) {}
            }
        }

        if (mService == null) {
            JSObject res = new JSObject();
            res.put("isPurchased", false);
            res.put("purchased", false);
            call.resolve(res);
            return;
        }

        getBridge().executeOnMainThread(() -> {
            try {
                String packageName = getContext().getPackageName();
                Bundle ownedItems = mService.getPurchases(3, packageName, "inapp", null);
                int response = getResponseCodeFromBundle(ownedItems);
                boolean purchased = false;
                if (response == 0) {
                    ArrayList<String> ownedSkus = ownedItems.getStringArrayList("INAPP_PURCHASE_ITEM_LIST");
                    if (ownedSkus != null && !ownedSkus.isEmpty()) {
                        purchased = true;
                    }
                }
                JSObject res = new JSObject();
                res.put("isPurchased", purchased);
                res.put("purchased", purchased);
                call.resolve(res);
            } catch (Exception e) {
                JSObject res = new JSObject();
                res.put("isPurchased", false);
                res.put("purchased", false);
                call.resolve(res);
            }
        });
    }

    @Override
    protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
        super.handleOnActivityResult(requestCode, resultCode, data);
        if (requestCode == RC_REQUEST) {
            if (activePurchaseCall == null) return;
            if (resultCode == android.app.Activity.RESULT_OK && data != null) {
                int responseCode = data.getIntExtra("RESPONSE_CODE", 0);
                String purchaseData = data.getStringExtra("INAPP_PURCHASE_DATA");

                if (responseCode == 0 && purchaseData != null) {
                    try {
                        org.json.JSONObject jo = new org.json.JSONObject(purchaseData);
                        JSObject ret = new JSObject();
                        ret.put("purchaseToken", jo.optString("purchaseToken", jo.optString("token", "")));
                        ret.put("orderId", jo.optString("orderId", ""));
                        ret.put("sku", jo.optString("productId", jo.optString("sku", "")));
                        activePurchaseCall.resolve(ret);
                    } catch (Exception e) {
                        JSObject ret = new JSObject();
                        ret.put("purchaseToken", purchaseData);
                        activePurchaseCall.resolve(ret);
                    }
                } else {
                    activePurchaseCall.reject("خرید توسط کاربر لغو شد یا ناموفق بود.");
                }
            } else {
                activePurchaseCall.reject("خرید انجام نشد.");
            }
            activePurchaseCall = null;
        }
    }

    private int getResponseCodeFromBundle(Bundle b) {
        if (b == null) return 6;
        Object o = b.get("RESPONSE_CODE");
        if (o == null) return 0;
        if (o instanceof Integer) return ((Integer) o).intValue();
        if (o instanceof Long) return ((Long) o).intValue();
        try {
            return Integer.parseInt(o.toString());
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (isBound && mServiceConn != null) {
            try {
                getContext().unbindService(mServiceConn);
            } catch (Exception ignored) {}
            isBound = false;
        }
    }
}
