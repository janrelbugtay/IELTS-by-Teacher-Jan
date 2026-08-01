const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/pages/*ReadingTest.tsx');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/title = `\${months\[monthIndex\]} Reading Practice`;/g, 'title = `IELTS Reading Test ${monthIndex + 1}`;');
  content = content.replace(/let title = 'January Reading Practice';/g, "let title = 'IELTS Reading Test 1';");
  content = content.replace(/let title = 'February Reading Practice';/g, "let title = 'IELTS Reading Test 2';");
  content = content.replace(/let title = 'March Reading Practice';/g, "let title = 'IELTS Reading Test 3';");
  content = content.replace(/let title = 'April Reading Practice';/g, "let title = 'IELTS Reading Test 4';");
  content = content.replace(/let title = 'May Reading Practice';/g, "let title = 'IELTS Reading Test 5';");
  content = content.replace(/let title = 'June Reading Practice';/g, "let title = 'IELTS Reading Test 6';");
  content = content.replace(/let title = 'July Reading Practice';/g, "let title = 'IELTS Reading Test 7';");
  content = content.replace(/let title = 'August Reading Practice';/g, "let title = 'IELTS Reading Test 8';");
  content = content.replace(/let title = 'September Reading Practice';/g, "let title = 'IELTS Reading Test 9';");
  content = content.replace(/let title = 'October Reading Practice';/g, "let title = 'IELTS Reading Test 10';");
  content = content.replace(/let title = 'November Reading Practice';/g, "let title = 'IELTS Reading Test 11';");
  content = content.replace(/let title = 'December Reading Practice';/g, "let title = 'IELTS Reading Test 12';");
  content = content.replace(/title = 'December Reading Practice';/g, "title = 'IELTS Reading Test 12';");
  
  fs.writeFileSync(file, content);
});
