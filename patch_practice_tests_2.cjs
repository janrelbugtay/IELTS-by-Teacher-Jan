const fs = require('fs');
let content = fs.readFileSync('src/pages/PracticeTests.tsx', 'utf-8');

const replacement = `const readingTitles = {
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
                      const titles = readingTitles[test.id] || ['Passage 1', 'Passage 2', 'Passage 3'];
                      return (
                        <>
                          <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 1:</span> {titles[0]}</span></div>
                          <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 2:</span> {titles[1]}</span></div>
                          <div className="flex items-start gap-2"><Book className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" /> <span className="line-clamp-1"><span className="font-semibold">Passage 3:</span> {titles[2]}</span></div>
                        </>
                      );
                    })()}`;

const lines = content.split('\n');
const startIdx = lines.findIndex(l => l.includes('{test.id === 1 ? ('));
let endIdx = startIdx;
while (endIdx < lines.length && !lines[endIdx].includes(')}')) {
  endIdx++;
}

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx + 1, replacement);
  fs.writeFileSync('src/pages/PracticeTests.tsx', lines.join('\n'));
  console.log("Patched PracticeTests.tsx successfully.");
} else {
  console.log("Failed to find boundaries in PracticeTests.tsx.");
}
