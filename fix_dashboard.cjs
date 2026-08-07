const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

code = code.replace("if (numId % 4 === 1) return 'listening';", "if (numId % 4 === 1) return 'reading';");
code = code.replace("if (numId % 4 === 2) return 'reading';", "if (numId % 4 === 2) return 'listening';");

code = code.replace("if (numId % 4 === 1) skill = 'Listening';", "if (numId % 4 === 1) skill = 'Reading';");
code = code.replace("if (numId % 4 === 2) skill = 'Reading';", "if (numId % 4 === 2) skill = 'Listening';");

fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
