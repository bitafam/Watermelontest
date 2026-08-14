cordova.define("adivery-cordova-plugin.Adivery", function(require, exports, module) { 
var exec = require('cordova/exec');

var Adivery = {
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
        BANNER: 1,
        LARGE_BANNER: 2,
        MEDIUM_RECTANGLE: 3
    },
    initialize: function(appId) {
        cordova.exec(
			null,
			null,
            'Adivery',
            'init',
            [ appId ]
        ); 
    },
    createBanner: function(zoneId, position, type) {
        try {
            console.log("[Adivery.js] Banner: calling cordova.exec('Adivery', 'createBanner', ...)", { zoneId: zoneId, position: position, type: type });
            if (typeof window !== "undefined" && window.dispatchEvent) {
                var evt = new CustomEvent("onBannerCordovaExecCalling", {
                    detail: { zoneId: zoneId, position: position, type: type, timestamp: Date.now() }
                });
                window.dispatchEvent(evt);
            }
        } catch (e) {
            console.error("[Adivery.js] Error dispatching onBannerCordovaExecCalling", e);
        }

        cordova.exec(
			function(win) {
                console.log("[Adivery.js] Banner: cordova.exec success callback", win);
            },
			function(err) {
                console.error("[Adivery.js] Banner: cordova.exec error callback", err);
                try {
                    if (typeof window !== "undefined" && window.dispatchEvent) {
                        var errEvt = new CustomEvent("onBannerCordovaExecError", {
                            detail: { error: err, timestamp: Date.now() }
                        });
                        window.dispatchEvent(errEvt);
                    }
                } catch (ignore) {}
            },
            'Adivery',
            'createBanner',
            [ zoneId, position, type ]
        );

        try {
            console.log("[Adivery.js] Banner: cordova.exec('createBanner') invocation completed (sync return)");
            if (typeof window !== "undefined" && window.dispatchEvent) {
                var retEvt = new CustomEvent("onBannerCordovaExecReturned", {
                    detail: { zoneId: zoneId, timestamp: Date.now() }
                });
                window.dispatchEvent(retEvt);
            }
        } catch (e) {
            console.error("[Adivery.js] Error dispatching onBannerCordovaExecReturned", e);
        }
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
            [ ]
        ); 
    },
    showBanner: function() {
        cordova.exec(
			null,
			null,
            'Adivery',
            'showBanner',
            [ ]
        ); 
    },
    hideBanner: function() {
        cordova.exec(
			null,
			null,
            'Adivery',
            'hideBanner',
            [ ]
        ); 
    },
    requestInterstitialAd: function(zoneId) {
        cordova.exec(
			null,
			null,
            'Adivery',
            'requestInterstitialAd',
            [ zoneId ]
        ); 
    },
    requestRewardedAd: function(zoneId) {
        cordova.exec(
			null,
			null,
            'Adivery',
            'requestRewardedAd',
            [ zoneId ]
        ); 
    },
    showAd: function() {
        cordova.exec(
			null,
			null,
            'Adivery',
            'showAd',
            [ ]
        ); 
    }
};

module.exports = Adivery;
});