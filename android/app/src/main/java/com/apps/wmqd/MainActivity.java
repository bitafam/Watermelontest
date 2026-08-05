package com.apps.wmqd;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;

import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Initialize Tapsell Ads SDK
        TapsellAdHelper.initialize(this);

        // Setup the Capacitor WebView Bridge
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.addJavascriptInterface(new WatermelonMonetizationBridge(), "WatermelonMonetization");
            Log.d(TAG, "Exposed WatermelonMonetization JavaScript Interface to WebView");
        }

        // Initialize Banner Ad
        ViewGroup bannerContainer = findViewById(R.id.banner_container);
        if (bannerContainer != null) {
            TapsellAdHelper.loadBanner(this, bannerContainer);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        ViewGroup bannerContainer = findViewById(R.id.banner_container);
        if (bannerContainer != null) {
            if (MonetizationManager.getInstance(this).isPremiumUser()) {
                TapsellAdHelper.destroyBanner(bannerContainer);
            } else {
                TapsellAdHelper.loadBanner(this, bannerContainer);
            }
        }
    }

    @Override
    protected void onDestroy() {
        ViewGroup bannerContainer = findViewById(R.id.banner_container);
        TapsellAdHelper.destroyBanner(bannerContainer);
        super.onDestroy();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        // If coming back from UpgradeActivity, refresh the banner ad and user states
        if (requestCode == MyketIapHelper.RC_REQUEST) {
            ViewGroup bannerContainer = findViewById(R.id.banner_container);
            if (bannerContainer != null) {
                if (MonetizationManager.getInstance(this).isPremiumUser()) {
                    TapsellAdHelper.destroyBanner(bannerContainer);
                } else {
                    TapsellAdHelper.loadBanner(this, bannerContainer);
                }
            }
        }
    }

    /**
     * Launch the UpgradeActivity screen
     */
    public void openUpgradeScreen() {
        Intent intent = new Intent(this, UpgradeActivity.class);
        startActivityForResult(intent, MyketIapHelper.RC_REQUEST);
    }

    /**
     * Handles the start analysis attempt with rate limiting and ad loading.
     */
    public void handleAnalysisAttempt() {
        MonetizationManager manager = MonetizationManager.getInstance(this);

        // 1. Premium users bypass everything
        if (manager.isPremiumUser()) {
            notifyJsAnalysisAllowed();
            return;
        }

        // 2. Check 5-Minute / 4-Attempt limit
        if (manager.isUnderFiveMinuteLock()) {
            showLockDialog(true, manager.getFiveMinuteLockRemainingMs());
            return;
        }

        // Check attempts in the last 5 minutes
        List<Long> attempts = manager.getAttempts();
        long now = System.currentTimeMillis();
        int count = 0;
        for (Long t : attempts) {
            if (now - t < 5 * 60 * 1000) {
                count++;
            }
        }
        if (count >= 4) {
            manager.setLockUntil(now + 5 * 60 * 1000);
            showLockDialog(true, 5 * 60 * 1000);
            return;
        }

        // 3. Check 1-Minute cooldown
        if (manager.isUnderOneMinuteCooldown()) {
            showLockDialog(false, manager.getOneMinuteCooldownRemainingMs());
            return;
        }

        // 4. Rate limits passed, load and show rewarded ad
        final View loadingOverlay = findViewById(R.id.loading_overlay);
        TapsellAdHelper.requestRewardedAd(this, new TapsellAdHelper.RewardedAdListener() {
            @Override
            public void onAdRewarded() {
                notifyJsAnalysisAllowed();
            }

            @Override
            public void onAdTimeoutOrFailed() {
                Toast.makeText(MainActivity.this, "تبلیغ بارگذاری نشد. شروع آنالیز به صورت خودکار...", Toast.LENGTH_SHORT).show();
                notifyJsAnalysisAllowed();
            }
        }, loadingOverlay);
    }

    /**
     * Notify the web client that analysis is allowed to proceed
     */
    private void notifyJsAnalysisAllowed() {
        final WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.post(new Runnable() {
                @Override
                public void run() {
                    webView.evaluateJavascript("if (typeof onAnalysisAllowed === 'function') { onAnalysisAllowed(); } else if (window.onAnalysisAllowed) { window.onAnalysisAllowed(); }", null);
                }
            });
        }
    }

    /**
     * Show premium and timing lock dialogs with styled views and timers
     */
    private void showLockDialog(final boolean isFiveMinuteLock, long durationMs) {
        final androidx.appcompat.app.AlertDialog.Builder builder = new androidx.appcompat.app.AlertDialog.Builder(this);
        
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(48, 48, 48, 48);
        layout.setGravity(android.view.Gravity.CENTER);
        layout.setBackgroundColor(getResources().getColor(R.color.white));

        TextView titleView = new TextView(this);
        titleView.setText(isFiveMinuteLock ? "محدودیت تعداد آنالیز" : "زمان انتظار بین هر آنالیز");
        titleView.setTextColor(getResources().getColor(R.color.black));
        titleView.setTextSize(18);
        titleView.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        titleView.setGravity(android.view.Gravity.CENTER);
        layout.addView(titleView);

        final TextView timerView = new TextView(this);
        timerView.setTextSize(26);
        timerView.setTextColor(getResources().getColor(R.color.colorAccent));
        timerView.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
        timerView.setGravity(android.view.Gravity.CENTER);
        timerView.setPadding(0, 24, 0, 24);
        layout.addView(timerView);

        TextView msgView = new TextView(this);
        msgView.setText(isFiveMinuteLock 
            ? "تعداد آنالیزهای شما در ۵ دقیقه اخیر بیش از حد مجاز بوده است. لطفاً شکیبا باشید یا نسخه ویژه را تهیه کنید."
            : "برای شروع آنالیز بعدی باید کمی صبر کنید.");
        msgView.setTextColor(getResources().getColor(R.color.gray_dark));
        msgView.setTextSize(14);
        msgView.setGravity(android.view.Gravity.CENTER);
        msgView.setLineSpacing(0f, 1.2f);
        layout.addView(msgView);

        builder.setView(layout);
        builder.setCancelable(true);
        final androidx.appcompat.app.AlertDialog dialog = builder.create();

        if (isFiveMinuteLock) {
            Button buyButton = new Button(this);
            buyButton.setText("خرید نسخه بدون تبلیغات و محدودیت");
            buyButton.setBackgroundTintList(android.content.res.ColorStateList.valueOf(getResources().getColor(R.color.colorPrimary)));
            buyButton.setTextColor(getResources().getColor(R.color.white));
            buyButton.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    dialog.dismiss();
                    openUpgradeScreen();
                }
            });
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 
                LinearLayout.LayoutParams.WRAP_CONTENT
            );
            lp.setMargins(0, 32, 0, 0);
            buyButton.setLayoutParams(lp);
            layout.addView(buyButton);
        }

        final android.os.CountDownTimer countDownTimer = new android.os.CountDownTimer(durationMs, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                long minutes = (millisUntilFinished / 1000) / 60;
                long seconds = (millisUntilFinished / 1000) % 60;
                String timeStr = String.format("%02d:%02d", minutes, seconds);
                timerView.setText(timeStr);
            }

            @Override
            public void onFinish() {
                dialog.dismiss();
            }
        };
        
        dialog.setOnDismissListener(new android.content.DialogInterface.OnDismissListener() {
            @Override
            public void onDismiss(android.content.DialogInterface d) {
                countDownTimer.cancel();
            }
        });

        countDownTimer.start();
        dialog.show();
    }

    /**
     * Javascript Interface for WebView Communication
     */
    public class WatermelonMonetizationBridge {
        @JavascriptInterface
        public boolean isPremiumUser() {
            return MonetizationManager.getInstance(MainActivity.this).isPremiumUser();
        }

        @JavascriptInterface
        public void startAnalysis() {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    MainActivity.this.handleAnalysisAttempt();
                }
            });
        }

        @JavascriptInterface
        public void openUpgradeScreen() {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    MainActivity.this.openUpgradeScreen();
                }
            });
        }

        @JavascriptInterface
        public void triggerAnalysisSuccess() {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    MonetizationManager.getInstance(MainActivity.this).registerAnalysisAttempt();
                    Log.d(TAG, "Watermelon analysis success registered natively");
                }
            });
        }
    }
}
