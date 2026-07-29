const fs = require('fs');
let code = fs.readFileSync('src/data/decemberReadingData.ts', 'utf8');

code = code.replace(/14 _______/g, '{14}');
code = code.replace(/15 _______/g, '{15}');
code = code.replace(/16 _______/g, '{16}');
code = code.replace(/17 _______/g, '{17}');
code = code.replace(/18 _______/g, '{18}');
code = code.replace(/19 _______/g, '{19}');

fs.writeFileSync('src/data/decemberReadingData.ts', code);
