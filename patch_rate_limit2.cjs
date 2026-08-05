const fs = require('fs');
const path = './src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `    // 5-minute penalty for 4 scans check
    if (validTimestamps.length >= 4) {
      const oldest = validTimestamps[0];
      const timeLeft = 5 * 60 * 1000 - (now - oldest);
      return { allowed: false, timeLeft, type: "penalty" };
    }`;

const replacement = `    // 5-minute penalty for more than 4 scans check (>= 5 scans)
    if (validTimestamps.length >= 5) {
      const oldest = validTimestamps[0];
      const timeLeft = 5 * 60 * 1000 - (now - oldest);
      return { allowed: false, timeLeft, type: "penalty" };
    }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Patched checkRateLimit penalty condition');
} else {
    console.log('Target not found for checkRateLimit');
}
