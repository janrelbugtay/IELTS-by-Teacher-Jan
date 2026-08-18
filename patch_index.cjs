const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace(/<title>.*?<\/title>/, '<title>Kỳ Nguyên Era</title>');
content = content.replace(/<link rel="icon".*?\/>/, '<link rel="icon" type="image/svg+xml" href="/eralogo.svg" />');
fs.writeFileSync('index.html', content);
console.log('patched index.html');
