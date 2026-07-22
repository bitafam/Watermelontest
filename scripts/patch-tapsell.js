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
if (fs.existsSync(capacitorJavaPath)) {
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
} else if (fs.existsSync(localJavaSourcePath)) {
  const javaContent = fs.readFileSync(localJavaSourcePath, 'utf8');
  try {
    ensureDirectoryExistence(capacitorJavaPath);
    fs.writeFileSync(capacitorJavaPath, javaContent, 'utf8');
    ensureDirectoryExistence(nodeModulesJavaPath);
    fs.writeFileSync(nodeModulesJavaPath, javaContent, 'utf8');
    console.log('>>> [PATCH] Restored TapsellPlusPlugin.java to Capacitor and node_modules');
  } catch (e) {
    console.error('>>> [PATCH] Error restoring Java source:', e.message);
  }
}

console.log('>>> [PATCH] TapsellPlus patch completed successfully!');
