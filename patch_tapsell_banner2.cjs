const fs = require('fs');
const path = './src/components/TapsellAds.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `    return () => {
      if (window.TapsellPlus) {`;

const replacement = `    return () => {
      if (typeof initInterval !== "undefined") clearInterval(initInterval);
      if (window.TapsellPlus) {`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Patched TapsellBanner cleanup successfully');
} else {
    console.log('Target not found in TapsellBanner cleanup');
}
