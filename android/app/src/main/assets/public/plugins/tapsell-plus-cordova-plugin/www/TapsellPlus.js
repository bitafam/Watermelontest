var exec = require('cordova/exec');

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
