package miladesign.cordova;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;

import com.adivery.sdk.Adivery;
import com.adivery.sdk.AdiveryBannerCallback;
import com.adivery.sdk.AdiveryInterstitialCallback;
import com.adivery.sdk.AdiveryLoadedAd;
import com.adivery.sdk.AdiveryRewardedCallback;
import com.adivery.sdk.BannerType;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Application;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.FrameLayout.LayoutParams;
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
		 Log.e (TAG, "initialize");
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
			BannerType bannerType = BannerType.FLEX_BANNER;
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
			}
			createBanner(zoneId, position, bannerType);
			return true;
		}
		if (action.equals("createBannerAtXY")) {
			String zoneId = args.getString(0);
			int x = args.getInt(1);
			int y = args.getInt(2);
			int size = args.getInt(3);
			BannerType bannerType = BannerType.FLEX_BANNER;
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
		Adivery.configure(_app, appId);
	}
	
	private void createBanner(final String zoneId, final int position, final BannerType bannerType) {
		
		mActivity.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				if (bannerLayout != null) {
					_removeBanner();
				}
				bannerLayout = new FrameLayout(mActivity);
				banner = new RelativeLayout(mActivity);
				if (position == TOP_LEFT) {
					FrameLayout.LayoutParams fLayoutParams = new FrameLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			    	fLayoutParams.gravity = Gravity.TOP;
			    	bannerLayout.setLayoutParams(fLayoutParams);
				    ((ViewGroup) getParentGroup().getParent()).addView(bannerLayout, 1);
				    bannerLayout.addView(banner);
				} else if (position == TOP_CENTER) {
					FrameLayout.LayoutParams fLayoutParams = new FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
					fLayoutParams.gravity = Gravity.TOP;
			    	FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			    	params.gravity = Gravity.CENTER;
			    	banner.setLayoutParams(params);
			    	bannerLayout.setLayoutParams(fLayoutParams);
				    ((ViewGroup) getParentGroup().getParent()).addView(bannerLayout, 1);
				    bannerLayout.addView(banner);
				} else if (position == TOP_RIGHT) {
					FrameLayout.LayoutParams fLayoutParams = new FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
			    	fLayoutParams.gravity = Gravity.TOP;
			    	FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			    	params.gravity = Gravity.RIGHT;
			    	banner.setLayoutParams(params);
			    	bannerLayout.setLayoutParams(fLayoutParams);
				    ((ViewGroup) getParentGroup().getParent()).addView(bannerLayout, 1);
				    bannerLayout.addView(banner);
				} else if (position == LEFT) {
					FrameLayout.LayoutParams fLayoutParams = new FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);
			    	FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			    	params.gravity = (Gravity.CENTER_VERTICAL | Gravity.LEFT);
			    	banner.setLayoutParams(params);
			    	bannerLayout.setLayoutParams(fLayoutParams);
				    ((ViewGroup) getParentGroup().getParent()).addView(bannerLayout, 1);
				    bannerLayout.addView(banner);
				} else if (position == CENTER) {
					FrameLayout.LayoutParams fLayoutParams = new FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);
			    	FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			    	params.gravity = Gravity.CENTER;
			    	banner.setLayoutParams(params);
			    	bannerLayout.setLayoutParams(fLayoutParams);
				    ((ViewGroup) getParentGroup().getParent()).addView(bannerLayout, 1);
				    bannerLayout.addView(banner);
				} else if (position == RIGHT) {
					FrameLayout.LayoutParams fLayoutParams = new FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);
			    	FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			    	params.gravity = (Gravity.CENTER_VERTICAL | Gravity.RIGHT);
			    	banner.setLayoutParams(params);
			    	bannerLayout.setLayoutParams(fLayoutParams);
				    ((ViewGroup) getParentGroup().getParent()).addView(bannerLayout, 1);
				    bannerLayout.addView(banner);
				} else if (position == BOTTOM_LEFT) {
					FrameLayout.LayoutParams fLayoutParams = new FrameLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			    	fLayoutParams.gravity = Gravity.BOTTOM;
			    	bannerLayout.setLayoutParams(fLayoutParams);
				    ((ViewGroup) getParentGroup().getParent()).addView(bannerLayout, 1);
				    bannerLayout.addView(banner);
				} else if (position == BOTTOM_CENTER) {
					FrameLayout.LayoutParams fLayoutParams = new FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
			    	fLayoutParams.gravity = Gravity.BOTTOM;
			    	bannerLayout.setLayoutParams(fLayoutParams);
				    ((ViewGroup) getParentGroup().getParent()).addView(bannerLayout, 1);
			    	FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			    	params.gravity = Gravity.CENTER;
			    	banner.setLayoutParams(params);
				    bannerLayout.addView(banner);
				} else if (position == BOTTOM_RIGHT) {
					FrameLayout.LayoutParams fLayoutParams = new FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
			    	fLayoutParams.gravity = Gravity.BOTTOM;
			    	FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			    	params.gravity = Gravity.RIGHT;
			    	banner.setLayoutParams(params);
			    	bannerLayout.setLayoutParams(fLayoutParams);
				    ((ViewGroup) getParentGroup().getParent()).addView(bannerLayout, 1);
				    bannerLayout.addView(banner);
				}
				
				AdiveryBannerCallback callback = new AdiveryBannerCallback() {
				    @Override
				    public void onAdLoaded(View ad) {
				        banner.addView(ad);
				    }
				};

				Adivery.requestBannerAd(mActivity, zoneId, bannerType, callback);
			}
		});
	}
	
	private void createBannerAtXY(final String zoneId, final int x, final int y, final BannerType bannerType) {
		mActivity.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				if (bannerLayout != null) {
					_removeBanner();
				}
				bannerLayout = new FrameLayout(mActivity);
			    FrameLayout.LayoutParams fLayoutParams = new FrameLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
			    fLayoutParams.leftMargin = x;
		    	fLayoutParams.topMargin = y;
			    bannerLayout.setLayoutParams(fLayoutParams);
			    ((ViewGroup) getParentGroup().getParent()).addView(bannerLayout, 1);
			    banner = new RelativeLayout(mActivity);
			    bannerLayout.addView(banner);
			    AdiveryBannerCallback callback = new AdiveryBannerCallback() {
				    @Override
				    public void onAdLoaded(View ad) {
				        banner.addView(ad);
				        String json = String.format("{'adType':'%s'}", new Object[] { "Banner" });
					    fireEvent("adivery", "onAdLoaded", json);
				    }
				};

				Adivery.requestBannerAd(mActivity, zoneId, bannerType, callback);
			}
		});
	}

	private void removeBanner() {
		if (bannerLayout == null)
		      return;
	    if (mActivity != null) {
	    	mActivity.runOnUiThread(new Runnable() {
	        public void run() {
	        	ViewGroup viewGroup;
      		if (((viewGroup = getParentGroup()) != null) && ((viewGroup instanceof ViewGroup)) && (((ViewGroup)viewGroup.getParent()).getChildAt(1) != null))
      			((ViewGroup)viewGroup.getParent()).removeViewAt(1);
	        }
	      });
	    }
	}
	
	private void _removeBanner() {
		if (bannerLayout == null)
		      return;
	    if (mActivity != null) {
	    	mActivity.runOnUiThread(new Runnable() {
		        public void run() {
		        	ViewGroup viewGroup;
	        		if (((viewGroup = getParentGroup()) != null) && ((viewGroup instanceof ViewGroup)) && (((ViewGroup)viewGroup.getParent()).getChildAt(1) != null))
	        			((ViewGroup)viewGroup.getParent()).removeViewAt(1);
		        }
	    	});
	    }
	}

	private void showBanner() {
		try {
			if (mActivity != null) {
		    	mActivity.runOnUiThread(new Runnable() {
			        public void run() {
						banner.setVisibility(View.VISIBLE);
						bannerLayout.setVisibility(View.VISIBLE);
			        }
		    	});
		    }
		} catch(Exception e) {
			Log.e(TAG, e.getMessage());
		}
	}

	private void hideBanner() {
		try {
			if (mActivity != null) {
		    	mActivity.runOnUiThread(new Runnable() {
			        public void run() {
						banner.setVisibility(View.INVISIBLE);
						bannerLayout.setVisibility(View.INVISIBLE);
			        }
		    	});
		    }
		} catch(Exception e) {
			Log.e(TAG, e.getMessage());
		}
	}
	
	private ViewGroup getParentGroup() {
	    try {
	      return (ViewGroup)this.webView.getClass().getMethod("getView", new Class[0]).invoke(this.webView, new Object[0]);
	    } catch (Exception ex) {
	    	try {
	    		return (ViewGroup)this.webView.getClass().getMethod("getParent", new Class[0]).invoke(this.webView, new Object[0]);
	    	} catch (Exception e) {
	    		e.printStackTrace(); 
	        }
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
				String json = String.format("{'adType':'%s'}", new Object[] { "Rewarded" });
			    fireEvent("adivery", "onAdLoaded", json);
		    }

		    @Override
		    public void onAdRewarded() {
		    	loadedAd = null;
				String json = String.format("{'adType':'%s'}", new Object[] { "Rewarded" });
			    fireEvent("adivery", "onAdRewarded", json);
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
	
	public void fireEvent(String obj, String eventName, String jsonData) {
			String js;
			if("window".equals(obj)) {
				js = "var evt=document.createEvent('UIEvents');evt.initUIEvent('" + eventName + "',true,false,window,0);window.dispatchEvent(evt);";
			} else {
				js = "javascript:cordova.fireDocumentEvent('" + eventName + "'";
				if(jsonData != null) {
					js += "," + jsonData;
				}
				js += ");";
			}
			webView.loadUrl(js);
	}
}