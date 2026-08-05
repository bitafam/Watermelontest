const fs = require('fs');
const path = './src/components/TapsellAds.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `    // Small delay to ensure Cordova/Capacitor is ready
    setTimeout(initAndShowBanner, 1000);`;

const replacement = `    let initInterval: any;
    if (window.TapsellPlus) {
      initAndShowBanner();
    } else {
      initInterval = setInterval(() => {
        if (window.TapsellPlus) {
          clearInterval(initInterval);
          initAndShowBanner();
        }
      }, 500);
    }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Patched TapsellBanner successfully');
} else {
    console.log('Target not found in TapsellBanner');
}
