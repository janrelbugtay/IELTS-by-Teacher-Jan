const fs = require('fs');
let content = fs.readFileSync('src/pages/PracticeTests.tsx', 'utf-8');

// Replace the invalid JSX block
const target = `const readingTitles = {
  1: ['What Lucy Taught Us', 'The history of tea', 'Knowledge in medicine'],
  5: ['Why good ideas fail', 'The return of monkey life', 'The value of research into mite harvestmen'],
  9: ['The development of the silk industry', 'The culture of Chimpanzees', 'History of telegraph in communication'],
  13: ['Thomas Young The Last True Know-it-all', 'The Dugong: Sea Cow', 'Can Scientists Tell Us: What happiness is?'],
  17: ['A Wonder Plant-Bamboo', 'Finding Our Way', 'Designed to Last'],
  21: ['The Impact of the Potato', 'Public Libraries', 'Blind to Change'],
  25: ['The Davies Sisters', 'Why we need silence', 'Book review: The World of Sugar by Ulbe Bosma'],
  29: ['Do animals dream?', 'Mapungubwe', 'Artificial Intelligence'],
  33: ['Seaweeds of New Zealand', 'The art of deception', 'Mapping the Mind'],
  37: ['Passage 1', 'Passage 2', 'Passage 3'],
  41: ['Passage 1', 'Passage 2', 'Passage 3'],
  45: ['READING PASSAGE 1', 'READING PASSAGE 2', "A review of Peter Bellerby's book"],
  49: ['Satellite Technology', 'A Brief History of Humans and Food', 'Jellyfish: A Remarkable Marine Life Form'],
  53: ['The History of the Chicken', 'A study of introvert and extrovert characters', 'Seeing the colour of sounds'],
  57: ['Passage 1', 'Passage 2', 'Passage 3']
};
                    {(() => {
                      const titles = readingTitles[test.id] || ['Passage 1', 'Passage 2', 'Passage 3'];`;

const fixed = `{(() => {
                      const readingTitles = {
                        1: ['What Lucy Taught Us', 'The history of tea', 'Knowledge in medicine'],
                        5: ['Why good ideas fail', 'The return of monkey life', 'The value of research into mite harvestmen'],
                        9: ['The development of the silk industry', 'The culture of Chimpanzees', 'History of telegraph in communication'],
                        13: ['Thomas Young The Last True Know-it-all', 'The Dugong: Sea Cow', 'Can Scientists Tell Us: What happiness is?'],
                        17: ['A Wonder Plant-Bamboo', 'Finding Our Way', 'Designed to Last'],
                        21: ['The Impact of the Potato', 'Public Libraries', 'Blind to Change'],
                        25: ['The Davies Sisters', 'Why we need silence', 'Book review: The World of Sugar by Ulbe Bosma'],
                        29: ['Do animals dream?', 'Mapungubwe', 'Artificial Intelligence'],
                        33: ['Seaweeds of New Zealand', 'The art of deception', 'Mapping the Mind'],
                        37: ['Passage 1', 'Passage 2', 'Passage 3'],
                        41: ['Passage 1', 'Passage 2', 'Passage 3'],
                        45: ['READING PASSAGE 1', 'READING PASSAGE 2', "A review of Peter Bellerby's book"],
                        49: ['Satellite Technology', 'A Brief History of Humans and Food', 'Jellyfish: A Remarkable Marine Life Form'],
                        53: ['The History of the Chicken', 'A study of introvert and extrovert characters', 'Seeing the colour of sounds'],
                        57: ['Passage 1', 'Passage 2', 'Passage 3']
                      };
                      const titles = readingTitles[test.id] || ['Passage 1', 'Passage 2', 'Passage 3'];`;

content = content.replace(target, fixed);
fs.writeFileSync('src/pages/PracticeTests.tsx', content);
console.log("Patched syntax error");
