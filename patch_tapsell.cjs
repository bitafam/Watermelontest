const fs = require('fs');
const path = './src/components/TapsellAds.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  '      const onResponse = (e: any) => {',
  '      const onResponse = (e: any) => {\n        const data = e.detail || e.data || e;'
).replace(
  '        if (e.adType === "rewardedVideo") {',
  '        if (data.adType === "rewardedVideo") {'
).replace(
  '          window.TapsellPlus.showRewardedVideo(e.responseId);',
  '          window.TapsellPlus.showRewardedVideo(data.responseId);'
).replace(
  '      const onError = (e: any) => {',
  '      const onError = (e: any) => {\n        const data = e.detail || e.data || e;'
).replace(
  '        if (e.adType === "rewardedVideo") {',
  '        if (data.adType === "rewardedVideo") {'
).replace(
  '          console.error("Tapsell Video Error", e.message);',
  '          console.error("Tapsell Video Error", data.message);'
).replace(
  '      const onClosed = (e: any) => {',
  '      const onClosed = (e: any) => {\n        const data = e.detail || e.data || e;'
).replace(
  '        if (e.adType === "rewardedVideo") {',
  '        if (data.adType === "rewardedVideo") {'
).replace(
  '      const onRewarded = (e: any) => {',
  '      const onRewarded = (e: any) => {\n        const data = e.detail || e.data || e;'
).replace(
  '        if (e.adType === "rewardedVideo") {',
  '        if (data.adType === "rewardedVideo") {'
);

fs.writeFileSync(path, content, 'utf8');
console.log('Patched TapsellAds.tsx successfully with regex/replace');
