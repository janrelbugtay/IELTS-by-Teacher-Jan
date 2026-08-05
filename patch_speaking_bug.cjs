const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

code = code.replace(/assignmentId: testNum,/g, "assignmentId: id || '1',");

// For the title, wait let's just use the helper or just hardcode IELTS Speaking Test testNum, wait, it's fine to leave assignmentTitle as it was because getFallbackTitle is going to override it anyway when displaying in Dashboard, OR I can just make it correct.
// Actually Dashboard uses assignmentTitle if available, so let's fix it.
// testNum is 1, 2, 3 etc so \`IELTS Speaking Test \${testNum}\` is correct for the title!
// Wait! Yes! "IELTS Speaking Test 2" is correct! testNum is 2. The assignmentId is 8.
// So the only bug was assignmentId: testNum instead of id || '1'.

fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code);
console.log("Patched ComputerSpeakingTest.tsx assignmentId");
