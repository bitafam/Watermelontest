package com.apps.wmqd;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

public class UpgradeActivity extends AppCompatActivity {

    private Button btnBuy;
    private Button btnCancel;
    private TextView txtStatus;
    private ProgressBar progressLoading;
    private boolean isBillingInitialized = false;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_upgrade);

        btnBuy = findViewById(R.id.btn_buy);
        btnCancel = findViewById(R.id.btn_cancel);
        txtStatus = findViewById(R.id.txt_status);
        progressLoading = findViewById(R.id.progress_loading);

        // Close Activity on cancel click
        btnCancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        // Start billing initialization
        showLoading(true);
        setStatusText("در حال اتصال به بازار مایکت...");

        MyketIapHelper.initialize(this, new MyketIapHelper.BillingSetupListener() {
            @Override
            public void onSetupSuccess(boolean isPremium) {
                isBillingInitialized = true;
                showLoading(false);
                hideStatusText();

                if (isPremium) {
                    btnBuy.setEnabled(false);
                    btnBuy.setText("شما عضو ویژه هستید");
                    Toast.makeText(UpgradeActivity.this, "شما از قبل عضو ویژه هستید!", Toast.LENGTH_LONG).show();
                } else {
                    setupPurchaseButton();
                }
            }

            @Override
            public void onSetupFailed(String error) {
                isBillingInitialized = false;
                showLoading(false);
                setStatusText("خطا در اتصال به مایکت: " + error);
                Toast.makeText(UpgradeActivity.this, "عدم دسترسی به سرویس پرداخت مایکت.", Toast.LENGTH_LONG).show();
            }
        });
    }

    private void setupPurchaseButton() {
        btnBuy.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!isBillingInitialized) {
                    Toast.makeText(UpgradeActivity.this, "سرویس پرداخت مایکت هنوز آماده نشده است.", Toast.LENGTH_SHORT).show();
                    return;
                }

                showLoading(true);
                setStatusText("در حال هدایت به درگاه پرداخت مایکت...");

                MyketIapHelper.launchPurchase(UpgradeActivity.this, new MyketIapHelper.PurchaseListener() {
                    @Override
                    public void onPurchaseSuccess() {
                        showLoading(false);
                        hideStatusText();
                        Toast.makeText(UpgradeActivity.this, "خرید با موفقیت انجام شد! نسخه ویژه فعال گردید.", Toast.LENGTH_LONG).show();
                        
                        // Notify standard banner and UI to update
                        MonetizationManager.getInstance(UpgradeActivity.this).setPremiumUser(true);
                        
                        btnBuy.setEnabled(false);
                        btnBuy.setText("نسخه ویژه فعال شد");
                        
                        // Return result to main activity to refresh state
                        setResult(RESULT_OK);
                        finish();
                    }

                    @Override
                    public void onPurchaseFailed(String error) {
                        showLoading(false);
                        setStatusText("خطا در پرداخت: " + error);
                        Toast.makeText(UpgradeActivity.this, "خرید ناموفق بود.", Toast.LENGTH_LONG).show();
                    }
                });
            }
        });
    }

    private void showLoading(boolean loading) {
        if (loading) {
            progressLoading.setVisibility(View.VISIBLE);
            btnBuy.setEnabled(false);
        } else {
            progressLoading.setVisibility(View.GONE);
            btnBuy.setEnabled(true);
        }
    }

    private void setStatusText(String text) {
        txtStatus.setVisibility(View.VISIBLE);
        txtStatus.setText(text);
    }

    private void hideStatusText() {
        txtStatus.setVisibility(View.GONE);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        // Direct handling of Myket purchase result
        if (MyketIapHelper.handleActivityResult(requestCode, resultCode, data)) {
            super.onActivityResult(requestCode, resultCode, data);
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    protected void onDestroy() {
        // Dispose of billing helper to avoid memory leaks
        MyketIapHelper.dispose();
        super.onDestroy();
    }
}
