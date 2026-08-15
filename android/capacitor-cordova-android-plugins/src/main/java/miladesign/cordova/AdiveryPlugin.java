package miladesign.cordova;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.adivery.sdk.Adivery;
import com.adivery.sdk.AdiveryBannerCallback;
import com.adivery.sdk.AdiveryInterstitialCallback;
import com.adivery.sdk.AdiveryLoadedAd;
import com.adivery.sdk.AdiveryRewardedCallback;
import com.adivery.sdk.BannerType;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Application;
import android.os.Looper;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;

@SuppressLint("RtlHardcoded")
public class AdiveryPlugin extends CordovaPlugin {
	private static final String TAG = "AdiveryPlugin";
	private static Activity mActivity = null;
	public CordovaInterface cordova = null;
	private FrameLayout bannerLayout;
	private RelativeLayout banner;
	private AdiveryLoadedAd loadedAd;
	private Application _app;
	private static boolean isConfigured = false;
	
	public static final int TOP_LEFT = 0;
	public static final int TOP_CENTER = 1;
	public static final int TOP_RIGHT = 2;
	public static final int LEFT = 3;
	public static final int CENTER = 4;
	public static final int RIGHT = 5;
	public static final int BOTTOM_LEFT = 6;
	public static final int BOTTOM_CENTER = 7;
	public static final int BOTTOM_RIGHT = 8;
	
	@Override
	public void initialize(CordovaInterface initCordova, CordovaWebView webView) {
		 Log.i(TAG, "AdiveryPlugin initialized with Cordova interface");
		 cordova = initCordova;
		 mActivity = cordova.getActivity();
		 _app = cordova.getActivity().getApplication();
		 super.initialize(cordova, webView);
	}
	
	@Override
	public boolean execute(String action, JSONArray args, final CallbackContext CallbackContext) throws JSONException {
		if (action.equals("initialize")) {
			String appId = args.getString(0);
			init(appId);
			return true;
		}
		if (action.equals("createBanner")) {
			String zoneId = args.getString(0);
			int position = args.getInt(1);
			int size = args.getInt(2);

			boolean isMain = (Looper.myLooper() == Looper.getMainLooper());
			String threadName = Thread.currentThread().getName();
			Log.i(TAG, "==================================================");
			Log.i(TAG, "NATIVE createBanner ACTION RECEIVED");
			Log.i(TAG, "  zone=" + zoneId);
			Log.i(TAG, "  position=" + position + " (" + getPositionName(position) + ")");
			Log.i(TAG, "  size=" + size);
			Log.i(TAG, "  thread=" + threadName + " (isMain=" + isMain + ")");
			Log.i(TAG, "  isConfigured=" + isConfigured);
			Log.i(TAG, "==================================================");

			try {
				JSONObject actionJson = new JSONObject();
				actionJson.put("action", "createBanner");
				actionJson.put("zone", zoneId);
				actionJson.put("position", position);
				actionJson.put("positionName", getPositionName(position));
				actionJson.put("size", size);
				actionJson.put("thread", threadName);
				actionJson.put("isMainThread", isMain);
				actionJson.put("isConfigured", isConfigured);
				fireEvent("adivery", "onBannerNativeActionReceived", actionJson.toString());
			} catch (Exception ex) {
				Log.e(TAG, "Error firing onBannerNativeActionReceived", ex);
			}

			BannerType bannerType = BannerType.BANNER;
			switch (size) {
				case 1:
					bannerType = BannerType.BANNER;
					break;
				case 2:
					bannerType = BannerType.LARGE_BANNER;
					break;
				case 3:
					bannerType = BannerType.MEDIUM_RECTANGLE;
					break;
				default:
					bannerType = BannerType.BANNER;
					break;
			}
			createBanner(zoneId, position, bannerType);
			return true;
		}
		if (action.equals("createBannerAtXY")) {
			String zoneId = args.getString(0);
			int x = args.getInt(1);
			int y = args.getInt(2);
			int size = args.getInt(3);
			BannerType bannerType = BannerType.BANNER;
			switch (size) {
				case 1:
					bannerType = BannerType.BANNER;
					break;
				case 2:
					bannerType = BannerType.LARGE_BANNER;
					break;
				case 3:
					bannerType = BannerType.MEDIUM_RECTANGLE;
					break;
				default:
					bannerType = BannerType.BANNER;
					break;
			}
			createBannerAtXY(zoneId, x, y, bannerType);
			return true;
		}
		if (action.equals("removeBanner")) {
			removeBanner();
			return true;
		}
		if (action.equals("showBanner")) {
			showBanner();
			return true;
		}
		if (action.equals("hideBanner")) {
			hideBanner();
			return true;
		}
		if (action.equals("requestInterstitialAd")) {
			String zoneId = args.getString(0);
			requestInterstitialAd(zoneId);
		    return true;
		}
		if (action.equals("requestRewardedAd")) {
			String zoneId = args.getString(0);
			requestRewardedAd(zoneId);
		    return true;
		}
		if (action.equals("showAd")) {
			showAd();
		    return true;
		}
	    return false;
	}
	
	private void init(String appId) {
		try {
			Log.i(TAG, "Adivery.configure() starting with App ID: " + appId);
			if (_app != null) {
				Adivery.configure(_app, appId);
			} else if (mActivity != null) {
				Adivery.configure(mActivity.getApplication(), appId);
			}
			isConfigured = true;
			Log.i(TAG, "Adivery.configure() completed successfully");

			JSONObject initJson = new JSONObject();
			initJson.put("status", "CONFIGURED");
			initJson.put("appId", appId);
			initJson.put("isConfigured", true);
			fireEvent("adivery", "onSdkInitialized", initJson.toString());
		} catch (Exception ex) {
			Log.e(TAG, "Exception in Adivery.configure()", ex);
			try {
				JSONObject errJson = new JSONObject();
				errJson.put("status", "CONFIG_FAILED");
				errJson.put("error", ex.getMessage());
				fireEvent("adivery", "onSdkInitialized", errJson.toString());
			} catch (Exception ignore) {}
		}
	}

	private String getPositionName(int pos) {
		switch (pos) {
			case TOP_LEFT: return "TOP_LEFT";
			case TOP_CENTER: return "TOP_CENTER";
			case TOP_RIGHT: return "TOP_RIGHT";
			case LEFT: return "LEFT";
			case CENTER: return "CENTER";
			case RIGHT: return "RIGHT";
			case BOTTOM_LEFT: return "BOTTOM_LEFT";
			case BOTTOM_CENTER: return "BOTTOM_CENTER";
			case BOTTOM_RIGHT: return "BOTTOM_RIGHT";
			default: return "CUSTOM_" + pos;
		}
	}

	private String getSizeName(BannerType type) {
		if (type == BannerType.BANNER) return "BANNER_320x50";
		if (type == BannerType.LARGE_BANNER) return "LARGE_BANNER_320x100";
		if (type == BannerType.MEDIUM_RECTANGLE) return "MEDIUM_RECTANGLE_300x250";
		return "BANNER_320x50";
	}
	
	private void createBanner(final String zoneId, final int position, final BannerType bannerType) {
		if (mActivity == null) {
			Log.e(TAG, "Adivery Banner: mActivity is null, cannot create banner");
			return;
		}

		mActivity.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				try {
					boolean isMain = (Looper.myLooper() == Looper.getMainLooper());
					String threadName = Thread.currentThread().getName();

					Log.i(TAG, "==================================================");
					Log.i(TAG, "Adivery Banner: Request Starting on UI Thread");
					Log.i(TAG, "  zone=" + zoneId);
					Log.i(TAG, "  position=" + getPositionName(position));
					Log.i(TAG, "  size=" + getSizeName(bannerType));
					Log.i(TAG, "  thread=" + threadName + " (isMain=" + isMain + ")");
					Log.i(TAG, "  isConfigured=" + isConfigured);
					Log.i(TAG, "==================================================");

					_removeBanner();

					final ViewGroup root = getParentGroup();
					if (root == null) {
						Log.e(TAG, "Adivery Banner: Cannot find root ViewGroup to attach banner");
						String json = String.format("{\"message\":\"%s\",\"adType\":\"%s\",\"status\":\"ERROR\"}", "Root ViewGroup not found", "Banner");
						fireEvent("adivery", "onBannerFailed", json);
						fireEvent("adivery", "onShowFailed", json);
						return;
					}

					final DisplayMetrics dm = mActivity.getResources().getDisplayMetrics();
					int widthDp = 320;
					int heightDp = 50;
					if (bannerType == BannerType.LARGE_BANNER) {
						heightDp = 100;
					} else if (bannerType == BannerType.MEDIUM_RECTANGLE) {
						widthDp = 300;
						heightDp = 250;
					}

					final int targetWidthDp = widthDp;
					final int targetHeightDp = heightDp;
					final int widthPx = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, widthDp, dm);
					final int heightPx = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, heightDp, dm);

					// Fire onBannerRequested event with initial diagnostic data
					try {
						JSONObject reqJson = new JSONObject();
						reqJson.put("adType", "Banner");
						reqJson.put("status", "REQUEST_STARTED");
						reqJson.put("zone", zoneId);
						reqJson.put("position", getPositionName(position));
						reqJson.put("size", getSizeName(bannerType));
						reqJson.put("targetWidthDp", targetWidthDp);
						reqJson.put("targetHeightDp", targetHeightDp);
						reqJson.put("targetWidthPx", widthPx);
						reqJson.put("targetHeightPx", heightPx);
						reqJson.put("density", dm.density);
						reqJson.put("densityDpi", dm.densityDpi);
						reqJson.put("thread", threadName);
						reqJson.put("isMainThread", isMain);
						reqJson.put("isConfigured", isConfigured);
						fireEvent("adivery", "onBannerRequested", reqJson.toString());
					} catch (Exception ex) {
						Log.e(TAG, "Error firing onBannerRequested", ex);
					}

					bannerLayout = new FrameLayout(mActivity);
					banner = new RelativeLayout(mActivity);

					int gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
					if (position == TOP_LEFT) {
						gravity = Gravity.TOP | Gravity.LEFT;
					} else if (position == TOP_CENTER) {
						gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;
					} else if (position == TOP_RIGHT) {
						gravity = Gravity.TOP | Gravity.RIGHT;
					} else if (position == LEFT) {
						gravity = Gravity.CENTER_VERTICAL | Gravity.LEFT;
					} else if (position == CENTER) {
						gravity = Gravity.CENTER;
					} else if (position == RIGHT) {
						gravity = Gravity.CENTER_VERTICAL | Gravity.RIGHT;
					} else if (position == BOTTOM_LEFT) {
						gravity = Gravity.BOTTOM | Gravity.LEFT;
					} else if (position == BOTTOM_CENTER) {
						gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
					} else if (position == BOTTOM_RIGHT) {
						gravity = Gravity.BOTTOM | Gravity.RIGHT;
					}

					FrameLayout.LayoutParams fLayoutParams = new FrameLayout.LayoutParams(
						FrameLayout.LayoutParams.MATCH_PARENT, 
						FrameLayout.LayoutParams.WRAP_CONTENT
					);
					fLayoutParams.gravity = gravity;
					bannerLayout.setLayoutParams(fLayoutParams);
					bannerLayout.setMinimumHeight(heightPx);

					FrameLayout.LayoutParams bannerParams = new FrameLayout.LayoutParams(
						FrameLayout.LayoutParams.WRAP_CONTENT, 
						FrameLayout.LayoutParams.WRAP_CONTENT
					);
					bannerParams.gravity = Gravity.CENTER_HORIZONTAL | Gravity.CENTER_VERTICAL;
					banner.setLayoutParams(bannerParams);
					banner.setMinimumWidth(widthPx);
					banner.setMinimumHeight(heightPx);

					bannerLayout.addView(banner);
					root.addView(bannerLayout);
					bannerLayout.bringToFront();
					if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
						bannerLayout.setElevation(50f);
					}

					AdiveryBannerCallback callback = new AdiveryBannerCallback() {
					    @Override
					    public void onAdLoaded(final View ad) {
					    	String cbThread = Thread.currentThread().getName();
					    	boolean cbIsMain = (Looper.myLooper() == Looper.getMainLooper());
					    	Log.i(TAG, "==================================================");
					    	Log.i(TAG, "Adivery Banner SDK Callback: onAdLoaded received!");
					    	Log.i(TAG, "  adView=" + (ad != null ? ad.getClass().getName() : "null"));
					    	Log.i(TAG, "  thread=" + cbThread + " (isMain=" + cbIsMain + ")");
					    	Log.i(TAG, "==================================================");

					    	try {
					    		JSONObject cbJson = new JSONObject();
					    		cbJson.put("callbackType", "LOADED");
					    		cbJson.put("adType", "Banner");
					    		cbJson.put("zone", zoneId);
					    		cbJson.put("thread", cbThread);
					    		cbJson.put("isMainThread", cbIsMain);
					    		fireEvent("adivery", "onSdkCallbackReceived", cbJson.toString());
					    	} catch (Exception ignore) {}

					    	mActivity.runOnUiThread(new Runnable() {
					    		@Override
					    		public void run() {
					    			try {
					    				if (banner != null && ad != null) {
					    					if (ad.getParent() instanceof ViewGroup) {
					    						((ViewGroup) ad.getParent()).removeView(ad);
					    					}
					    					banner.removeAllViews();
					    					RelativeLayout.LayoutParams adParams = new RelativeLayout.LayoutParams(
					    						RelativeLayout.LayoutParams.WRAP_CONTENT,
					    						RelativeLayout.LayoutParams.WRAP_CONTENT
					    					);
					    					adParams.addRule(RelativeLayout.CENTER_IN_PARENT, RelativeLayout.TRUE);
					    					banner.addView(ad, adParams);
					    					banner.setVisibility(View.VISIBLE);
					    					
					    					if (bannerLayout != null) {
					    						bannerLayout.setVisibility(View.VISIBLE);
					    						bannerLayout.bringToFront();
					    						bannerLayout.requestLayout();
					    						bannerLayout.invalidate();
					    					}

					    					// Post layout check to accurately capture layout dimensions and visibility
					    					if (bannerLayout != null) {
					    						bannerLayout.post(new Runnable() {
					    							@Override
					    							public void run() {
					    								try {
					    									int adWidth = (ad != null) ? ad.getWidth() : 0;
					    									int adHeight = (ad != null) ? ad.getHeight() : 0;
					    									boolean isAdVisible = (ad != null && ad.getVisibility() == View.VISIBLE);
					    									boolean isBannerVisible = (banner != null && banner.getVisibility() == View.VISIBLE);
					    									boolean isLayoutVisible = (bannerLayout != null && bannerLayout.getVisibility() == View.VISIBLE);
					    									boolean isAttached = (banner != null && banner.getParent() != null && bannerLayout != null && bannerLayout.getParent() != null);
					    									
					    									int rootW = (root != null) ? root.getWidth() : 0;
					    									int rootH = (root != null) ? root.getHeight() : 0;
					    									int childCount = (root != null) ? root.getChildCount() : 0;
					    									String viewClassName = (ad != null) ? ad.getClass().getName() : "Unknown";

					    									Log.i(TAG, "==================================================");
					    									Log.i(TAG, "Adivery Banner Diagnostic Telemetry:");
					    									Log.i(TAG, "  zone=" + zoneId);
					    									Log.i(TAG, "  size=" + getSizeName(bannerType));
					    									Log.i(TAG, "  viewClass=" + viewClassName);
					    									Log.i(TAG, "  adDimensions=" + adWidth + "x" + adHeight + " px");
					    									Log.i(TAG, "  targetDimensions=" + widthPx + "x" + heightPx + " px (" + targetWidthDp + "x" + targetHeightDp + " dp)");
					    									Log.i(TAG, "  adVisibility=" + (isAdVisible ? "VISIBLE" : "HIDDEN"));
					    									Log.i(TAG, "  isAttached=" + isAttached);
					    									Log.i(TAG, "  rootDimensions=" + rootW + "x" + rootH + " px (childCount: " + childCount + ")");
					    									Log.i(TAG, "==================================================");

					    									JSONObject diagJson = new JSONObject();
					    									diagJson.put("adType", "Banner");
					    									diagJson.put("status", (isAttached && isAdVisible && isLayoutVisible) ? "VISIBLE" : "ATTACHED");
					    									diagJson.put("zone", zoneId);
					    									diagJson.put("position", getPositionName(position));
					    									diagJson.put("size", getSizeName(bannerType));
					    									diagJson.put("viewClass", viewClassName);
					    									diagJson.put("viewWidth", adWidth);
					    									diagJson.put("viewHeight", adHeight);
					    									diagJson.put("targetWidthPx", widthPx);
					    									diagJson.put("targetHeightPx", heightPx);
					    									diagJson.put("targetWidthDp", targetWidthDp);
					    									diagJson.put("targetHeightDp", targetHeightDp);
					    									diagJson.put("density", dm.density);
					    									diagJson.put("viewVisibility", isAdVisible ? "VISIBLE" : "HIDDEN");
					    									diagJson.put("parentExists", isAttached);
					    									diagJson.put("parentChildCount", childCount);
					    									diagJson.put("rootWidth", rootW);
					    									diagJson.put("rootHeight", rootH);
					    									diagJson.put("isAttached", isAttached);
					    									diagJson.put("isVisible", (isAdVisible && isLayoutVisible));

					    									fireEvent("adivery", "onBannerAttached", diagJson.toString());
					    									fireEvent("adivery", "onBannerLoaded", diagJson.toString());
					    									fireEvent("adivery", "onAdLoaded", diagJson.toString());
					    								} catch (Exception ex) {
					    									Log.e(TAG, "Error compiling banner diagnostic telemetry", ex);
					    								}
					    							}
					    						});
					    					}
					    				} else {
					    					Log.w(TAG, "Adivery Banner onAdLoaded called but banner container or ad view was null");
					    				}
					    			} catch (Exception e) {
					    				Log.e(TAG, "Adivery Banner: Error displaying banner ad view", e);
					    				try {
					    					JSONObject errJson = new JSONObject();
					    					errJson.put("message", e.getMessage());
					    					errJson.put("reason", e.getMessage());
					    					errJson.put("adType", "Banner");
					    					errJson.put("status", "ERROR");
					    					errJson.put("zone", zoneId);
					    					fireEvent("adivery", "onBannerFailed", errJson.toString());
					    					fireEvent("adivery", "onShowFailed", errJson.toString());
					    				} catch (Exception ignore) {}
					    			}
					    		}
					    	});
					    }

					    public void onError(final String reason) {
					    	String actualReason = (reason != null && !reason.trim().isEmpty()) ? reason : "No Ad Available";
					    	String cbThread = Thread.currentThread().getName();
					    	boolean cbIsMain = (Looper.myLooper() == Looper.getMainLooper());
					    	Log.e(TAG, "==================================================");
					    	Log.e(TAG, "Adivery Banner SDK Callback: onError received!");
					    	Log.e(TAG, "  zone=" + zoneId);
					    	Log.e(TAG, "  position=" + getPositionName(position));
					    	Log.e(TAG, "  size=" + getSizeName(bannerType));
					    	Log.e(TAG, "  status=ERROR");
					    	Log.e(TAG, "  reason=" + actualReason);
					    	Log.e(TAG, "  thread=" + cbThread + " (isMain=" + cbIsMain + ")");
					    	Log.e(TAG, "==================================================");

					    	try {
					    		JSONObject cbJson = new JSONObject();
					    		cbJson.put("callbackType", "ERROR");
					    		cbJson.put("adType", "Banner");
					    		cbJson.put("reason", actualReason);
					    		cbJson.put("zone", zoneId);
					    		cbJson.put("thread", cbThread);
					    		cbJson.put("isMainThread", cbIsMain);
					    		fireEvent("adivery", "onSdkCallbackReceived", cbJson.toString());
					    	} catch (Exception ignore) {}

					    	try {
					    		JSONObject errJson = new JSONObject();
					    		errJson.put("message", actualReason);
					    		errJson.put("reason", actualReason);
					    		errJson.put("adType", "Banner");
					    		errJson.put("status", "FAILED");
					    		errJson.put("zone", zoneId);
					    		errJson.put("position", getPositionName(position));
					    		errJson.put("size", getSizeName(bannerType));
					    		fireEvent("adivery", "onBannerFailed", errJson.toString());
					    		fireEvent("adivery", "onShowFailed", errJson.toString());
					    	} catch (Exception ex) {
					    		Log.e(TAG, "Error firing onBannerFailed", ex);
					    	}
					    }

					    public void onAdClicked() {
					    	Log.d(TAG, "Adivery Banner SDK Callback: onAdClicked received");
					    	try {
					    		JSONObject clickJson = new JSONObject();
					    		clickJson.put("adType", "Banner");
					    		clickJson.put("status", "CLICKED");
					    		clickJson.put("zone", zoneId);
					    		fireEvent("adivery", "onBannerClicked", clickJson.toString());
					    		fireEvent("adivery", "onAdClicked", clickJson.toString());
					    	} catch (Exception ignore) {}
					    }
					};

					// Step 3: Before Adivery.requestBannerAd()
					Log.i(TAG, "==================================================");
					Log.i(TAG, "Adivery SDK CALL STARTING");
					Log.i(TAG, "  zone=" + zoneId);
					Log.i(TAG, "  bannerType=" + getSizeName(bannerType));
					Log.i(TAG, "  position=" + getPositionName(position));
					Log.i(TAG, "  activity=" + (mActivity != null ? mActivity.getClass().getSimpleName() : "null"));
					Log.i(TAG, "  thread=" + threadName + " (isMain=" + isMain + ")");
					Log.i(TAG, "==================================================");

					try {
						JSONObject startingJson = new JSONObject();
						startingJson.put("status", "SDK_CALL_STARTING");
						startingJson.put("zone", zoneId);
						startingJson.put("bannerType", getSizeName(bannerType));
						startingJson.put("position", getPositionName(position));
						startingJson.put("activity", (mActivity != null ? mActivity.getClass().getSimpleName() : "null"));
						startingJson.put("thread", threadName);
						startingJson.put("isMainThread", isMain);
						fireEvent("adivery", "onSdkCallStarting", startingJson.toString());
					} catch (Exception ignore) {}

					// Step 4: Try/Catch around Adivery.requestBannerAd()
					try {
						Adivery.requestBannerAd(mActivity, zoneId, bannerType, callback);
						
						// Step 5: Immediately after Adivery.requestBannerAd()
						Log.i(TAG, "==================================================");
						Log.i(TAG, "Adivery.requestBannerAd() RETURNED");
						Log.i(TAG, "==================================================");

						try {
							JSONObject returnedJson = new JSONObject();
							returnedJson.put("status", "SDK_CALL_RETURNED");
							returnedJson.put("zone", zoneId);
							returnedJson.put("thread", threadName);
							returnedJson.put("isMainThread", isMain);
							fireEvent("adivery", "onSdkCallReturned", returnedJson.toString());
						} catch (Exception ignore) {}

					} catch (Throwable sdkEx) {
						String exClass = sdkEx.getClass().getName();
						String exMsg = sdkEx.getMessage() != null ? sdkEx.getMessage() : "null";
						String stackTrace = Log.getStackTraceString(sdkEx);

						Log.e(TAG, "==================================================");
						Log.e(TAG, "Adivery Banner SDK Exception during requestBannerAd()!");
						Log.e(TAG, "  Class: " + exClass);
						Log.e(TAG, "  Message: " + exMsg);
						Log.e(TAG, "  StackTrace: " + stackTrace);
						Log.e(TAG, "==================================================");

						try {
							JSONObject exJson = new JSONObject();
							exJson.put("errorClass", exClass);
							exJson.put("message", exMsg);
							exJson.put("stackTrace", stackTrace);
							exJson.put("reason", "SDK Exception: " + exClass + " - " + exMsg);
							exJson.put("adType", "Banner");
							exJson.put("status", "SDK_EXCEPTION");
							exJson.put("zone", zoneId);
							fireEvent("adivery", "onBannerSdkException", exJson.toString());
							fireEvent("adivery", "onBannerFailed", exJson.toString());
							fireEvent("adivery", "onShowFailed", exJson.toString());
						} catch (Exception ignore) {}
					}

				} catch (Exception ex) {
					Log.e(TAG, "Adivery Banner: Top-level Exception in createBanner", ex);
				}
			}
		});
	}
	
	private void createBannerAtXY(final String zoneId, final int x, final int y, final BannerType bannerType) {
		if (mActivity == null) {
			Log.e(TAG, "Adivery Banner: mActivity is null, cannot create banner at XY");
			return;
		}

		mActivity.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				try {
					Log.i(TAG, "==================================================");
					Log.i(TAG, "Adivery Banner: Request Started at XY (" + x + "," + y + ")");
					Log.i(TAG, "  zone=" + zoneId);
					Log.i(TAG, "  size=" + getSizeName(bannerType));
					Log.i(TAG, "==================================================");

					_removeBanner();

					final ViewGroup root = getParentGroup();
					if (root == null) {
						Log.e(TAG, "Adivery Banner: Cannot find root ViewGroup to attach banner at XY");
						String json = String.format("{\"message\":\"%s\",\"adType\":\"%s\",\"status\":\"ERROR\"}", "Root ViewGroup not found", "Banner");
						fireEvent("adivery", "onBannerFailed", json);
						fireEvent("adivery", "onShowFailed", json);
						return;
					}

					DisplayMetrics dm = mActivity.getResources().getDisplayMetrics();
					int widthDp = 320;
					int heightDp = 50;
					if (bannerType == BannerType.LARGE_BANNER) {
						heightDp = 100;
					} else if (bannerType == BannerType.MEDIUM_RECTANGLE) {
						widthDp = 300;
						heightDp = 250;
					}

					int widthPx = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, widthDp, dm);
					int heightPx = (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, heightDp, dm);

					bannerLayout = new FrameLayout(mActivity);
				    FrameLayout.LayoutParams fLayoutParams = new FrameLayout.LayoutParams(FrameLayout.LayoutParams.WRAP_CONTENT, FrameLayout.LayoutParams.WRAP_CONTENT);
				    fLayoutParams.leftMargin = x;
			    	fLayoutParams.topMargin = y;
				    bannerLayout.setLayoutParams(fLayoutParams);
				    bannerLayout.setMinimumHeight(heightPx);
				    
				    banner = new RelativeLayout(mActivity);
				    banner.setMinimumWidth(widthPx);
				    banner.setMinimumHeight(heightPx);
				    bannerLayout.addView(banner);
				    root.addView(bannerLayout);
				    bannerLayout.bringToFront();
				    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
						bannerLayout.setElevation(50f);
					}

				    AdiveryBannerCallback callback = new AdiveryBannerCallback() {
					    @Override
					    public void onAdLoaded(final View ad) {
					    	mActivity.runOnUiThread(new Runnable() {
					    		@Override
					    		public void run() {
					    			try {
					    				if (banner != null && ad != null) {
					    					if (ad.getParent() instanceof ViewGroup) {
					    						((ViewGroup) ad.getParent()).removeView(ad);
					    					}
					    					banner.removeAllViews();
					    					RelativeLayout.LayoutParams adParams = new RelativeLayout.LayoutParams(
					    						RelativeLayout.LayoutParams.WRAP_CONTENT,
					    						RelativeLayout.LayoutParams.WRAP_CONTENT
					    					);
					    					adParams.addRule(RelativeLayout.CENTER_IN_PARENT, RelativeLayout.TRUE);
					    					banner.addView(ad, adParams);
					    					banner.setVisibility(View.VISIBLE);
					    					if (bannerLayout != null) {
					    						bannerLayout.setVisibility(View.VISIBLE);
					    						bannerLayout.bringToFront();
					    						bannerLayout.requestLayout();
					    						bannerLayout.invalidate();
					    					}

					    					Log.i(TAG, "==================================================");
					    					Log.i(TAG, "Adivery Banner Loaded & Attached at XY Successfully:");
					    					Log.i(TAG, "  zone=" + zoneId);
					    					Log.i(TAG, "  size=" + getSizeName(bannerType));
					    					Log.i(TAG, "==================================================");

					    					String json = String.format("{\"adType\":\"%s\",\"status\":\"LOADED\",\"zone\":\"%s\"}", "Banner", zoneId);
					    					fireEvent("adivery", "onBannerLoaded", json);
					    					fireEvent("adivery", "onAdLoaded", json);
					    				}
					    			} catch (Exception e) {
					    				Log.e(TAG, "Adivery Banner: Error displaying banner at XY", e);
					    				String json = String.format("{\"message\":\"%s\",\"adType\":\"%s\",\"status\":\"ERROR\"}", e.getMessage(), "Banner");
					    				fireEvent("adivery", "onBannerFailed", json);
					    				fireEvent("adivery", "onShowFailed", json);
					    			}
					    		}
					    	});
					    }

					    public void onError(final String reason) {
					    	Log.e(TAG, "==================================================");
					    	Log.e(TAG, "Adivery Banner: Request at XY Failed");
					    	Log.e(TAG, "  zone=" + zoneId);
					    	Log.e(TAG, "  size=" + getSizeName(bannerType));
					    	Log.e(TAG, "  status=ERROR");
					    	Log.e(TAG, "  reason=" + (reason != null ? reason : "Unknown error"));
					    	Log.e(TAG, "==================================================");

					    	String json = String.format("{\"message\":\"%s\",\"reason\":\"%s\",\"adType\":\"%s\",\"status\":\"ERROR\",\"zone\":\"%s\"}", 
					    		reason != null ? reason : "Failed to load banner",
					    		reason != null ? reason : "Unknown",
					    		"Banner",
					    		zoneId
					    	);
					    	fireEvent("adivery", "onBannerFailed", json);
					    	fireEvent("adivery", "onShowFailed", json);
					    }

					    public void onAdClicked() {
					    	Log.d(TAG, "Adivery Banner: onAdClicked at XY");
					    	String json = String.format("{\"adType\":\"%s\",\"status\":\"CLICKED\",\"zone\":\"%s\"}", "Banner", zoneId);
					    	fireEvent("adivery", "onBannerClicked", json);
					    	fireEvent("adivery", "onAdClicked", json);
					    }
					};

					Adivery.requestBannerAd(mActivity, zoneId, bannerType, callback);
				} catch (Exception ex) {
					Log.e(TAG, "Adivery Banner: Exception in createBannerAtXY", ex);
				}
			}
		});
	}

	private void removeBanner() {
	    if (mActivity != null) {
	    	mActivity.runOnUiThread(new Runnable() {
		        public void run() {
		        	_removeBanner();
		        }
	      });
	    }
	}
	
	private void _removeBanner() {
		try {
			if (bannerLayout != null) {
				if (banner != null) {
					banner.removeAllViews();
				}
				if (bannerLayout.getParent() != null && bannerLayout.getParent() instanceof ViewGroup) {
					((ViewGroup) bannerLayout.getParent()).removeView(bannerLayout);
				}
				bannerLayout = null;
				banner = null;
				Log.d(TAG, "Adivery Banner: Cleanly removed banner layout and views");
				try {
					org.json.JSONObject remJson = new org.json.JSONObject();
					remJson.put("adType", "Banner");
					remJson.put("status", "REMOVED");
					fireEvent("adivery", "onBannerRemoved", remJson.toString());
				} catch (Exception ignore) {}
			}
		} catch (Exception e) {
			Log.e(TAG, "Adivery Banner: Exception in _removeBanner", e);
		}
	}

	private void showBanner() {
		try {
			if (mActivity != null) {
		    	mActivity.runOnUiThread(new Runnable() {
			        public void run() {
						if (banner != null) {
							banner.setVisibility(View.VISIBLE);
						}
						if (bannerLayout != null) {
							bannerLayout.setVisibility(View.VISIBLE);
							bannerLayout.bringToFront();
							bannerLayout.requestLayout();
						}
			        }
		    	});
		    }
		} catch(Exception e) {
			Log.e(TAG, "Adivery Banner: Exception in showBanner", e);
		}
	}

	private void hideBanner() {
		try {
			if (mActivity != null) {
		    	mActivity.runOnUiThread(new Runnable() {
			        public void run() {
						if (banner != null) {
							banner.setVisibility(View.GONE);
						}
						if (bannerLayout != null) {
							bannerLayout.setVisibility(View.GONE);
						}
			        }
		    	});
		    }
		} catch(Exception e) {
			Log.e(TAG, "Adivery Banner: Exception in hideBanner", e);
		}
	}
	
	private ViewGroup getParentGroup() {
	    try {
	    	if (mActivity != null) {
	    		View content = mActivity.findViewById(android.R.id.content);
	    		if (content instanceof ViewGroup) {
	    			return (ViewGroup) content;
	    		}
	    		View decor = mActivity.getWindow().getDecorView();
	    		if (decor instanceof ViewGroup) {
	    			return (ViewGroup) decor;
	    		}
	    	}
	    	if (this.webView != null && this.webView.getView() != null && this.webView.getView().getParent() instanceof ViewGroup) {
	    		return (ViewGroup) this.webView.getView().getParent();
	    	}
	    } catch (Exception ex) {
	    	Log.e(TAG, "getParentGroup exception", ex);
	    }
	    return null;
	}
	
	private void requestInterstitialAd(String zoneId) throws JSONException {
		if(zoneId!=null && (zoneId.equalsIgnoreCase("null") || zoneId.equalsIgnoreCase(""))) {
			zoneId = null;
		}
		
		AdiveryInterstitialCallback callback = new AdiveryInterstitialCallback() {
		    @Override
		    public void onAdLoaded(AdiveryLoadedAd ad) {
		    	loadedAd = ad;
				String json = String.format("{'adType':'%s'}", new Object[] { "Interstitial" });
			    fireEvent("adivery", "onAdLoaded", json);
		    }
		};

		Adivery.requestInterstitialAd(mActivity, zoneId, callback);
		
	}

	private void requestRewardedAd(String zoneId) throws JSONException {
		if(zoneId!=null && (zoneId.equalsIgnoreCase("null") || zoneId.equalsIgnoreCase(""))) {
			zoneId = null;
		}
		
		AdiveryRewardedCallback callback = new AdiveryRewardedCallback() {
		    @Override
		    public void onAdLoaded(AdiveryLoadedAd ad) {
		    	loadedAd = ad;
				String json = String.format("{\"adType\":\"%s\",\"status\":\"LOADED\"}", "Rewarded");
			    fireEvent("adivery", "onAdLoaded", json);
		    }

		    @Override
		    public void onAdRewarded() {
		    	loadedAd = null;
				String json = String.format("{\"adType\":\"%s\",\"status\":\"REWARDED\"}", "Rewarded");
			    fireEvent("adivery", "onAdRewarded", json);
		    }

		    @Override
		    public void onAdClosed() {
		    	loadedAd = null;
				String json = String.format("{\"adType\":\"%s\",\"status\":\"CLOSED\"}", "Rewarded");
			    fireEvent("adivery", "onAdClosed", json);
		    }

		    @Override
		    public void onError(String reason) {
		    	loadedAd = null;
				String json = String.format("{\"adType\":\"%s\",\"status\":\"ERROR\",\"message\":\"%s\"}", "Rewarded", reason != null ? reason : "Unknown error");
			    fireEvent("adivery", "onShowFailed", json);
		    }

		    @Override
		    public void onAdClicked() {
				String json = String.format("{\"adType\":\"%s\",\"status\":\"CLICKED\"}", "Rewarded");
			    fireEvent("adivery", "onAdClicked", json);
		    }

		    @Override
		    public void onAdShown() {
				String json = String.format("{\"adType\":\"%s\",\"status\":\"SHOWN\"}", "Rewarded");
			    fireEvent("adivery", "onAdShown", json);
		    }
		};

		Adivery.requestRewardedAd(mActivity, zoneId, callback);
		
	}
	
	private void showAd() {
		if (loadedAd == null) {
			String json = String.format("{'message':'%s'}", new Object[] { "You have to request for ad first then try to show!" });
		    fireEvent("adivery", "onShowFailed", json);
            return;
        } else {
        	loadedAd.show();
        }
	}
	
	public void fireEvent(final String obj, final String eventName, final String jsonData) {
		if (mActivity != null) {
			mActivity.runOnUiThread(new Runnable() {
				@Override
				public void run() {
					try {
						String js;
						if ("window".equals(obj)) {
							js = "var evt=document.createEvent('UIEvents');evt.initUIEvent('" + eventName + "',true,false,window,0);window.dispatchEvent(evt);";
						} else {
							js = "javascript:cordova.fireDocumentEvent('" + eventName + "'";
							if (jsonData != null) {
								js += "," + jsonData;
							}
							js += ");";
						}
						if (webView != null) {
							webView.loadUrl(js);
						}
					} catch (Exception e) {
						Log.e(TAG, "Error in fireEvent: " + eventName, e);
					}
				}
			});
		}
	}
}