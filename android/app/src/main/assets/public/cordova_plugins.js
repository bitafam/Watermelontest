
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "cordova-plugin-android-iab.InAppBillingPlugin",
          "file": "plugins/cordova-plugin-android-iab/www/inappbilling.js",
          "pluginId": "cordova-plugin-android-iab",
        "clobbers": [
          "inappbilling"
        ]
        },
      {
          "id": "tapsell-plus-cordova-plugin.TapsellPlus",
          "file": "plugins/tapsell-plus-cordova-plugin/www/TapsellPlus.js",
          "pluginId": "tapsell-plus-cordova-plugin",
        "clobbers": [
          "window.TapsellPlus"
        ]
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-plugin-android-iab": "1.0.0",
      "tapsell-plus-cordova-plugin": "2.1.8"
    };
    // BOTTOM OF METADATA
    });
    