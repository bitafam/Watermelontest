package com.apps.wmqd;

import android.app.Activity;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import ir.tapsell.plus.TapsellPlus;
import ir.tapsell.plus.TapsellPlusBannerType;
import ir.tapsell.plus.TapsellPlusInitListener;
import ir.tapsell.plus.listener.AdRequestCallback;
import ir.tapsell.plus.listener.AdShowListener;
import ir.tapsell.plus.model.AdNetworkError;
import ir.tapsell.plus.model.AdNetworks;
import ir.tapsell.plus.model.TapsellPlusAdModel;

public class TapsellAdHelper {
    private static final String TAG = "TapsellAdHelper";
    private static final String APP_KEY = "87385b4e-06dc-4524-81dc-ed80044d583f";
    private static final String ZONE_REWARDED = "6a7312aa2d8bc412b49fd3ef";
    private static final String ZONE_BANNER = "6a7312c02d8bc412b49fd3f0";

    public interface RewardedAdListener {
        void onAdRewarded();
        void onAdTimeoutOrFailed();
    }

    public static void initialize(Context context) {
        try {
            TapsellPlus.initialize(context, APP_KEY, new TapsellPlusInitListener() {
                @Override
                public void onInitialized() {
                    Log.d(TAG, "Tapsell SDK Initialized Successfully");
                }

                @Override
                public void onError(String error) {
                    Log.e(TAG, "Failed to initialize Tapsell SDK: " + error);
                }

                @Override
                public void onInitializeFailed(AdNetworks adNetworks, AdNetworkError error) {
                    Log.e(TAG, "Tapsell SDK Initialization Failed: adNetworks = " + adNetworks + ", error = " + error);
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Failed to initialize Tapsell SDK", e);
        }
    }

    public static void loadBanner(final Activity activity, final ViewGroup container) {
        if (MonetizationManager.getInstance(activity).isPremiumUser()) {
            container.removeAllViews();
            container.setVisibility(View.GONE);
            return;
        }

        try {
            TapsellPlus.requestStandardBanner(activity, ZONE_BANNER, TapsellPlusBannerType.BANNER_320x50, new AdRequestCallback() {
                @Override
                public void onResponse(String responseId) {
                    if (activity.isFinishing() || activity.isDestroyed()) return;
                    if (MonetizationManager.getInstance(activity).isPremiumUser()) {
                        container.removeAllViews();
                        container.setVisibility(View.GONE);
                        return;
                    }
                    try {
                        container.removeAllViews();
                        container.setVisibility(View.VISIBLE);
                        TapsellPlus.showStandardBanner(activity, responseId, container);
                        Log.d(TAG, "Banner Ad Displayed Successfully");
                    } catch (Exception e) {
                        Log.e(TAG, "Error displaying banner ad", e);
                    }
                }

                @Override
                public void onFailed(String error) {
                    Log.e(TAG, "Failed to request banner ad: " + error);
                    container.setVisibility(View.GONE);
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error in requesting banner ad", e);
        }
    }

    public static void destroyBanner(ViewGroup container) {
        if (container != null) {
            try {
                container.removeAllViews();
                container.setVisibility(View.GONE);
                Log.d(TAG, "Banner Ad Container Cleared & Hidden");
            } catch (Exception e) {
                Log.e(TAG, "Error clearing banner container", e);
            }
        }
    }

    public static void requestRewardedAd(final Activity activity, final RewardedAdListener listener, final View loadingIndicator) {
        if (MonetizationManager.getInstance(activity).isPremiumUser()) {
            listener.onAdRewarded();
            return;
        }

        // Show styling loading indicator if available
        if (loadingIndicator != null) {
            loadingIndicator.setVisibility(View.VISIBLE);
        }

        final boolean[] adLoaded = {false};
        final boolean[] timedOut = {false};
        final Handler handler = new Handler(Looper.getMainLooper());

        // Timeout Fallback: 6 seconds
        final Runnable timeoutRunnable = new Runnable() {
            @Override
            public void run() {
                if (!adLoaded[0]) {
                    timedOut[0] = true;
                    Log.w(TAG, "Rewarded ad request timed out. Proceeding to fallback logic.");
                    if (loadingIndicator != null) {
                        loadingIndicator.setVisibility(View.GONE);
                    }
                    listener.onAdTimeoutOrFailed();
                }
            }
        };
        handler.postDelayed(timeoutRunnable, 6000);

        try {
            TapsellPlus.requestRewardedVideo(activity, ZONE_REWARDED, new AdRequestCallback() {
                @Override
                public void onResponse(final String responseId) {
                    handler.removeCallbacks(timeoutRunnable);
                    if (timedOut[0]) return;
                    adLoaded[0] = true;

                    if (activity.isFinishing() || activity.isDestroyed()) {
                        if (loadingIndicator != null) {
                            loadingIndicator.setVisibility(View.GONE);
                        }
                        return;
                    }

                    // Hide loading indicator before showing the ad
                    if (loadingIndicator != null) {
                        loadingIndicator.setVisibility(View.GONE);
                    }

                    try {
                        TapsellPlus.showRewardedVideo(activity, responseId, new AdShowListener() {
                            @Override
                            public void onOpened(TapsellPlusAdModel adModel) {
                                Log.d(TAG, "Rewarded video opened");
                            }

                            @Override
                            public void onClosed(TapsellPlusAdModel adModel) {
                                Log.d(TAG, "Rewarded video closed");
                            }

                            @Override
                            public void onRewarded(TapsellPlusAdModel adModel) {
                                Log.d(TAG, "Rewarded video completed. Reward granted!");
                                listener.onAdRewarded();
                            }

                            @Override
                            public void onError(TapsellPlusAdModel adModel, String error) {
                                Log.e(TAG, "Error showing rewarded video: " + error);
                                listener.onAdTimeoutOrFailed();
                            }
                        });
                    } catch (Exception e) {
                        Log.e(TAG, "Exception during showRewardedVideo", e);
                        listener.onAdTimeoutOrFailed();
                    }
                }

                @Override
                public void onFailed(String error) {
                    handler.removeCallbacks(timeoutRunnable);
                    if (timedOut[0]) return;
                    adLoaded[0] = true;

                    Log.e(TAG, "Failed to load rewarded ad: " + error + ". Invoking fallback.");
                    if (loadingIndicator != null) {
                        loadingIndicator.setVisibility(View.GONE);
                    }
                    listener.onAdTimeoutOrFailed();
                }
            });
        } catch (Exception e) {
            handler.removeCallbacks(timeoutRunnable);
            Log.e(TAG, "Exception during requestRewardedVideo", e);
            if (loadingIndicator != null) {
                loadingIndicator.setVisibility(View.GONE);
            }
            listener.onAdTimeoutOrFailed();
        }
    }
}
