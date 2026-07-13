const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/TestResult.tsx');
let content = fs.readFileSync(file, 'utf8');

// Add import
content = content.replace(
    "import { FebruaryListeningTest } from './FebruaryListeningTest';",
    "import { FebruaryListeningTest } from './FebruaryListeningTest';\nimport { JanuaryListeningTest } from './JanuaryListeningTest';"
);

// Add to logic
content = content.replace(
    "if (submission.assignmentTitle?.toLowerCase().includes('february')) {",
    "if (submission.assignmentTitle?.toLowerCase().includes('january')) {\n          return <JanuaryListeningTest submissionId={id} />;\n      }\n      if (submission.assignmentTitle?.toLowerCase().includes('february')) {"
);

fs.writeFileSync(file, content);
