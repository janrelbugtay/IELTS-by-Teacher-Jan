const fs = require('fs');
let content = fs.readFileSync('src/components/KETCalculator.tsx', 'utf8');

// The input sliders map over Object.keys(SPEAKING_FEEDBACK) which will now just be g, p, i, ga. So that's perfect.
// Let's verify how speaking totals are calculated.
content = content.replace(
  "speaking: s.g + s.d + s.p + s.i + (s.ga * 2)",
  "speaking: (s.g * 2) + (s.p * 2) + (s.i * 2) + (s.ga * 3)"
);

fs.writeFileSync('src/components/KETCalculator.tsx', content);
console.log("Patched speaking calculation");
