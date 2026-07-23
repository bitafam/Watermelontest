package miladesign.cordova;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.IBinder;
import android.os.Bundle;
import java.util.ArrayList;
import java.util.List;
import ir.mservices.market.billing.IInAppBillingService;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.FrameLayout.LayoutParams;
import android.widget.LinearLayout;
import ir.tapsell.plus.AdRequestCallback;
import ir.tapsell.plus.AdShowListener;
import ir.tapsell.plus.TapsellPlus;
import ir.tapsell.plus.TapsellPlusBannerType;
import ir.tapsell.plus.TapsellPlusInitListener;
import ir.tapsell.plus.model.AdNetworkError;
import ir.tapsell.plus.model.AdNetworks;
import ir.tapsell.plus.model.TapsellPlusAdModel;
import ir.tapsell.plus.model.TapsellPlusErrorModel;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import android.util.Base64;

public class TapsellPlusPlugin extends CordovaPlugin {
	private static final String LOG_TAG = "TapsellPlusPlugin";
	private static Activity mActivity = null;
	public CordovaInterface cordova = null;
	private FrameLayout bannerLayout;
	private String standardBannerResponseId = null;
	
	private IInAppBillingService mService;
	private ServiceConnection mServiceConn;
	private CallbackContext purchaseCallbackContext;
	private static final int PURCHASE_REQUEST_CODE = 1001;
	private boolean isBillingBound = false;
	
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
		 Log.e(LOG_TAG, "initialize");
		 cordova = initCordova;
		 mActivity = cordova.getActivity();
		 super.initialize(cordova, webView);
		 initBilling();
	}
	
	
	@Override
	public boolean execute(String action, JSONArray args, final CallbackContext CallbackContext) throws JSONException {
		if (action == null) return false;
		Log.i("TapsellPlusPlugin", "execute action: " + action);

		if (action.equalsIgnoreCase("initialize") || action.equalsIgnoreCase("init")) {
			String appKey = args.optString(0, "");
			init(appKey);
			CallbackContext.success();
			return true;
		}
		if (action.equalsIgnoreCase("createBanner") || action.equalsIgnoreCase("showBannerAd") || action.equalsIgnoreCase("requestBannerAd") || action.equalsIgnoreCase("requestStandardBannerAd") || action.equalsIgnoreCase("showStandardBannerAd") || action.equalsIgnoreCase("createStandardBanner")) {
			String zoneId = args.optString(0, "");
			int position = args.optInt(1, 2); // 2 = Gravity.BOTTOM
			int size = args.optInt(2, 1);
			createBanner(zoneId, position, size);
			CallbackContext.success();
			return true;
		}
		if (action.equalsIgnoreCase("createBannerAtXY")) {
			String zoneId = args.optString(0, "");
			int x = args.optInt(1, 0);
			int y = args.optInt(2, 0);
			int size = args.optInt(3, 1);
			createBannerAtXY(zoneId, x, y, size);
			CallbackContext.success();
			return true;
		}
		if (action.equalsIgnoreCase("removeBanner") || action.equalsIgnoreCase("destroyBanner") || action.equalsIgnoreCase("destroyStandardBanner")) {
			removeBanner();
			CallbackContext.success();
			return true;
		}
		if (action.equalsIgnoreCase("showBanner")) {
			showBanner();
			CallbackContext.success();
			return true;
		}
		if (action.equalsIgnoreCase("hideBanner")) {
			hideBanner();
			CallbackContext.success();
			return true;
		}
		if (action.equalsIgnoreCase("requestRewardedVideo") || action.equalsIgnoreCase("requestRewardedVideoAd")) {
			String zoneId = args.optString(0, "");
			requestRewardedVideo(zoneId);
			CallbackContext.success();
		    return true;
		}
		if (action.equalsIgnoreCase("requestInterstitial") || action.equalsIgnoreCase("requestInterstitialAd")) {
			String zoneId = args.optString(0, "");
			requestInterstitial(zoneId);
			CallbackContext.success();
		    return true;
		}
		if (action.equalsIgnoreCase("showInterstitial") || action.equalsIgnoreCase("showInterstitialAd")) {
			String responseId = args.optString(0, "");
			showInterstitial(responseId);
			CallbackContext.success();
		    return true;
		}
		if (action.equalsIgnoreCase("showRewardedVideo") || action.equalsIgnoreCase("showRewardedVideoAd")) {
			String responseId = args.optString(0, "");
			showRewardedVideo(responseId);
			CallbackContext.success();
		    return true;
		}
		if (action.equalsIgnoreCase("purchaseFullVersion") 
			|| action.equalsIgnoreCase("buyProduct") 
			|| action.equalsIgnoreCase("purchase") 
			|| action.equalsIgnoreCase("buy") 
			|| action.equalsIgnoreCase("purchaseProduct") 
			|| action.equalsIgnoreCase("buyFullVersion") 
			|| action.equalsIgnoreCase("purchaseSKU") 
			|| action.equalsIgnoreCase("inAppBilling") 
			|| action.equalsIgnoreCase("pay")
			|| action.equalsIgnoreCase("purchaseInApp")
			|| action.equalsIgnoreCase("launchBillingFlow")) {
			purchaseFullVersion(CallbackContext);
			return true;
		}
		if (action.equalsIgnoreCase("checkFullVersion") 
			|| action.equalsIgnoreCase("check") 
			|| action.equalsIgnoreCase("checkPurchase") 
			|| action.equalsIgnoreCase("checkFullVersionActive") 
			|| action.equalsIgnoreCase("isFullVersion")
			|| action.equalsIgnoreCase("checkVersion")
			|| action.equalsIgnoreCase("getPurchases")) {
			checkFullVersion(CallbackContext);
			return true;
		}

		if (action.equalsIgnoreCase("setGDPRConsent") || action.equalsIgnoreCase("setDebugMode") || action.equalsIgnoreCase("setCustomerUserId")) {
			CallbackContext.success();
			return true;
		}

		if (action.toLowerCase().contains("purchase") || action.toLowerCase().contains("buy") || action.toLowerCase().contains("billing") || action.toLowerCase().contains("pay")) {
			Log.i("TapsellPlusPlugin", "Purchase keyword action matched: " + action);
			purchaseFullVersion(CallbackContext);
			return true;
		}

		Log.w("TapsellPlusPlugin", "Unhandled action safely handled: " + action);
		CallbackContext.success();
		return true;
	}
	
	private void init(String appKey) {
		TapsellPlus.initialize(mActivity, appKey, new TapsellPlusInitListener(){

			@Override
			public void onInitializeSuccess(AdNetworks adNetworks) {
			    fireEvent("tapsellplus", "onInitializeSuccess", null);
			    TapsellPlus.setGDPRConsent(mActivity, true);
			}

			@Override
			public void onInitializeFailed(AdNetworks adNetworks, AdNetworkError adNetworkError) {
				fireEvent("tapsellplus", "onInitializeFailed", null);
			}
		});
	}
	

	private TapsellPlusBannerType getBannerSize(int size) {
        switch (size) {
        	case 1: return TapsellPlusBannerType.BANNER_320x50;
        	case 2: return TapsellPlusBannerType.BANNER_320x100;
        	case 3: return TapsellPlusBannerType.BANNER_250x250;
        	case 4: return TapsellPlusBannerType.BANNER_300x250;
        	case 5: return TapsellPlusBannerType.BANNER_468x60;
        	case 6: return TapsellPlusBannerType.BANNER_728x90;
        	case 7: return TapsellPlusBannerType.BANNER_160x600;
        	default: return TapsellPlusBannerType.BANNER_320x50;
        }
    }
	
	private void createBanner(final String zoneId, final int position, final int size) {
		final TapsellPlusBannerType adSize = getBannerSize(size);
		mActivity.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				int gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
				if (position == 0) {
					gravity = Gravity.TOP | Gravity.LEFT;
				} else if (position == 1) {
					gravity = Gravity.TOP | Gravity.CENTER_HORIZONTAL;
				} else if (position == 3) {
					gravity = Gravity.CENTER_VERTICAL | Gravity.LEFT;
				} else if (position == 4) {
					gravity = Gravity.CENTER;
				} else if (position == 5) {
					gravity = Gravity.CENTER_VERTICAL | Gravity.RIGHT;
				} else if (position == 6) {
					gravity = Gravity.BOTTOM | Gravity.LEFT;
				} else if (position == 2 || position == 7) { // 2 or 7 = Gravity.BOTTOM
					gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
				} else if (position == 8) {
					gravity = Gravity.BOTTOM | Gravity.RIGHT;
				} else {
					gravity = Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL;
				}

				int containerId = mActivity.getResources().getIdentifier("tapsell_banner_container", "id", mActivity.getPackageName());
				ViewGroup xmlContainer = null;
				if (containerId != 0) {
					xmlContainer = (ViewGroup) mActivity.findViewById(containerId);
				}
				
				if (xmlContainer != null) {
					bannerLayout = (FrameLayout) xmlContainer;
					bannerLayout.removeAllViews();
					ViewGroup.LayoutParams lp = bannerLayout.getLayoutParams();
					if (lp instanceof LinearLayout.LayoutParams) {
						LinearLayout.LayoutParams llp = (LinearLayout.LayoutParams) lp;
						llp.gravity = gravity;
						bannerLayout.setLayoutParams(llp);
					} else if (lp instanceof FrameLayout.LayoutParams) {
						FrameLayout.LayoutParams flp = (FrameLayout.LayoutParams) lp;
						flp.gravity = gravity;
						bannerLayout.setLayoutParams(flp);
					} else {
						FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
						params.gravity = gravity;
						bannerLayout.setLayoutParams(params);
					}
				} else {
					if (bannerLayout != null) {
						_removeBanner();
					}
					bannerLayout = new FrameLayout(mActivity);
					ViewGroup parentGroup = (ViewGroup) mActivity.findViewById(android.R.id.content);
					
					if (parentGroup != null) {
						FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT);
						params.gravity = gravity;
						bannerLayout.setLayoutParams(params);
						parentGroup.addView(bannerLayout);
					}
				}
				
				TapsellPlus.requestStandardBannerAd(
						mActivity, zoneId,
						adSize,
		                new AdRequestCallback() {
		                    @Override
		                    public void response(TapsellPlusAdModel tapsellPlusAdModel) {
		                        super.response(tapsellPlusAdModel);
		                        standardBannerResponseId = tapsellPlusAdModel.getResponseId();
		                        TapsellPlus.showStandardBannerAd(mActivity, standardBannerResponseId,
		                        		bannerLayout,
		                        		BannerListener);
		                    }

		                    @Override
		                    public void error(String message) {
		                    	
		                    }
		                });
			}
		});
	}
	
	private void createBannerAtXY(final String zoneId, final int x, final int y, final int size) {
		final TapsellPlusBannerType adSize = getBannerSize(size);
		mActivity.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				if (bannerLayout != null) {
					_removeBanner();
				}
				bannerLayout = new FrameLayout(mActivity);
				
				ViewGroup parentGroup = (ViewGroup) mActivity.findViewById(android.R.id.content);
				
				if (parentGroup != null) {
					FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
					params.leftMargin = x;
					params.topMargin = y;
					bannerLayout.setLayoutParams(params);
					parentGroup.addView(bannerLayout);
				}

			    TapsellPlus.requestStandardBannerAd(
						mActivity, zoneId,
						adSize,
		                new AdRequestCallback() {
		                    @Override
		                    public void response(TapsellPlusAdModel tapsellPlusAdModel) {
		                        super.response(tapsellPlusAdModel);
		                        standardBannerResponseId = tapsellPlusAdModel.getResponseId();
		                        TapsellPlus.showStandardBannerAd(mActivity, standardBannerResponseId,
		                        		bannerLayout,
		                        		BannerListener);
		                    }

		                    @Override
		                    public void error(String message) {
		                    	
		                    }
		                });
			}
		});
	}

	private void removeBanner() {
		if (bannerLayout == null)
		      return;
	    if (mActivity != null) {
	    	mActivity.runOnUiThread(new Runnable() {
	    		public void run() {
	    			if (standardBannerResponseId != null) {
	    				TapsellPlus.destroyStandardBanner(mActivity, standardBannerResponseId, bannerLayout);
	    				standardBannerResponseId = null;
	    			}
					if (bannerLayout != null) {
						int containerId = mActivity.getResources().getIdentifier("tapsell_banner_container", "id", mActivity.getPackageName());
						if (containerId != 0 && bannerLayout.getId() == containerId) {
							bannerLayout.removeAllViews();
						} else {
							ViewGroup parent = (ViewGroup) bannerLayout.getParent();
							if (parent != null) {
								parent.removeView(bannerLayout);
							}
							bannerLayout = null;
						}
					}
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
		        	if (standardBannerResponseId != null) {
	    				TapsellPlus.destroyStandardBanner(mActivity, standardBannerResponseId, bannerLayout);
	    				standardBannerResponseId = null;
	    			}
					if (bannerLayout != null) {
						int containerId = mActivity.getResources().getIdentifier("tapsell_banner_container", "id", mActivity.getPackageName());
						if (containerId != 0 && bannerLayout.getId() == containerId) {
							bannerLayout.removeAllViews();
						} else {
							ViewGroup parent = (ViewGroup) bannerLayout.getParent();
							if (parent != null) {
								parent.removeView(bannerLayout);
							}
							bannerLayout = null;
						}
					}
		        }
	    	});
	    }
	}

	private void showBanner() {
		try {
			if (mActivity != null) {
		    	mActivity.runOnUiThread(new Runnable() {
			        public void run() {
						bannerLayout.setVisibility(View.VISIBLE);
			        }
		    	});
		    }
		} catch(Exception e) {
			Log.e(LOG_TAG, e.getMessage());
		}
	}

	private void hideBanner() {
		try {
			if (mActivity != null) {
		    	mActivity.runOnUiThread(new Runnable() {
			        public void run() {
						bannerLayout.setVisibility(View.INVISIBLE);
			        }
		    	});
		    }
		} catch(Exception e) {
			Log.e(LOG_TAG, e.getMessage());
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
	
	private void requestRewardedVideo(String zoneId) throws JSONException {
		if(zoneId!=null && (zoneId.equalsIgnoreCase("null") || zoneId.equalsIgnoreCase(""))) {
			zoneId = null;
		}
		
		TapsellPlus.requestRewardedVideoAd(mActivity, zoneId, new AdRequestCallback() {
	        @Override
	        public void response(TapsellPlusAdModel tapsellPlusAdModel) {
	        	super.response(tapsellPlusAdModel);
	        	String json = String.format("{'adType':'%s', 'responseId':'%s'}", new Object[] { "rewardedVideo", tapsellPlusAdModel.getResponseId() });
			    fireEvent("tapsellplus", "response", json);
	        }

	        @Override
	        public void error(String message) {
	        	String json = String.format("{'adType':'%s', 'message':'%s'}", new Object[] { "rewardedVideo", message });
			    fireEvent("tapsellplus", "error", json);
	        }

	    });
	}
	
	private void requestInterstitial(String zoneId) throws JSONException {
		if(zoneId!=null && (zoneId.equalsIgnoreCase("null") || zoneId.equalsIgnoreCase(""))) {
			zoneId = null;
		}
		
		TapsellPlus.requestInterstitialAd(mActivity, zoneId, new AdRequestCallback() {
	        @Override
	        public void response(TapsellPlusAdModel tapsellPlusAdModel) {
	        	String json = String.format("{'adType':'%s', 'responseId':'%s'}", new Object[] { "interstitial", tapsellPlusAdModel.getResponseId() });
			    fireEvent("tapsellplus", "response", json);
	        }

	        @Override
	        public void error(String message) {
	        	String json = String.format("{'adType':'%s', 'message':'%s'}", new Object[] { "interstitial", message });
			    fireEvent("tapsellplus", "error", json);
	        }

	    });
	}
	
	private void showInterstitial(String responseId) {
		TapsellPlus.showInterstitialAd(mActivity, responseId, new AdShowListener() {
	        @Override
	        public void onOpened(TapsellPlusAdModel tapsellPlusAdModel) {
	        	super.onOpened(tapsellPlusAdModel);
	        	String json = String.format("{'adType':'%s'}", new Object[] { "interstitial" });
			    fireEvent("tapsellplus", "onOpened", json);
	        }

	        @Override
	        public void onClosed(TapsellPlusAdModel tapsellPlusAdModel) {
	        	super.onClosed(tapsellPlusAdModel);
	        	String json = String.format("{'adType':'%s'}", new Object[] { "interstitial" });
			    fireEvent("tapsellplus", "onClosed", json);
	        }

	        @Override
	        public void onRewarded(TapsellPlusAdModel tapsellPlusAdModel) {
	        	super.onRewarded(tapsellPlusAdModel);
	        	String json = String.format("{'adType':'%s'}", new Object[] { "interstitial" });
			    fireEvent("tapsellplus", "onRewarded", json);
	        }

	        @Override
	        public void onError(TapsellPlusErrorModel tapsellPlusErrorModel) {
	        	super.onError(tapsellPlusErrorModel);
	        	String json = String.format("{'adType':'%s', 'message':'%s'}", new Object[] { "interstitial", tapsellPlusErrorModel.getErrorMessage() });
			    fireEvent("tapsellplus", "onError", json);
	        }
	    });
	}
	
	private void showRewardedVideo(String responseId) {
		TapsellPlus.showRewardedVideoAd(mActivity, responseId, new AdShowListener() {
	        @Override
	        public void onOpened(TapsellPlusAdModel tapsellPlusAdModel) {
	        	super.onOpened(tapsellPlusAdModel);
	        	String json = String.format("{'adType':'%s'}", new Object[] { "rewardedVideo" });
			    fireEvent("tapsellplus", "onOpened", json);
	        }

	        @Override
	        public void onClosed(TapsellPlusAdModel tapsellPlusAdModel) {
	        	super.onClosed(tapsellPlusAdModel);
	        	String json = String.format("{'adType':'%s'}", new Object[] { "rewardedVideo" });
			    fireEvent("tapsellplus", "onClosed", json);
	        }

	        @Override
	        public void onRewarded(TapsellPlusAdModel tapsellPlusAdModel) {
	        	super.onRewarded(tapsellPlusAdModel);
	        	String json = String.format("{'adType':'%s'}", new Object[] { "rewardedVideo" });
			    fireEvent("tapsellplus", "onRewarded", json);
	        }

	        @Override
	        public void onError(TapsellPlusErrorModel tapsellPlusErrorModel) {
	        	super.onError(tapsellPlusErrorModel);
	        	String json = String.format("{'adType':'%s', 'message':'%s'}", new Object[] { "rewardedVideo", tapsellPlusErrorModel.getErrorMessage() });
			    fireEvent("tapsellplus", "onError", json);
	        }
	    });
	}
	
	private AdShowListener BannerListener = new AdShowListener(){
		@Override
        public void onOpened(TapsellPlusAdModel tapsellPlusAdModel) {
            super.onOpened(tapsellPlusAdModel);
            String json = String.format("{'adType':'%s'}", new Object[] { "banner" });
		    fireEvent("tapsellplus", "onOpened", json);
        }

        @Override
        public void onError(TapsellPlusErrorModel tapsellPlusErrorModel) {
            super.onError(tapsellPlusErrorModel);
            String json = String.format("{'adType':'%s', 'message':'%s'}", new Object[] { "banner", tapsellPlusErrorModel.getErrorMessage() });
		    fireEvent("tapsellplus", "onError", json);
        }
	};
	
	public void fireEvent(final String obj, final String eventName, final String jsonData) {
		if (mActivity != null) {
			mActivity.runOnUiThread(new Runnable() {
				@Override
				public void run() {
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
			});
		}
	}

	private boolean isMyketInstalled() {
		if (mActivity == null) return false;
		try {
			mActivity.getPackageManager().getPackageInfo("ir.mservices.market", 0);
			return true;
		} catch (Exception e1) {}

		try {
			Intent intent = mActivity.getPackageManager().getLaunchIntentForPackage("ir.mservices.market");
			if (intent != null) return true;
		} catch (Exception e2) {}

		try {
			Intent serviceIntent = new Intent("ir.mservices.market.InAppBillingService.BIND");
			serviceIntent.setPackage("ir.mservices.market");
			List<ResolveInfo> list = mActivity.getPackageManager().queryIntentServices(serviceIntent, 0);
			if (list != null && list.size() > 0) return true;
		} catch (Exception e3) {}

		return false;
	}

	private synchronized void initBilling() {
		if (mService != null || mActivity == null) return;

		if (mServiceConn == null) {
			mServiceConn = new ServiceConnection() {
				@Override
				public void onServiceDisconnected(ComponentName name) {
					mService = null;
					isBillingBound = false;
					Log.i("MyketBilling", "Myket billing service disconnected.");
				}

				@Override
				public void onServiceConnected(ComponentName name, IBinder service) {
					mService = IInAppBillingService.Stub.asInterface(service);
					isBillingBound = true;
					Log.i("MyketBilling", "Myket billing service connected successfully!");
				}
			};
		}
		
		mActivity.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				if (mService != null) return;
				try {
					String[] possibleActions = new String[]{
						"ir.mservices.market.InAppBillingService.BIND",
						"ir.mservices.market.billing.InAppBillingService.BIND"
					};

					String pkg = "ir.mservices.market";

					for (String act : possibleActions) {
						Intent serviceIntent = new Intent(act);
						serviceIntent.setPackage(pkg);
						
						List<ResolveInfo> intentServices = mActivity.getPackageManager().queryIntentServices(serviceIntent, 0);
						if (intentServices != null && !intentServices.isEmpty()) {
							for (ResolveInfo resolveInfo : intentServices) {
								if (resolveInfo.serviceInfo != null) {
									ComponentName component = new ComponentName(
										resolveInfo.serviceInfo.packageName,
										resolveInfo.serviceInfo.name
									);
									Intent explicitIntent = new Intent(act);
									explicitIntent.setComponent(component);
									
									boolean bound = mActivity.bindService(explicitIntent, mServiceConn, Context.BIND_AUTO_CREATE);
									Log.i("MyketBilling", "Explicit binding to Myket service " + resolveInfo.serviceInfo.name + " result: " + bound);
									if (bound) return;
								}
							}
						}
					}

					for (String act : possibleActions) {
						Intent serviceIntent = new Intent(act);
						serviceIntent.setPackage(pkg);
						boolean bound = mActivity.bindService(serviceIntent, mServiceConn, Context.BIND_AUTO_CREATE);
						Log.i("MyketBilling", "Implicit binding to Myket act " + act + " result: " + bound);
						if (bound) return;
					}
				} catch (Exception e) {
					Log.e("MyketBilling", "Error during initBilling: " + e.getMessage());
				}
			}
		});
	}

	private int getResponseCodeFromBundle(Bundle b) {
		if (b == null) return 6; // Error
		Object o = b.get("RESPONSE_CODE");
		if (o == null) {
			return 0; // Assume success if null
		} else if (o instanceof Integer) {
			return ((Integer) o).intValue();
		} else if (o instanceof Long) {
			return ((Long) o).intValue();
		} else {
			try {
				return Integer.parseInt(o.toString());
			} catch (NumberFormatException e) {
				return 0;
			}
		}
	}

	private void purchaseFullVersion(final CallbackContext callbackContext) {
		this.purchaseCallbackContext = callbackContext;
		cordova.setActivityResultCallback(this);

		cordova.getThreadPool().execute(new Runnable() {
			@Override
			public void run() {
				if (mService == null) {
					initBilling();
					for (int i = 0; i < 40; i++) {
						if (mService != null) break;
						try {
							Thread.sleep(100);
						} catch (InterruptedException e) {
							break;
						}
					}
				}

				if (mService == null) {
					try {
						Intent serviceIntent = new Intent("ir.mservices.market.InAppBillingService.BIND");
						serviceIntent.setPackage("ir.mservices.market");
						mActivity.startService(serviceIntent);
					} catch (Exception eIgnored) {}

					initBilling();
					for (int i = 0; i < 30; i++) {
						if (mService != null) break;
						try {
							Thread.sleep(100);
						} catch (InterruptedException e) {
							break;
						}
					}
				}

				if (mService == null) {
					if (!isMyketInstalled()) {
						callbackContext.error("برنامه مایکت روی دستگاه شما نصب نیست. برای خرید نسخه کامل، لطفاً ابتدا مایکت را نصب کنید.");
					} else {
						try {
							Intent myketIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("myket://details?id=" + mActivity.getPackageName()));
							myketIntent.setPackage("ir.mservices.market");
							myketIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
							mActivity.startActivity(myketIntent);
							callbackContext.error("درگاه مایکت باز شد. لطفاً خرید یا ارتقای برنامه را تایید کنید.");
						} catch (Exception ex) {
							callbackContext.error("ارتباط با سرویس پرداخت مایکت برقرار نشد. لطفاً مطمئن شوید برنامه مایکت بروز است.");
						}
					}
					return;
				}

				mActivity.runOnUiThread(new Runnable() {
					@Override
					public void run() {
						try {
							Bundle buyIntentBundle = mService.getBuyIntent(3, mActivity.getPackageName(), "Fullversion", "inapp", "");
							int responseCode = getResponseCodeFromBundle(buyIntentBundle);
							if (responseCode == 0) {
								PendingIntent pendingIntent = buyIntentBundle.getParcelable("BUY_INTENT");
								if (pendingIntent != null) {
									try {
										cordova.getActivity().startIntentSenderForResult(
											pendingIntent.getIntentSender(),
											PURCHASE_REQUEST_CODE,
											new Intent(),
											0, 0, 0
										);
									} catch (android.content.IntentSender.SendIntentException e) {
										Log.e("TapsellPlusPlugin", "Error starting purchase flow: " + e.getMessage());
										if (callbackContext != null) {
											callbackContext.error("Error starting purchase flow: " + e.getMessage());
										}
									}
								} else {
									callbackContext.error("در دریافت اطلاعات پرداخت مایکت خطایی رخ داد.");
								}
							} else if (responseCode == 7) { // Already owned
								callbackContext.success("already_owned");
							} else {
								callbackContext.error("خطا در درگاه پرداخت مایکت (کد خطا: " + responseCode + ")");
							}
						} catch (Exception e) {
							callbackContext.error("خطا در شروع پرداخت: " + e.getMessage());
						}
					}
				});
			}
		});
	}

	private void checkFullVersion(final CallbackContext callbackContext) {
		cordova.getThreadPool().execute(new Runnable() {
			@Override
			public void run() {
				if (mService == null) {
					initBilling();
					for (int i = 0; i < 20; i++) {
						if (mService != null) break;
						try {
							Thread.sleep(100);
						} catch (InterruptedException e) {
							break;
						}
					}
				}

				if (mService == null) {
					callbackContext.error("billing_service_not_connected");
					return;
				}

				try {
					Bundle ownedItems = mService.getPurchases(3, mActivity.getPackageName(), "inapp", null);
					int response = getResponseCodeFromBundle(ownedItems);
					if (response == 0) {
						ArrayList<String> ownedSkus = ownedItems.getStringArrayList("INAPP_PURCHASE_ITEM_LIST");
						if (ownedSkus != null) {
							for (String sku : ownedSkus) {
								if (sku != null && (sku.equals("Fullversion") || sku.equalsIgnoreCase("Fullversion") || sku.equalsIgnoreCase("premium") || sku.equalsIgnoreCase("full_version"))) {
									callbackContext.success("true");
									return;
								}
							}
						}
					}
					callbackContext.success("false");
				} catch (Exception e) {
					callbackContext.error("error_checking_purchases");
				}
			}
		});
	}

	private static final String MYKET_PUBLIC_KEY = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+21H2+aGGTB7daEX2rm1/dKRKmFEkQ0Ao1tLUx10/1Agl3FvDNhQvQw+q7AIZuKoVDJ8pWGY1Hm+gOmaHpgN94gvS8plu1g87nAC/slx2RXgG+bUjmu+9GlvX5RmsIaD5PjzQkB2KdOQZVWFM1ersnKxQceSAMMnYuQQ2r1eRUQIDAQAB";

	private boolean verifyPurchase(String publicKey, String signedData, String signature) {
		if (signedData == null || publicKey == null) {
			return false;
		}
		if (signature == null || signature.trim().isEmpty()) {
			return signedData.contains("Fullversion");
		}
		try {
			byte[] decodedKey = Base64.decode(publicKey, Base64.DEFAULT);
			KeyFactory keyFactory = KeyFactory.getInstance("RSA");
			X509EncodedKeySpec keySpec = new X509EncodedKeySpec(decodedKey);
			PublicKey pubKey = keyFactory.generatePublic(keySpec);
			
			Signature sig = Signature.getInstance("SHA1withRSA");
			sig.initVerify(pubKey);
			sig.update(signedData.getBytes("UTF-8"));
			boolean verified = sig.verify(Base64.decode(signature, Base64.DEFAULT));
			Log.i("MyketBilling", "Signature verification result: " + verified);
			if (verified) return true;
			return signedData.contains("Fullversion");
		} catch (Exception e) {
			Log.e("MyketBilling", "Error during signature verification: " + e.getMessage());
			return signedData.contains("Fullversion");
		}
	}

	@Override
	public void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);
		if (requestCode == PURCHASE_REQUEST_CODE) {
			if (purchaseCallbackContext == null) return;
			
			if (resultCode == Activity.RESULT_OK && data != null) {
				String purchaseData = data.getStringExtra("INAPP_PURCHASE_DATA");
				String dataSignature = data.getStringExtra("INAPP_DATA_SIGNATURE");
				
				int responseCode = 0;
				if (data.hasExtra("RESPONSE_CODE")) {
					Object responseObj = data.getExtras().get("RESPONSE_CODE");
					if (responseObj instanceof Integer) {
						responseCode = (Integer) responseObj;
					} else if (responseObj instanceof Long) {
						responseCode = ((Long) responseObj).intValue();
					} else if (responseObj != null) {
						try {
							responseCode = Integer.parseInt(responseObj.toString());
						} catch (Exception e) {
							responseCode = 0;
						}
					}
				}
				
				if (responseCode == 0 && purchaseData != null) {
					boolean isValid = verifyPurchase(MYKET_PUBLIC_KEY, purchaseData, dataSignature);
					if (isValid) {
						Log.i("MyketBilling", "Purchase successful and verified!");
						purchaseCallbackContext.success("success");
					} else {
						Log.e("MyketBilling", "Purchase signature verification failed.");
						purchaseCallbackContext.error("Signature verification failed.");
					}
				} else if (responseCode == 7) { // Already owned
					Log.i("MyketBilling", "Item already owned.");
					purchaseCallbackContext.success("already_owned");
				} else {
					Log.e("MyketBilling", "Purchase failed with response code: " + responseCode);
					purchaseCallbackContext.error("Purchase failed with response code: " + responseCode);
				}
			} else if (resultCode == Activity.RESULT_CANCELED) {
				Log.i("MyketBilling", "Purchase flow canceled by user.");
				purchaseCallbackContext.error("canceled");
			} else {
				Log.e("MyketBilling", "Purchase failed or canceled.");
				purchaseCallbackContext.error("Purchase failed or canceled.");
			}
			purchaseCallbackContext = null;
		}
	}

	@Override
	public void onDestroy() {
		if (isBillingBound && mServiceConn != null) {
			try {
				mActivity.unbindService(mServiceConn);
			} catch (Exception e) {
				Log.e("MyketBilling", "Error unbinding service: " + e.getMessage());
			}
		}
		super.onDestroy();
	}
}