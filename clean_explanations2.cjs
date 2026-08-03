const fs = require('fs');

let content = fs.readFileSync('src/data/test14ReadingData.ts', 'utf8');
const jsExplanations = content.match(/export const test14Explanations: Record<number, any> = (\{[\s\S]*?\});/);

if (jsExplanations) {
  const ex = JSON.parse(jsExplanations[1]);

  for (const key in ex) {
    if (ex[key].explanation) {
      ex[key].explanation = ex[key].explanation.replace(/\\n/g, '\n').replace(/\n\n$/, '').trim();
    }
  }

  content = content.replace(jsExplanations[1], JSON.stringify(ex, null, 2));
  fs.writeFileSync('src/data/test14ReadingData.ts', content);
  console.log("Cleaned explanations again");
}
