const fs = require('fs');
const path = require('path');

let filePaths = [
    path.join(__dirname, 'src/pages/ComputerListeningTest.tsx'),
    path.join(__dirname, 'src/App.tsx'),
    path.join(__dirname, 'src/pages/CourseDetails.tsx')
];

// Update ComputerListeningTest.tsx
let listeningCode = fs.readFileSync(filePaths[0], 'utf8');
listeningCode = listeningCode.replace(
    "import { FebruaryListeningTest } from './FebruaryListeningTest';",
    "import { FebruaryListeningTest } from './FebruaryListeningTest';\nimport { JanuaryListeningTest } from './JanuaryListeningTest';"
);
listeningCode = listeningCode.replace(
    "if (id === '14' && !submissionId) return <AprilListeningTest />;",
    "if (id === '14' && !submissionId) return <AprilListeningTest />;\n  if (id === '15' && !submissionId) return <JanuaryListeningTest />;"
);
fs.writeFileSync(filePaths[0], listeningCode);

// Update CourseDetails.tsx
let courseDetailsCode = fs.readFileSync(filePaths[2], 'utf8');
courseDetailsCode = courseDetailsCode.replace(
    "if (id === 'ielts') {\n      homeworkFolders.push({",
    "if (id === 'ielts') {\n      homeworkFolders.push({\n        title: 'January Listening Practice',\n        icon: <Headphones className=\"w-8 h-8 text-indigo-600\" />,\n        desc: 'Take the January CD-IELTS listening test.',\n        color: 'bg-indigo-50 border-indigo-600/20 hover:border-indigo-600',\n        link: '/test/listening/15'\n      });\n      homeworkFolders.push({"
);
fs.writeFileSync(filePaths[2], courseDetailsCode);

