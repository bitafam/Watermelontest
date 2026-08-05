const fs = require('fs');
const path = require('path');

console.log('>>> [PATCH] Starting TapsellPlus & In-App Billing patch script...');

// Path 1: Source Java Plugin in node_modules
const nodeModulesJavaPath = path.join(__dirname, '..', 'node_modules', 'tapsell-plus-cordova-plugin', 'src', 'TapsellPlusPlugin.java');

// Path 2: Destination Java Plugin in Capacitor Android plugins
const capacitorJavaPath = path.join(__dirname, '..', 'android', 'capacitor-cordova-android-plugins', 'src', 'main', 'java', 'miladesign', 'cordova', 'TapsellPlusPlugin.java');

// Path 3: Source Java file in our project root if saved
const localJavaSourcePath = path.join(__dirname, 'TapsellPlusPlugin.java');

// Source JS files
const nodeModulesJsPath = path.join(__dirname, '..', 'node_modules', 'tapsell-plus-cordova-plugin', 'www', 'TapsellPlus.js');
const assetsJsPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'public', 'plugins', 'tapsell-plus-cordova-plugin', 'www', 'TapsellPlus.js');

// 1. Ensure JS files exist with full methods
const tapsellJsContent = `var exec = require('cordova/exec');

var TapsellPlus = {
	BANNER_320x50: 1,
	TOP_BOTTOM_GRAVITY_CENTER: 1,
	TOP_BOTTOM_GRAVITY_BOTTOM: 2,
	TOP_BOTTOM_GRAVITY_TOP: 1,

	initialize: function (appKey, successCallback, errorCallback) {
		var key = (typeof appKey === 'object' && appKey !== null) ? (appKey.appKey || appKey.appId || appKey.app_key || '') : appKey;
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'initialize', [key]);
	},
	setGDPRConsent: function (consent, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'setGDPRConsent', [consent]);
	},
	showBannerAd: function (zoneId, position, size, successCallback, errorCallback) {
		var zId = (typeof zoneId === 'object' && zoneId !== null) ? (zoneId.zoneId || zoneId.zone_id || zoneId.responseId || zoneId.response_id || '') : zoneId;
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'showBannerAd', [zId, position || 2, size || 1]);
	},
	requestBannerAd: function (zoneId, position, size, successCallback, errorCallback) {
		var zId = (typeof zoneId === 'object' && zoneId !== null) ? (zoneId.zoneId || zoneId.zone_id || '') : zoneId;
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'requestBannerAd', [zId, position || 2, size || 1]);
	},
	requestStandardBannerAd: function (zoneId, position, size, successCallback, errorCallback) {
		var zId = zoneId;
		var pos = 2;
		var sz = 1;
		var sCb = successCallback;
		var eCb = errorCallback;

		if (typeof zoneId === 'object' && zoneId !== null) {
			zId = zoneId.zoneId || zoneId.zone_id || '';
			sz = zoneId.bannerType || zoneId.size || 1;
			sCb = position;
			eCb = size;
		} else {
			pos = position || 2;
			sz = size || 1;
		}
		exec(sCb, eCb, 'TapsellPlusPlugin', 'requestStandardBannerAd', [zId, pos, sz]);
	},
	showStandardBannerAd: function (zoneIdOrOptions, positionOrSuccess, successOrError, errorCb) {
		var zId = zoneIdOrOptions;
		var pos = 2;
		var sCb = positionOrSuccess;
		var eCb = successOrError;

		if (typeof zoneIdOrOptions === 'object' && zoneIdOrOptions !== null) {
			zId = zoneIdOrOptions.responseId || zoneIdOrOptions.response_id || zoneIdOrOptions.zoneId || zoneIdOrOptions.zone_id || '';
			if (zoneIdOrOptions.verticalGravity === 2 || zoneIdOrOptions.verticalGravity === 80) pos = 2;
			sCb = positionOrSuccess;
			eCb = successOrError;
		} else if (typeof positionOrSuccess === 'number') {
			pos = positionOrSuccess;
			sCb = successOrError;
			eCb = errorCb;
		}
		exec(sCb, eCb, 'TapsellPlusPlugin', 'showStandardBannerAd', [zId, pos]);
	},
	hideStandardBannerAd: function (successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'hideBanner', []);
	},
	destroyStandardBanner: function (zoneId, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'destroyStandardBanner', [zoneId]);
	},
	requestNativeBannerAd: function (zoneId, successCallback, errorCallback) {
		var zId = (typeof zoneId === 'object' && zoneId !== null) ? (zoneId.zoneId || zoneId.zone_id || '') : zoneId;
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'requestNativeBannerAd', [zId]);
	},
	showNativeBannerAd: function (zoneId, successCallback, errorCallback) {
		var zId = (typeof zoneId === 'object' && zoneId !== null) ? (zoneId.zoneId || zoneId.zone_id || '') : zoneId;
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'showNativeBannerAd', [zId]);
	},
	destroyNativeBanner: function (zoneId, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'destroyNativeBanner', [zoneId]);
	},
	requestRewardedVideoAd: function (zoneId, successCallback, errorCallback) {
		var zId = (typeof zoneId === 'object' && zoneId !== null) ? (zoneId.zoneId || zoneId.zone_id || '') : zoneId;
		var sCb = successCallback;
		var eCb = errorCallback;
		if (typeof zoneId === 'object' && zoneId !== null && typeof successCallback === 'function') {
			sCb = successCallback;
			eCb = errorCallback;
		}
		exec(sCb, eCb, 'TapsellPlusPlugin', 'requestRewardedVideoAd', [zId]);
	},
	showRewardedVideoAd: function (responseId, successCallback, rewardCallback, errorCallback) {
		var resId = (typeof responseId === 'object' && responseId !== null) ? (responseId.responseId || responseId.response_id || '') : responseId;
		var sCb = successCallback;
		var eCb = errorCallback;
		if (typeof rewardCallback === 'function') {
			eCb = errorCallback;
		} else if (typeof rewardCallback === 'function' || typeof errorCallback === 'undefined') {
			eCb = rewardCallback;
		}
		exec(sCb, eCb, 'TapsellPlusPlugin', 'showRewardedVideoAd', [resId]);
	},
	requestInterstitialAd: function (zoneId, successCallback, errorCallback) {
		var zId = (typeof zoneId === 'object' && zoneId !== null) ? (zoneId.zoneId || zoneId.zone_id || '') : zoneId;
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'requestInterstitialAd', [zId]);
	},
	showInterstitialAd: function (responseId, successCallback, errorCallback) {
		var resId = (typeof responseId === 'object' && responseId !== null) ? (responseId.responseId || responseId.response_id || '') : responseId;
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'showInterstitialAd', [resId]);
	},
	purchaseFullVersion: function (successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'purchaseFullVersion', []);
	},
	checkFullVersion: function (successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'checkFullVersion', []);
	}
};

module.exports = TapsellPlus;
`;

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// Write TapsellPlus.js to node_modules if present
try {
  ensureDirectoryExistence(nodeModulesJsPath);
  fs.writeFileSync(nodeModulesJsPath, tapsellJsContent, 'utf8');
  console.log('>>> [PATCH] Wrote TapsellPlus.js to node_modules');
} catch (e) {
  console.error('>>> [PATCH] Error writing node_modules JS:', e.message);
}

// Write TapsellPlus.js to android assets if directory exists
try {
  ensureDirectoryExistence(assetsJsPath);
  fs.writeFileSync(assetsJsPath, tapsellJsContent, 'utf8');
  console.log('>>> [PATCH] Wrote TapsellPlus.js to Android assets');
} catch (e) {
  console.error('>>> [PATCH] Error writing assets JS:', e.message);
}

// 2. Sync patched Java Plugin file
if (fs.existsSync(localJavaSourcePath)) {
  const javaContent = fs.readFileSync(localJavaSourcePath, 'utf8');
  try {
    ensureDirectoryExistence(capacitorJavaPath);
    fs.writeFileSync(capacitorJavaPath, javaContent, 'utf8');
    console.log('>>> [PATCH] Copied master TapsellPlusPlugin.java to Capacitor Android');
  } catch (e) {
    console.error('>>> [PATCH] Error copying Java source to Capacitor:', e.message);
  }

  try {
    ensureDirectoryExistence(nodeModulesJavaPath);
    fs.writeFileSync(nodeModulesJavaPath, javaContent, 'utf8');
    console.log('>>> [PATCH] Copied master TapsellPlusPlugin.java to node_modules');
  } catch (e) {
    console.error('>>> [PATCH] Error copying Java source to node_modules:', e.message);
  }
} else if (fs.existsSync(capacitorJavaPath)) {
  const javaContent = fs.readFileSync(capacitorJavaPath, 'utf8');
  
  // Copy to local backup/source
  try {
    ensureDirectoryExistence(localJavaSourcePath);
    fs.writeFileSync(localJavaSourcePath, javaContent, 'utf8');
  } catch (e) {}

  // Copy to node_modules so `cap sync` picks up the patched Java file
  try {
    ensureDirectoryExistence(nodeModulesJavaPath);
    fs.writeFileSync(nodeModulesJavaPath, javaContent, 'utf8');
    console.log('>>> [PATCH] Patched TapsellPlusPlugin.java in node_modules');
  } catch (e) {
    console.error('>>> [PATCH] Error patching node_modules Java:', e.message);
  }
}

// 3. Sync IInAppBillingService.aidl file
const localAidlSourcePath = path.join(__dirname, 'IInAppBillingService.aidl');
const capacitorAidlPath = path.join(__dirname, '..', 'android', 'capacitor-cordova-android-plugins', 'src', 'main', 'aidl', 'com', 'android', 'vending', 'billing', 'IInAppBillingService.aidl');
const appAidlPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'aidl', 'com', 'android', 'vending', 'billing', 'IInAppBillingService.aidl');
const nodeModulesAidlPath = path.join(__dirname, '..', 'node_modules', 'tapsell-plus-cordova-plugin', 'src', 'aidl', 'com', 'android', 'vending', 'billing', 'IInAppBillingService.aidl');

const defaultAidlContent = `package com.android.vending.billing;

import android.os.Bundle;

interface IInAppBillingService {
    int isBillingSupported(int apiVersion, String packageName, String type);
    Bundle getSkuDetails(int apiVersion, String packageName, String type, in Bundle skusBundle);
    Bundle getBuyIntent(int apiVersion, String packageName, String sku, String type, String developerPayload);
    Bundle getPurchases(int apiVersion, String packageName, String type, String continuationToken);
    int consumePurchase(int apiVersion, String packageName, String purchaseToken);
}
`;

let aidlContent = defaultAidlContent;
if (fs.existsSync(localAidlSourcePath)) {
  aidlContent = fs.readFileSync(localAidlSourcePath, 'utf8');
} else {
  try {
    ensureDirectoryExistence(localAidlSourcePath);
    fs.writeFileSync(localAidlSourcePath, defaultAidlContent, 'utf8');
  } catch (e) {}
}

[capacitorAidlPath, nodeModulesAidlPath].forEach((p) => {
  try {
    ensureDirectoryExistence(p);
    fs.writeFileSync(p, aidlContent, 'utf8');
    console.log('>>> [PATCH] Synced IInAppBillingService.aidl to:', p);
  } catch (e) {
    console.error('>>> [PATCH] Error syncing AIDL to', p, ':', e.message);
  }
});

// Patch plugin.xml so cap sync copies the AIDL file
const pluginXmlPath = path.join(__dirname, '..', 'node_modules', 'tapsell-plus-cordova-plugin', 'plugin.xml');
if (fs.existsSync(pluginXmlPath)) {
  let pluginXml = fs.readFileSync(pluginXmlPath, 'utf8');
  if (!pluginXml.includes('IInAppBillingService.aidl')) {
    pluginXml = pluginXml.replace(
      '<source-file src="src/TapsellPlusPlugin.java" target-dir="src/miladesign/cordova" />',
      '<source-file src="src/TapsellPlusPlugin.java" target-dir="src/miladesign/cordova" />\n\t\t<source-file src="src/aidl/com/android/vending/billing/IInAppBillingService.aidl" target-dir="src/com/android/vending/billing" />'
    );
    fs.writeFileSync(pluginXmlPath, pluginXml, 'utf8');
    console.log('>>> [PATCH] Patched plugin.xml to include IInAppBillingService.aidl');
  }
}

// Remove from app to avoid duplicate class
[appAidlPath].forEach((p) => {
  try {
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log('>>> [PATCH] Removed duplicate AIDL from:', p);
    }
  } catch (e) {
    // Ignore
  }
});

console.log('>>> [PATCH] TapsellPlus patch completed successfully!');
