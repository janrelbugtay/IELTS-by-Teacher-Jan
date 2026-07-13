const fs = require('fs');

let res = fs.readFileSync('src/pages/TestResult.tsx', 'utf8');
res = res.replace(
    "import { AprilListeningTest } from './AprilListeningTest';",
    "import { AprilListeningTest } from './AprilListeningTest';\nimport { MayListeningTest } from './MayListeningTest';"
);

res = res.replace(
    "if (submission.assignmentTitle?.toLowerCase().includes('april')) {\n          return <AprilListeningTest submissionId={id} />;\n      }",
    "if (submission.assignmentTitle?.toLowerCase().includes('april')) {\n          return <AprilListeningTest submissionId={id} />;\n      }\n      if (submission.assignmentTitle?.toLowerCase().includes('may')) {\n          return <MayListeningTest submissionId={id} />;\n      }"
);

res = res.replace(
    "if (submission.assignmentTitle?.toLowerCase().includes('april')) {\n          return <AprilListeningTest submissionId={id} />;\n      }",
    "if (submission.assignmentTitle?.toLowerCase().includes('april')) {\n          return <AprilListeningTest submissionId={id} />;\n      }\n      if (submission.assignmentTitle?.toLowerCase().includes('may')) {\n          return <MayListeningTest submissionId={id} />;\n      }"
);

fs.writeFileSync('src/pages/TestResult.tsx', res);
console.log("Updated TestResult.tsx");
