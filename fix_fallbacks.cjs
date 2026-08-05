const fs = require('fs');

function fixCode(code) {
  code = code.replace(/numId % 4 === 1\) return 'reading';/g, "numId % 4 === 1) return 'listening';");
  code = code.replace(/numId % 4 === 2\) return 'listening';/g, "numId % 4 === 2) return 'reading';");
  
  code = code.replace(/numId % 4 === 1\) skill = 'Reading';/g, "numId % 4 === 1) skill = 'Listening';");
  code = code.replace(/numId % 4 === 2\) skill = 'Listening';/g, "numId % 4 === 2) skill = 'Reading';");
  return code;
}

['src/pages/ielts/Dashboard.tsx', 'src/components/PerformanceTable.tsx', 'src/pages/TestResult.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    fs.writeFileSync(file, fixCode(code));
    console.log("Patched", file);
  }
});
