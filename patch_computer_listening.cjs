const fs = require('fs');
let content = fs.readFileSync('src/pages/ComputerListeningTest.tsx', 'utf8');

if (!content.includes('OctoberListeningTest')) {
    content = content.replace(
        "import { SeptemberListeningTest } from './SeptemberListeningTest';",
        "import { SeptemberListeningTest } from './SeptemberListeningTest';\nimport { OctoberListeningTest } from './OctoberListeningTest';"
    );
    
    content = content.replace(
        "if (id === '34' && !submissionId) return <SeptemberListeningTest />;",
        "if (id === '34' && !submissionId) return <SeptemberListeningTest />;\n  if (id === '38' && !submissionId) return <OctoberListeningTest />;"
    );
    
    fs.writeFileSync('src/pages/ComputerListeningTest.tsx', content);
    console.log("Added OctoberListeningTest to ComputerListeningTest.tsx");
} else {
    console.log("Already added");
}
