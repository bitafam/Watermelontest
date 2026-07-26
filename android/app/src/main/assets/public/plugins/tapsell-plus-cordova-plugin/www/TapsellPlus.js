var exec = require('cordova/exec');

var listeners = {};

var TapsellPlus = {
	on: function (eventName, callback) {
		if (!listeners[eventName]) {
			listeners[eventName] = [];
		}
		listeners[eventName].push(callback);
	},
	off: function (eventName, callback) {
		if (listeners[eventName]) {
			listeners[eventName] = listeners[eventName].filter(function(cb) { return cb !== callback; });
		}
	},
	emit: function (eventName, data) {
		if (listeners[eventName]) {
			listeners[eventName].forEach(function(cb) {
				try { cb(data); } catch(e) { console.error('TapsellPlus listener error', e); }
			});
		}
	},
	initialize: function (appKey, successCallback, errorCallback) {
		if (typeof successCallback === 'function') this.on('onInitializeSuccess', successCallback);
		if (typeof errorCallback === 'function') this.on('onInitializeFailed', errorCallback);
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
	requestRewardedVideo: function (zoneId, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'requestRewardedVideoAd', [zoneId]);
	},
	showRewardedVideoAd: function (responseId, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'showRewardedVideoAd', [responseId]);
	},
	showRewardedVideo: function (responseId, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'showRewardedVideoAd', [responseId]);
	},
	createBanner: function (zoneId, position, size, successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'showBannerAd', [zoneId, position, size]);
	},
	hideBanner: function (successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'hideBanner', []);
	},
	removeBanner: function (successCallback, errorCallback) {
		exec(successCallback, errorCallback, 'TapsellPlusPlugin', 'removeBanner', []);
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
