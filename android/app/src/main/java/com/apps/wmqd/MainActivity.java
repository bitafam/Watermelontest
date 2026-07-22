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
            if (containerId != 0 && findViewById(containerId) != null) {
                return; // Already set up
            }

            if (contentView.getChildCount() > 0) {
                View webViewView = contentView.getChildAt(0);
                if (webViewView instanceof LinearLayout) {
                    return;
                }
                contentView.removeView(webViewView);

                LinearLayout mainLayout = new LinearLayout(this);
                mainLayout.setOrientation(LinearLayout.VERTICAL);
                mainLayout.setLayoutParams(new LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT));

                LinearLayout.LayoutParams webViewParams = new LinearLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        0, 1.0f);
                webViewView.setLayoutParams(webViewParams);
                mainLayout.addView(webViewView);

                FrameLayout bannerContainer = new FrameLayout(this);
                if (containerId != 0) {
                    bannerContainer.setId(containerId);
                } else {
                    bannerContainer.setId(View.generateViewId());
                }
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
}
