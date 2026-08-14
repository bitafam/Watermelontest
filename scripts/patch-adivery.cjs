const fs = require('fs');
const path = require('path');

// 1. Patch node_modules/adivery-cordova-plugin/src/build.gradle
const gradlePath = path.join(__dirname, '..', 'node_modules', 'adivery-cordova-plugin', 'src', 'build.gradle');
if (fs.existsSync(gradlePath)) {
  const gradleContent = `repositories {
  google()
  mavenCentral()
}
dependencies {
  implementation 'com.adivery:sdk:3.4.1'
}
`;
  fs.writeFileSync(gradlePath, gradleContent, 'utf8');
  console.log('Successfully patched adivery-cordova-plugin/src/build.gradle');
}

// 2. Patch node_modules/adivery-cordova-plugin/src/AdiveryPlugin.java
const pluginSrcPath = path.join(__dirname, '..', 'node_modules', 'adivery-cordova-plugin', 'src', 'AdiveryPlugin.java');
const nativePluginPath = path.join(__dirname, '..', 'android', 'capacitor-cordova-android-plugins', 'src', 'main', 'java', 'miladesign', 'cordova', 'AdiveryPlugin.java');

if (fs.existsSync(nativePluginPath) && fs.existsSync(pluginSrcPath)) {
  const goodContent = fs.readFileSync(nativePluginPath, 'utf8');
  fs.writeFileSync(pluginSrcPath, goodContent, 'utf8');
  console.log('Successfully synced AdiveryPlugin.java to node_modules');
}
