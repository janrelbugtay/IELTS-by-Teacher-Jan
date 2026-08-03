const fs = require('fs');
let content = fs.readFileSync('src/data/test14ReadingData.ts', 'utf8');

// Replace unescaped double quotes inside the string literals for content array
content = content.replace(/calls "free-traits',/g, "calls 'free-traits',");
content = content.replace(/burnout\?""/g, "burnout?'\"");

fs.writeFileSync('src/data/test14ReadingData.ts', content);
