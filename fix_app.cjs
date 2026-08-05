const fs = require('fs');
const path = './src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `      {showVideoAd && (
        <TapsellVideoAd 
          onComplete={() => {
            setShowVideoAd(false);
            if (pendingActionRef.current) {
              pendingActionRef.current();
              pendingActionRef.current = null;
            }
          }}
        />
      )}
      {rateLimitTimeLeft !== null && (
        <RateLimitOverlay 
          timeLeft={rateLimitTimeLeft}
          onUpgradeClick={() => {
            setRateLimitTimeLeft(null);
            setActiveTab("upgrade");
          }}
        />
      )}
      <TapsellBanner />`;

if (content.includes(target)) {
    content = content.replace(target, '');
    fs.writeFileSync(path, content, 'utf8');
    console.log('Removed duplicate code in App.tsx');
} else {
    console.log('Target not found in App.tsx');
}
