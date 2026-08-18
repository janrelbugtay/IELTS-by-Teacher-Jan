const fs = require('fs');
let content = fs.readFileSync('src/components/KETCalculator.tsx', 'utf8');
content = content.replace(
  '<Select label="Discourse (0-5)" value={scores.speaking.d} max={5} onChange={(v) => handleScoreChange(\'speaking\', \'d\', v)} theme={activeTheme} />',
  ''
);
content = content.replace(
  '<div className="grid grid-cols-2 md:grid-cols-3 gap-6">\\n        <Select label="Grammar & Vocab (0-5)" value={scores.speaking.g}',
  '<div className="grid grid-cols-2 md:grid-cols-4 gap-6">\\n        <Select label="Grammar & Vocab (0-5)" value={scores.speaking.g}'
);
fs.writeFileSync('src/components/KETCalculator.tsx', content);
console.log('done');
