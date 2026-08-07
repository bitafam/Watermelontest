cordova.define("tapsell-plus-cordova-plugin.TapsellPlus", function(require, exports, module) { 
module.exports = {
	AD_POSITION: {
        TOP_LEFT: 0,
        TOP_CENTER: 1,
		TOP_RIGHT: 2,
		LEFT: 3,
		CENTER: 4,
		RIGHT: 5,
		BOTTOM_LEFT: 6,
		BOTTOM_CENTER: 7,
		BOTTOM_RIGHT: 8
    },
	AD_SIZE: {
        BANNER_320x50: 1,
		BANNER_320x100: 2,
		BANNER_250x250: 3,
		BANNER_300x250: 4,
		BANNER_468x60: 5,
		BANNER_728x90: 6,
		BANNER_160x600: 7
    },
    initialize: function(appKey) {
        cordova.exec(
			null,
			null,
            'TapsellPlus',
            'initialize',
            [appKey]
        ); 
    },
    createBanner: function(zoneId, position, size) {
        cordova.exec(
			null,
			null,
            'TapsellPlus',
            'createBanner',
            [ zoneId, position, size ]
        ); 
    },
    createBannerAtXY: function(zoneId, x, y, size) {
        cordova.exec(
			null,
			null,
            'TapsellPlus',
            'createBannerAtXY',
            [ zoneId, x, y, size ]
        ); 
    },
    removeBanner: function() {
        cordova.exec(
			null,
			null,
            'TapsellPlus',
            'removeBanner',
            []
        ); 
    },
    showBanner: function() {
        cordova.exec(
			null,
			null,
            'TapsellPlus',
            'showBanner',
            []
        ); 
    },
    hideBanner: function() {
        cordova.exec(
			null,
			null,
            'TapsellPlus',
            'hideBanner',
            []
        ); 
    },
    requestRewardedVideo: function (zoneId) {
        var self = this;
        cordova.exec(
            null,
            null,
            'TapsellPlus',
            'requestRewardedVideo',
            [ zoneId ]
        );
    },
    requestInterstitial: function (zoneId) {
        var self = this;
        cordova.exec(
            null,
            null,
            'TapsellPlus',
            'requestInterstitial',
            [ zoneId ]
        );
    },
    showRewardedVideo: function (responseId) {
        var self = this;
        cordova.exec(
            null,
            null,
            'TapsellPlus',
            'showRewardedVideo',
            [ responseId ]
        );
    },
    showInterstitial: function (responseId) {
        var self = this;
        cordova.exec(
            null,
            null,
            'TapsellPlus',
            'showInterstitial',
            [ responseId ]
        );
    }
};
});