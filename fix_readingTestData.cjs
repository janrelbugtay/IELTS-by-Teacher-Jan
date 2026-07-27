const fs = require('fs');

let data = fs.readFileSync('src/data/readingTestData.ts', 'utf8');

data = "import { novemberPassages, novemberAnswers, novemberExplanations } from './novemberReadingData';\n" + data;

data = data.replace(
    /if \(id === '37'\) \{\n    return \{ passages: octoberPassages, answers: octoberAnswers, explanations: octoberExplanations \};\n  \}/g,
    "if (id === '37') {\n    return { passages: octoberPassages, answers: octoberAnswers, explanations: octoberExplanations };\n  }\n\n  if (id === '41') {\n    return { passages: novemberPassages, answers: novemberAnswers, explanations: novemberExplanations };\n  }"
);

data = data.replace(
    /\['41'\]\.includes\(id\)/g,
    "['45'].includes(id)"
);

fs.writeFileSync('src/data/readingTestData.ts', data);
console.log('Fixed readingTestData');
