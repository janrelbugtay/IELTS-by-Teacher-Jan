const fs = require('fs');
let content = fs.readFileSync('src/pages/TestResult.tsx', 'utf8');

// Add imports
if (!content.includes("OctoberListeningTest")) {
    content = content.replace("import { SeptemberListeningTest } from './SeptemberListeningTest';", "import { SeptemberListeningTest } from './SeptemberListeningTest';\nimport { OctoberListeningTest } from './OctoberListeningTest';");
}
if (!content.includes("OctoberWritingTest")) {
    content = content.replace("import { SeptemberWritingTest } from './SeptemberWritingTest';", "import { SeptemberWritingTest } from './SeptemberWritingTest';\nimport { OctoberWritingTest } from './OctoberWritingTest';");
}

// Add conditions for Listening
content = content.replace("if (aId === '34') return <SeptemberListeningTest submissionId={id} />;", "if (aId === '34') return <SeptemberListeningTest submissionId={id} />;\n      if (aId === '38') return <OctoberListeningTest submissionId={id} />;\n");
content = content.replace("if (submission.assignmentTitle?.toLowerCase().includes('september')) return <SeptemberListeningTest submissionId={id} />;", "if (submission.assignmentTitle?.toLowerCase().includes('september')) return <SeptemberListeningTest submissionId={id} />;\n      if (submission.assignmentTitle?.toLowerCase().includes('october')) return <OctoberListeningTest submissionId={id} />;\n");

// Add conditions for Writing
content = content.replace("if (aId === '35') return <SeptemberWritingTest submissionId={id} />;", "if (aId === '35') return <SeptemberWritingTest submissionId={id} />;\n      if (aId === '39') return <OctoberWritingTest submissionId={id} />;\n");
content = content.replace("if (submission.assignmentTitle?.toLowerCase().includes('september')) return <SeptemberWritingTest submissionId={id} />;", "if (submission.assignmentTitle?.toLowerCase().includes('september')) return <SeptemberWritingTest submissionId={id} />;\n      if (submission.assignmentTitle?.toLowerCase().includes('october')) return <OctoberWritingTest submissionId={id} />;\n");

fs.writeFileSync('src/pages/TestResult.tsx', content);
console.log("Patched TestResult.tsx");
