const fs = require('fs');
const path = './android/app/build.gradle';
let content = fs.readFileSync(path, 'utf8');

const target = `    defaultConfig {\n        applicationId "com.apps.wmqd"`;
const replacement = `    defaultConfig {\n        applicationId "com.apps.wmqd"\n        manifestPlaceholders = [\n            marketApplicationId : "com.apps.wmqd",\n            marketBindAddress   : "com.apps.wmqd.market.BIND",\n            marketPermission    : "com.apps.wmqd.market.PERMISSION"\n        ]`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Patched build.gradle successfully');
} else {
    console.log('Target not found');
}
