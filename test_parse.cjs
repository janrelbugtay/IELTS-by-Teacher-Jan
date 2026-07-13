const fs = require('fs');
let code = fs.readFileSync('src/pages/MayListeningTest.tsx', 'utf8');
console.log(code.substring(code.indexOf('w-full max-w-[1000px] min-h-full') + 40, code.indexOf('w-full max-w-[1000px] min-h-full') + 500));
