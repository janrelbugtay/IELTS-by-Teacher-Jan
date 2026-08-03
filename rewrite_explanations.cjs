const fs = require('fs');

let content = fs.readFileSync('src/data/test14ReadingData.ts', 'utf8');

const jsExplanations = content.match(/export const test14Explanations: Record<number, string> = (\{[\s\S]*?\});/);

if (jsExplanations) {
  const oldExplanations = JSON.parse(jsExplanations[1]);
  const newExplanations = {};

  for (const [key, value] of Object.entries(oldExplanations)) {
    const qId = parseInt(key);
    let passageId = 1;
    if (qId >= 14 && qId <= 26) {
      passageId = 2;
    } else if (qId >= 27) {
      passageId = 3;
    }

    // Extract highlight
    const highlightMatch = value.match(/\*\*Highlighted Text(?:\s*\(for Option [A-Z]\))?:\*\* "(.*?)"/);
    const highlights = highlightMatch ? [highlightMatch[1]] : [];

    // Also extract synonyms
    const synonymMatch = value.match(/\*\*Synonyms(?:\s*\(for Option [A-Z]\))?:\*\*\n([\s\S]*)/);
    let synonymsText = '';
    if (synonymMatch) {
       synonymsText = synonymMatch[0];
    }
    
    // We can just keep the whole string as explanation
    newExplanations[key] = {
      passageId,
      highlights,
      explanation: value
    };
  }
  
  // Need to update the type definition of test14Explanations as well
  content = content.replace(/export const test14Explanations: Record<number, string> = \{[\s\S]*?\};/, `export const test14Explanations: Record<number, any> = ${JSON.stringify(newExplanations, null, 2)};`);
  
  fs.writeFileSync('src/data/test14ReadingData.ts', content);
  console.log("Rewritten test14Explanations");
} else {
  console.log("Could not find test14Explanations");
}
