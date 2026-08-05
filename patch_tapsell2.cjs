const fs = require('fs');
const path = './src/components/TapsellAds.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/if \(e\.adType === "rewardedVideo"\) \{/g, 'if (data.adType === "rewardedVideo") {');

fs.writeFileSync(path, content, 'utf8');
console.log('Patched TapsellAds.tsx successfully with regex global');
