package com.apps.wmqd;

import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupBottomBannerLayout();
    }

    private void setupBottomBannerLayout() {
        try {
            ViewGroup contentView = findViewById(android.R.id.content);
            if (contentView == null) return;

            int containerId = getResources().getIdentifier("tapsell_banner_container", "id", getPackageName());

            contentView.post(new Runnable() {
                @Override
                public void run() {
                    try {
                        if (containerId != 0 && findViewById(containerId) != null) {
                            return;
                        }

                        if (contentView.getChildCount() > 0) {
                            View webViewView = contentView.getChildAt(0);
                            if (webViewView instanceof LinearLayout) {
                                return;
                            }
                            contentView.removeView(webViewView);

                            LinearLayout mainLayout = new LinearLayout(MainActivity.this);
                            mainLayout.setOrientation(LinearLayout.VERTICAL);
                            mainLayout.setLayoutParams(new LinearLayout.LayoutParams(
                                    ViewGroup.LayoutParams.MATCH_PARENT,
                                    ViewGroup.LayoutParams.MATCH_PARENT));

                            LinearLayout.LayoutParams webViewParams = new LinearLayout.LayoutParams(
                                    ViewGroup.LayoutParams.MATCH_PARENT,
                                    0, 1.0f);
                            webViewView.setLayoutParams(webViewParams);
                            mainLayout.addView(webViewView);

                            FrameLayout bannerContainer = new FrameLayout(MainActivity.this);
                            if (containerId != 0) {
                                bannerContainer.setId(containerId);
                            } else {
                                bannerContainer.setId(View.generateViewId());
                            }
                            int minHeightPx = (int) (50 * getResources().getDisplayMetrics().density);
                            bannerContainer.setMinimumHeight(minHeightPx);
                            LinearLayout.LayoutParams bannerParams = new LinearLayout.LayoutParams(
                                    ViewGroup.LayoutParams.MATCH_PARENT,
                                    ViewGroup.LayoutParams.WRAP_CONTENT);
                            bannerContainer.setLayoutParams(bannerParams);
                            mainLayout.addView(bannerContainer);

                            contentView.addView(mainLayout);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}


