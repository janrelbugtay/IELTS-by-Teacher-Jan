const fs = require('fs');
let code = fs.readFileSync('src/data/readingTestData.ts', 'utf8');

if (!code.includes("decemberReadingData")) {
    code = code.replace(
        "import { novemberPassages, novemberAnswers, novemberExplanations } from './novemberReadingData';",
        "import { novemberPassages, novemberAnswers, novemberExplanations } from './novemberReadingData';\nimport { decemberPassages, decemberAnswers, decemberExplanations } from './decemberReadingData';"
    );
}

const search = `  // Explicitly defined future tests that don't have content yet
  if (id && ['45'].includes(id)) {
    return {
      passages: [
        {
          id: 1,
          title: "Content Coming Soon",
          subtitle: "Future Update",
          content: [
            "The reading practice test for this month is currently under development and will be available in a future update."
          ],
          questionBlocks: []
        }
      ],
      answers: {},
      explanations: {}
    };
  }`;
const replace = `  if (id === '45') {
    return { passages: decemberPassages, answers: decemberAnswers, explanations: decemberExplanations };
  }`;

if (code.includes(search)) {
    code = code.replace(search, replace);
} else {
    // maybe formatted differently
    code = code.replace(/if \(id && \['45'\]\.includes\(id\)\) \{[\s\S]*?\}\n  \}/g, replace);
}

fs.writeFileSync('src/data/readingTestData.ts', code);
console.log("Patched readingTestData.ts");
