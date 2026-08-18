const fs = require('fs');
let content = fs.readFileSync('src/components/KETCalculator.tsx', 'utf8');

content = content.replace(
  "speaking: s.g + s.d + s.p + s.i + (s.ga * 2)",
  "speaking: (s.g * 2) + (s.p * 2) + (s.i * 2) + (s.ga * 3)"
);

content = content.replace(
  "speaking: (s.g * 2) + (s.p * 2) + (s.i * 2) + (s.ga * 3)",
  "speaking: (s.g * 2) + (s.p * 2) + (s.i * 2) + (s.ga * 3)"
); // Actually it looks like I just missed one replacement

// Let's search for s.d and replace it.
content = content.replace(/\s\+\ss\.d\s/g, " ");

fs.writeFileSync('src/components/KETCalculator.tsx', content);
console.log("Fixed 's.d' reference in speaking calculateScore");
