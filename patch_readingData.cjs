const fs = require('fs');

let code16 = fs.readFileSync('src/data/test16ReadingData.ts', 'utf8');
code16 += `
export const test16Answers = {};
export const test16Explanations = {};
`;
fs.writeFileSync('src/data/test16ReadingData.ts', code16);

let code17 = fs.readFileSync('src/data/test17ReadingData.ts', 'utf8');
code17 += `
export const test17Answers = {};
export const test17Explanations = {};
`;
fs.writeFileSync('src/data/test17ReadingData.ts', code17);

let code18 = fs.readFileSync('src/data/test18ReadingData.ts', 'utf8');
code18 += `
export const test18Answers = {};
export const test18Explanations = {};
`;
fs.writeFileSync('src/data/test18ReadingData.ts', code18);

let indexCode = fs.readFileSync('src/data/readingTestData.ts', 'utf8');

const importTarget = `import { test15Passages, test15Answers, test15Explanations } from './test15ReadingData';`;
const importReplacement = `import { test15Passages, test15Answers, test15Explanations } from './test15ReadingData';
import { test16Passages, test16Answers, test16Explanations } from './test16ReadingData';
import { test17Passages, test17Answers, test17Explanations } from './test17ReadingData';
import { test18Passages, test18Answers, test18Explanations } from './test18ReadingData';`;

indexCode = indexCode.replace(importTarget, importReplacement);

const exportTarget = `  if (id === '57') {
    return { passages: test15Passages, answers: test15Answers, explanations: test15Explanations };
  }`;
const exportReplacement = `  if (id === '57') {
    return { passages: test15Passages, answers: test15Answers, explanations: test15Explanations };
  }
  if (id === '61') {
    return { passages: test16Passages, answers: test16Answers, explanations: test16Explanations };
  }
  if (id === '65') {
    return { passages: test17Passages, answers: test17Answers, explanations: test17Explanations };
  }
  if (id === '69') {
    return { passages: test18Passages, answers: test18Answers, explanations: test18Explanations };
  }`;
  
indexCode = indexCode.replace(exportTarget, exportReplacement);

fs.writeFileSync('src/data/readingTestData.ts', indexCode);

let testsCode = fs.readFileSync('src/pages/PracticeTests.tsx', 'utf8');

const titleTarget = `                        61: ['Passage 1', 'Passage 2', 'Passage 3'],`;
const titleReplacement = `                        61: ['William Gilbert and Magnetism', 'Tasmanian Tiger', 'Endangered Languages'],`;

testsCode = testsCode.replace(titleTarget, titleReplacement);

fs.writeFileSync('src/pages/PracticeTests.tsx', testsCode);

console.log("Patched readingTestData and practice tests");

