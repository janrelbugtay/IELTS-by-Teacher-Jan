const fs = require('fs');

let code = fs.readFileSync('src/data/decemberReadingData.ts', 'utf8');

const updates = [
  { q: '"4"', h: '["blocking fishing routes and providing a new habitat for disease-carrying mosquitoes"]' },
  { q: '"5"', h: '["About three out of four families in Kenya depend on wood or charcoal to cook their daily meals"]' },
  { q: '"21"', h: '["low educational achievement can lead to many of these students dropping out of school – a problem disproportionately affecting female students."]' },
  { q: '"34"', h: '["He likened the world to a leather ball stitched together from twelve pieces, with the differing colours of the leather representing the different climates and zones of the earth."]' },
  { q: '"35"', h: '["it was another 400 years before the first recorded globe was made by Crates of Mallus."]' }
];

updates.forEach(u => {
  const regex = new RegExp(`("${u.q.replace(/"/g, '')}":\\s*\\{\\s*passageId:\\s*\\d+,\\s*highlights:\\s*)\\[\\]`, 'g');
  code = code.replace(regex, `$1${u.h}`);
});

fs.writeFileSync('src/data/decemberReadingData.ts', code);
