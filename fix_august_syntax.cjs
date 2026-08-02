const fs = require('fs');
let content = fs.readFileSync('src/pages/AugustListeningTest.tsx', 'utf8');
content = content.replace(/<iframe src="https:\/\/drive\.google\.com\/file\/d\/1A-Tu0PuDY4QLt3NZpa11Ww5c7EMKUYq_\/preview" width="100%" height="150" allow="autoplay" className="border-0 rounded shadow-sm bg-white overflow-hidden max-w-\[400px\]"><\/iframe> \{ window\.open\('https:\/\/drive\.google\.com\/file\/d\/1A-Tu0PuDY4QLt3NZpa11Ww5c7EMKUYq_\/view\?usp=sharing', '_blank'\); return true; \}\}\s*\/>/g, '<iframe src="https://drive.google.com/file/d/1A-Tu0PuDY4QLt3NZpa11Ww5c7EMKUYq_/preview" width="100%" height="150" allow="autoplay" className="border-0 rounded shadow-sm bg-white overflow-hidden max-w-[400px]"></iframe>');
fs.writeFileSync('src/pages/AugustListeningTest.tsx', content);
console.log('Fixed syntax in AugustListeningTest.tsx');
