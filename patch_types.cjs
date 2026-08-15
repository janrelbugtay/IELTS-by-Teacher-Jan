const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

// Add speakingParts to Assignment
content = content.replace(
  "  type: AssignmentType;",
  "  type: AssignmentType;\n  speakingParts?: { part1: boolean; part2: boolean; part3: boolean };"
);

fs.writeFileSync('src/types.ts', content);
