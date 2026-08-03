const fs = require('fs');

let content = fs.readFileSync('src/data/test14ReadingData.ts', 'utf8');
const jsExplanations = content.match(/export const test14Explanations: Record<number, any> = (\{[\s\S]*?\});/);

if (jsExplanations) {
  const ex = JSON.parse(jsExplanations[1]);

  for (const key in ex) {
    if (ex[key].explanation) {
      // Regex to remove **Highlighted Text:** "..."\n\n or \n
      // Need to handle cases where there is no Synonym part as well
      ex[key].explanation = ex[key].explanation.replace(/\*\*Highlighted Text(?:\s*\(for Option [A-Z]\))?:\*\*\s*"[\s\S]*?"(?:\\n\\n|\\n)?/g, '').trim();
    }
  }

  content = content.replace(jsExplanations[1], JSON.stringify(ex, null, 2));
  fs.writeFileSync('src/data/test14ReadingData.ts', content);
  console.log("Removed highlighted text from explanations");
}
