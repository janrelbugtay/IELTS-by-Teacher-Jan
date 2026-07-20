const fs = require('fs');
let code = fs.readFileSync('src/pages/AugustReadingTest.tsx', 'utf8');

code = code.replace(/const passagesData = \[[\s\S]*?\];\n\nexport const ANSWER_KEY: Record<number, string> = \{[\s\S]*?\};\n/, `const passagesData: any[] = [];\n\nexport const ANSWER_KEY: Record<number, string> = {};\n`);

code = code.replace(/MayReadingTest/g, 'AugustReadingTest');

fs.writeFileSync('src/pages/AugustReadingTest.tsx', code);
