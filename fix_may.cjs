const fs = require('fs');
let content = fs.readFileSync('src/pages/MayListeningTest.tsx', 'utf8');
content = content.replace(/width="640"/g, 'width="100%" style={{ maxWidth: "640px" }}');
fs.writeFileSync('src/pages/MayListeningTest.tsx', content);
