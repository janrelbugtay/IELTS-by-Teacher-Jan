const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/require\("fs"\)\.appendFileSync\("server\.log", "\\n" \+ /g, 'console.log(');
content = content.replace(/require\("fs"\)\.appendFileSync\("server\.log", "\\nERROR: " \+ /g, 'console.error(');
content = content.replace(/require\("fs"\)\.appendFileSync\("server\.log", "\\nWARN: " \+ /g, 'console.warn(');

fs.writeFileSync('server.ts', content);
console.log('Undid patch');
