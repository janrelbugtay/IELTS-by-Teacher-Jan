const fs = require('fs');
let content = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

// 1. Add testTitle logic
const testIdDecl = '  const testId = assignmentId || id;';
const testTitleLogic = `
  let testTitle = 'IELTS Reading Test 1';
  if (testId) {
    const numericId = Number(testId);
    if (!isNaN(numericId) && numericId >= 1) {
      const monthIndex = Math.floor((numericId - 1) / 4);
      if (monthIndex >= 0) {
        testTitle = \`IELTS Reading Test \${monthIndex + 1}\`;
      }
    } else {
      if (testId === 'IELTS-READING-JAN2026-001') {
        testTitle = 'IELTS Reading Test 12';
      } else {
        testTitle = testId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      }
    }
  }
`;
content = content.replace(testIdDecl, testIdDecl + '\n' + testTitleLogic);

// 2. Change IELTS Academic Reading to testTitle
content = content.replace(
  '<h1 className="text-3xl font-extrabold text-blue-900 mb-2 text-center tracking-tight">IELTS Academic Reading</h1>',
  '<h1 className="text-3xl font-extrabold text-blue-900 mb-2 text-center tracking-tight">{testTitle}</h1>'
);

// 3. Update handleSubmit to use testTitle
const titleBlock = `        let title = 'IELTS Reading Test 1';
        if (currentId) {
          const numericId = Number(currentId);
          if (!isNaN(numericId) && numericId >= 1) {
            const months = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const monthIndex = Math.floor((numericId - 1) / 4);
            if (monthIndex >= 0) {
              title = \`IELTS Reading Test \${monthIndex + 1}\`;
            }
          } else {
            if (currentId === 'IELTS-READING-JAN2026-001') {
              title = 'IELTS Reading Test 12';
            } else {
              title = currentId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
            }
          }
        }`;
content = content.replace(titleBlock, `        let title = testTitle;`);

fs.writeFileSync('src/pages/ComputerReadingTest.tsx', content);
console.log("Patched ComputerReadingTest.tsx");
