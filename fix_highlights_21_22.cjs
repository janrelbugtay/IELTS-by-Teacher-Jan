const fs = require('fs');

let content = fs.readFileSync('src/data/test14ReadingData.ts', 'utf8');

const jsExplanations = content.match(/export const test14Explanations: Record<number, any> = (\{[\s\S]*?\});/);
if (jsExplanations) {
  const ex = JSON.parse(jsExplanations[1]);
  ex['21'].highlights = [
    "According to Little, we adopt these free-traits only when we need them...",
    "...adoption of what he calls 'free-traits', which allow us to behave in a manner which contrasts with our natural selves."
  ];
  ex['22'].highlights = [
    "According to Little, we adopt these free-traits only when we need them...",
    "...adoption of what he calls 'free-traits', which allow us to behave in a manner which contrasts with our natural selves."
  ];
  
  content = content.replace(jsExplanations[1], JSON.stringify(ex, null, 2));
  fs.writeFileSync('src/data/test14ReadingData.ts', content);
  console.log("Fixed highlights for 21 and 22");
}
