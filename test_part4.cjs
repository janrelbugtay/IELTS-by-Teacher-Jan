const fs = require('fs');
let code = fs.readFileSync('src/pages/MayListeningTest.tsx', 'utf8');
const p4 = code.indexOf('{/* Part 4 */}');
console.log(code.substring(p4, code.indexOf('bg-[#e1e5eb] border-t border-gray-300', p4)));
