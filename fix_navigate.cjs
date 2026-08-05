const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

if (!code.includes("import { useNavigate }")) {
  code = code.replace("import React,", "import { useNavigate } from 'react-router';\nimport React,");
}

code = code.replace(`const testNum = testId ? testId : '1';`, `const navigate = useNavigate();\n  const testNum = testId ? testId : '1';`);

code = code.replace(`window.location.href = '/ielts/dashboard?tab=speaking';`, `navigate('/ielts/dashboard?tab=speaking');`);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
console.log("Patched navigate");
