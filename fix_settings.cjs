const fs = require('fs');
let content = fs.readFileSync('src/pages/SeptemberListeningTest.tsx', 'utf8');

const startStr = '<div className="flex items-center gap-4 relative z-30" ref={settingsRef}>';
const endStr = ')}          </div>CANDIDATE NAME';
const idxStart = content.indexOf(startStr);
const idxEnd = content.indexOf(endStr);

if (idxStart !== -1 && idxEnd !== -1) {
  // block includes up to CANDIDATE NAME
  const block = content.substring(idxStart, idxEnd + 18);
  content = content.replace(block, 'CANDIDATE NAME'); // remove it and leave CANDIDATE NAME
  
  const blockWithoutCandidate = content.substring(idxStart, idxEnd + 18).replace('CANDIDATE NAME', '');
  
  // Actually, let's just grab the block up to `</div>`
  const blockOnly = content.substring(idxStart, idxEnd + 18).replace('CANDIDATE NAME', '');
  
  const rightDivStart = '<div className="flex items-center gap-2">';
  // Let's find the second or last rightDivStart
  const rightDivIdx = content.lastIndexOf(rightDivStart);
  if (rightDivIdx !== -1) {
    const p1 = content.substring(0, rightDivIdx + rightDivStart.length);
    const p2 = content.substring(rightDivIdx + rightDivStart.length);
    content = p1 + '\n          ' + blockOnly + '\n' + p2;
    fs.writeFileSync('src/pages/SeptemberListeningTest.tsx', content);
    console.log('moved settings block');
  } else {
    console.log('could not find rightDivStart');
  }
} else {
  console.log('could not find settings block idxStart or idxEnd');
}
