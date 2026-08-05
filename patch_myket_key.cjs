const fs = require('fs');
const path = './src/components/MyketUpgradePage.tsx';
let content = fs.readFileSync(path, 'utf8');

if (content.includes('rsaKey: "MIGfM')) {
    content = content.replace('rsaKey: "MIGfM', 'rsaPublicKey: "MIGfM');
    fs.writeFileSync(path, content, 'utf8');
    console.log('Patched rsaKey to rsaPublicKey in MyketUpgradePage');
} else {
    console.log('rsaKey not found in MyketUpgradePage');
}
