const fs = require('fs');

let content = fs.readFileSync('src/data/test14ReadingData.ts', 'utf8');

const jsExplanations = content.match(/export const test14Explanations: Record<number, any> = (\{[\s\S]*?\});/);

if (jsExplanations) {
  const ex = JSON.parse(jsExplanations[1]);

  for (const key in ex) {
    if (ex[key].explanation) {
      // Remove everything starting from "**Highlighted Text" or "**Highlighted Text (for Option B)"
      let newExp = ex[key].explanation.split(/\*\*Highlighted Text/)[0].trim();
      
      // If there are Synonyms left over (maybe without Highlighted text?), let's clean it up too
      newExp = newExp.split(/\*\*Synonyms/)[0].trim();

      // For 21 and 22, let's just make it the main paragraph
      if (key === "21" || key === "22") {
         newExp = 'In the first paragraph (Paragraph A), Professor Brian Little explains that "free-traits" are behaviors we selectively choose to use (meaning they aren\'t used constantly) to go against our biological, natural inclinations.';
      }

      ex[key].explanation = newExp;
    }
  }

  content = content.replace(jsExplanations[1], JSON.stringify(ex, null, 2));
  fs.writeFileSync('src/data/test14ReadingData.ts', content);
  console.log("Cleaned explanations");
}
