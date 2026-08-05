const fs = require('fs');

let content = fs.readFileSync('src/data/test15ReadingData.ts', 'utf8');

content = content.replace('"33": "Jupiter, Saturn",', '"33": "Jupiter, Saturn/Jupiter and Saturn",');
content = content.replace('"35": "Sensors, circuits",', '"35": "Sensors, circuits/Sensors and circuits",');

fs.writeFileSync('src/data/test15ReadingData.ts', content);
console.log('Fixed answers');
