cordova.define("adivery-cordova-plugin.Adivery", function(require, exports, module) { 
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
		BANNER_300x250: 3
    },
    initialize: function(appID) {
        cordova.exec(
			null,
			null,
            'Adivery',
            'initialize',
            [appID]
        ); 
    },
    createBanner: function(zoneId, position, type) {
        cordova.exec(
			null,
			null,
            'Adivery',
            'createBanner',
            [ zoneId, position, type ]
        ); 
    },
    createBannerAtXY: function(zoneId, x, y, type) {
        cordova.exec(
			null,
			null,
            'Adivery',
            'createBannerAtXY',
            [ zoneId, x, y, type ]
        ); 
    },
    removeBanner: function() {
        cordova.exec(
			null,
			null,
            'Adivery',
            'removeBanner',
            []
        ); 
    },
    showBanner: function() {
        cordova.exec(
			null,
			null,
            'Adivery',
            'showBanner',
            []
        ); 
    },
    hideBanner: function() {
        cordova.exec(
			null,
			null,
            'Adivery',
            'hideBanner',
            []
        ); 
    },
    requestInterstitialAd: function (zoneId) {
        var self = this;
        cordova.exec(
            null,
            null,
            'Adivery',
            'requestInterstitialAd',
            [ zoneId ]
        );
    },
    requestRewardedAd: function (zoneId) {
        var self = this;
        cordova.exec(
            null,
            null,
            'Adivery',
            'requestRewardedAd',
            [ zoneId ]
        );
    },
    showAd: function () {
        var self = this;
        cordova.exec(
            null,
            null,
            'Adivery',
            'showAd',
            []
        );
    }
};
});