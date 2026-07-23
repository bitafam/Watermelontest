const fs = require('fs');
const path = require('path');

console.log('>>> [PATCH] Starting TapsellPlus & In-App Billing patch script...');

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname, { recursive: true });
}

// 1. TapsellPlus.js content
const tapsellJsContent = `var exec = require('cordova/exec');

var TapsellPlus = {
	initialize: function (appKey, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'initialize', [appKey]);
	},
	setGDPRConsent: function (consent, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'setGDPRConsent', [consent]);
	},
	showBannerAd: function (zoneId, position, size, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'showBannerAd', [zoneId, position, size]);
	},
	requestBannerAd: function (zoneId, position, size, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'requestBannerAd', [zoneId, position, size]);
	},
	requestStandardBannerAd: function (zoneId, position, size, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'requestStandardBannerAd', [zoneId, position, size]);
	},
	showStandardBannerAd: function (zoneId, position, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'showStandardBannerAd', [zoneId, position]);
	},
	destroyStandardBanner: function (zoneId, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'destroyStandardBanner', [zoneId]);
	},
	requestNativeBannerAd: function (zoneId, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'requestNativeBannerAd', [zoneId]);
	},
	showNativeBannerAd: function (zoneId, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'showNativeBannerAd', [zoneId]);
	},
	destroyNativeBanner: function (zoneId, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'destroyNativeBanner', [zoneId]);
	},
	requestRewardedVideoAd: function (zoneId, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'requestRewardedVideoAd', [zoneId]);
	},
	showRewardedVideoAd: function (responseId, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'showRewardedVideoAd', [responseId]);
	},
	requestInterstitialAd: function (zoneId, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'requestInterstitialAd', [zoneId]);
	},
	showInterstitialAd: function (responseId, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'showInterstitialAd', [responseId]);
	},
	purchaseFullVersion: function (successCallback, errorCallback) {
		exec(successCallback, function(err) {
			if (err === 'Class not found' || (typeof err === 'string' && err.indexOf('not found') !== -1)) {
				exec(successCallback, errorCallback, 'TapsellPlus', 'purchaseFullVersion', []);
			} else {
				if (errorCallback) errorCallback(err);
			}
		}, 'TapsellPlusPlugin', 'purchaseFullVersion', []);
	},
	checkFullVersion: function (successCallback, errorCallback) {
		exec(successCallback, function(err) {
			if (err === 'Class not found' || (typeof err === 'string' && err.indexOf('not found') !== -1)) {
				exec(successCallback, errorCallback, 'TapsellPlus', 'checkFullVersion', []);
			} else {
				if (errorCallback) errorCallback(err);
			}
		}, 'TapsellPlusPlugin', 'checkFullVersion', []);
	}
};

module.exports = TapsellPlus;
`;

// Write JS files
const nodeModulesJsPath = path.join(__dirname, '..', 'node_modules', 'tapsell-plus-cordova-plugin', 'www', 'TapsellPlus.js');
const assetsJsPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'public', 'plugins', 'tapsell-plus-cordova-plugin', 'www', 'TapsellPlus.js');

try {
  ensureDirectoryExistence(nodeModulesJsPath);
  fs.writeFileSync(nodeModulesJsPath, tapsellJsContent, 'utf8');
  console.log('>>> [PATCH] Wrote TapsellPlus.js to node_modules');
} catch (e) {
  console.error('>>> [PATCH] Error writing node_modules JS:', e.message);
}

try {
  ensureDirectoryExistence(assetsJsPath);
  fs.writeFileSync(assetsJsPath, tapsellJsContent, 'utf8');
  console.log('>>> [PATCH] Wrote TapsellPlus.js to Android assets');
} catch (e) {
  console.error('>>> [PATCH] Error writing assets JS:', e.message);
}

// 2. AIDL content
const aidlContent = `package ir.mservices.market.billing;

import android.os.Bundle;

interface IInAppBillingService {
    int isBillingSupported(int apiVersion, String packageName, String type);
    Bundle getSkuDetails(int apiVersion, String packageName, String type, in Bundle skusBundle);
    Bundle getBuyIntent(int apiVersion, String packageName, String sku, String type, String developerPayload);
    Bundle getPurchases(int apiVersion, String packageName, String type, String continuationToken);
    int consumePurchase(int apiVersion, String packageName, String purchaseToken);
}
`;

const appAidlPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'aidl', 'ir', 'mservices', 'market', 'billing', 'IInAppBillingService.aidl');
const pluginAidlPath = path.join(__dirname, '..', 'android', 'capacitor-cordova-android-plugins', 'src', 'main', 'aidl', 'ir', 'mservices', 'market', 'billing', 'IInAppBillingService.aidl');

try {
  ensureDirectoryExistence(appAidlPath);
  fs.writeFileSync(appAidlPath, aidlContent, 'utf8');
  ensureDirectoryExistence(pluginAidlPath);
  fs.writeFileSync(pluginAidlPath, aidlContent, 'utf8');
  console.log('>>> [PATCH] Synced IInAppBillingService.aidl to both app and plugin modules');
} catch (e) {
  console.error('>>> [PATCH] Error writing AIDL files:', e.message);
}

// 2.1 Ensure buildFeatures { aidl true } in build.gradle files
const appGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
const pluginGradlePath = path.join(__dirname, '..', 'android', 'capacitor-cordova-android-plugins', 'build.gradle');

[appGradlePath, pluginGradlePath].forEach(gradlePath => {
  try {
    if (fs.existsSync(gradlePath)) {
      let content = fs.readFileSync(gradlePath, 'utf8');
      if (!content.includes('aidl true')) {
        content = content.replace('android {', 'android {\n    buildFeatures {\n        aidl true\n    }');
        fs.writeFileSync(gradlePath, content, 'utf8');
        console.log(`>>> [PATCH] Enabled aidl true in ${path.relative(__dirname, gradlePath)}`);
      }
    }
  } catch (e) {
    console.error(`>>> [PATCH] Error updating ${gradlePath}:`, e.message);
  }
});

// 3. Java Plugin File & Config XML
const capacitorJavaPath = path.join(__dirname, '..', 'android', 'capacitor-cordova-android-plugins', 'src', 'main', 'java', 'miladesign', 'cordova', 'TapsellPlusPlugin.java');
const nodeModulesJavaPath = path.join(__dirname, '..', 'node_modules', 'tapsell-plus-cordova-plugin', 'src', 'TapsellPlusPlugin.java');
const configXmlPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'xml', 'config.xml');

function patchJavaFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // 1. Ensure required imports exist
      const requiredImports = [
        'import android.widget.LinearLayout;',
        'import java.util.List;',
        'import android.content.pm.ResolveInfo;',
        'import android.net.Uri;',
        'import ir.mservices.market.billing.IInAppBillingService;'
      ];

      requiredImports.forEach(imp => {
        if (!content.includes(imp)) {
          content = content.replace('package miladesign.cordova;', `package miladesign.cordova;\n\n${imp}`);
          modified = true;
        }
      });

      // 2. Fix old startActivityForResult call
      if (content.includes('cordova.startActivityForResult')) {
        const oldCall = /cordova\.startActivityForResult\([^)]+\);/g;
        const newCall = `try {
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
									}`;
        content = content.replace(oldCall, newCall);
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`>>> [PATCH] Patched ${path.relative(__dirname, filePath)} successfully`);
      }
    }
  } catch (e) {
    console.error(`>>> [PATCH] Error patching Java file ${filePath}:`, e.message);
  }
}

[nodeModulesJavaPath, capacitorJavaPath].forEach(patchJavaFile);

console.log('>>> [PATCH] TapsellPlus & In-App Billing patch completed successfully!');
