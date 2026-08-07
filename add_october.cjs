const fs = require('fs');

let content = fs.readFileSync('src/pages/ComputerWritingTest.tsx', 'utf8');

// Add import
content = content.replace(/import { SeptemberWritingTest } from '\.\/SeptemberWritingTest';/, "import { SeptemberWritingTest } from './SeptemberWritingTest';\nimport { OctoberWritingTest } from './OctoberWritingTest';");

// Add route logic
content = content.replace(/if \(id === '35' && !submissionId\) \{\n        return <SeptemberWritingTest \/>;\n    \}/, "if (id === '35' && !submissionId) {\n        return <SeptemberWritingTest />;\n    }\n    if (id === '39' && !submissionId) {\n        return <OctoberWritingTest />;\n    }");

fs.writeFileSync('src/pages/ComputerWritingTest.tsx', content);
console.log('Added October to ComputerWritingTest');
