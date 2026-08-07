const fs = require('fs');
let code = fs.readFileSync('src/pages/PracticeTests.tsx', 'utf8');

const target = `  if (courseName === 'IELTS') {
    let readingIds = [49, 53, 57];
    for (let i = 13; i <= 15; i++) {`;
const replacement = `  if (courseName === 'IELTS') {
    let readingIds = [49, 53, 57, 61, 65, 69];
    for (let i = 13; i <= 18; i++) {`;

code = code.replace(target, replacement);

const targetTitles = `                        53: ['The History of the Chicken', 'A study of introvert and extrovert characters', 'Seeing the colour of sounds'],
                        57: ['Passage 1', 'Passage 2', 'Passage 3']`;
const replacementTitles = `                        53: ['The History of the Chicken', 'A study of introvert and extrovert characters', 'Seeing the colour of sounds'],
                        57: ['Passage 1', 'Passage 2', 'Passage 3'],
                        61: ['Passage 1', 'Passage 2', 'Passage 3'],
                        65: ['Passage 1', 'Passage 2', 'Passage 3'],
                        69: ['Passage 1', 'Passage 2', 'Passage 3']`;

code = code.replace(targetTitles, replacementTitles);

fs.writeFileSync('src/pages/PracticeTests.tsx', code);
console.log("Patched tests");
