const fs = require('fs');
let content = fs.readFileSync('src/components/KETCalculator.tsx', 'utf8');

// The lint error said: src/components/KETCalculator.tsx(428,64): error TS2339: Property 'd' does not exist on type '{ g: number; p: number; i: number; ga: number; }'.
content = content.replace(
  "speaking: s.g + s.d + s.p + s.i + (s.ga * 2)",
  "speaking: (s.g * 2) + (s.p * 2) + (s.i * 2) + (s.ga * 3)"
);

content = content.replace(/s\.d/g, "0"); // catch all

fs.writeFileSync('src/components/KETCalculator.tsx', content);
console.log("Fixed 's.d' properly");
