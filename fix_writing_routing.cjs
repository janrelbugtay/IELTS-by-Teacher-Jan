const fs = require('fs');

let cw = fs.readFileSync('src/pages/ComputerWritingTest.tsx', 'utf8');

cw = cw.replace(
    "import { MarchWritingTest } from './MarchWritingTest';",
    "import { MarchWritingTest } from './MarchWritingTest';\nimport { AprilWritingTest } from './AprilWritingTest';"
);

cw = cw.replace(
    "if (id === '11') {\n        return <MarchWritingTest />;\n    }",
    "if (id === '11') {\n        return <MarchWritingTest />;\n    }\n    if (id === '14') {\n        return <AprilWritingTest />;\n    }"
);

fs.writeFileSync('src/pages/ComputerWritingTest.tsx', cw);
console.log("Updated ComputerWritingTest.tsx");

let tr = fs.readFileSync('src/pages/TestResult.tsx', 'utf8');

tr = tr.replace(
    "import { MarchWritingTest } from './MarchWritingTest';",
    "import { MarchWritingTest } from './MarchWritingTest';\nimport { AprilWritingTest } from './AprilWritingTest';"
);

const writingBlock = `if (submission.assignmentTitle?.toLowerCase().includes('march')) {
          return <MarchWritingTest submissionId={id} />;
      }`;

tr = tr.replace(
    writingBlock,
    `if (submission.assignmentTitle?.toLowerCase().includes('march')) {
          return <MarchWritingTest submissionId={id} />;
      }
      if (submission.assignmentTitle?.toLowerCase().includes('april')) {
          return <AprilWritingTest submissionId={id} />;
      }`
);

fs.writeFileSync('src/pages/TestResult.tsx', tr);
console.log("Updated TestResult.tsx");
