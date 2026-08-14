
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
          "id": "adivery-cordova-plugin.Adivery",
          "file": "plugins/adivery-cordova-plugin/www/Adivery.js",
          "pluginId": "adivery-cordova-plugin",
        "clobbers": [
          "window.Adivery"
        ]
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "adivery-cordova-plugin": "3.4.2",
      "cordova-plugin-android-iab": "1.0.0"
    };
    // BOTTOM OF METADATA
    });
    