const fs = require('fs');

let comp = fs.readFileSync('src/pages/ComputerListeningTest.tsx', 'utf8');

comp = comp.replace(
    "import { AprilListeningTest } from './AprilListeningTest';",
    "import { AprilListeningTest } from './AprilListeningTest';\nimport { MayListeningTest } from './MayListeningTest';"
);

comp = comp.replace(
    "if (id === '14' && !submissionId) return <AprilListeningTest />;",
    "if (id === '14' && !submissionId) return <AprilListeningTest />;\n  if (id === '18' && !submissionId) return <MayListeningTest />;"
);

fs.writeFileSync('src/pages/ComputerListeningTest.tsx', comp);
console.log("Updated ComputerListeningTest.tsx");

let res = fs.readFileSync('src/pages/TestResult.tsx', 'utf8');
res = res.replace(
    "import { AprilListeningTest } from './AprilListeningTest';",
    "import { AprilListeningTest } from './AprilListeningTest';\nimport { MayListeningTest } from './MayListeningTest';"
);

// We need to see if TestResult routes them too
