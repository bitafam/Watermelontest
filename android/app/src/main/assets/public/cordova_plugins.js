
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
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
      "tapsell-plus-cordova-plugin": "2.1.8"
    };
    // BOTTOM OF METADATA
    });
    