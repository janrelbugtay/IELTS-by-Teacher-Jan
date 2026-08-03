const fs = require('fs');

let content = fs.readFileSync('src/data/test14ReadingData.ts', 'utf8');
content = content.replace(
  /id: 22,\s*text: ""/g,
  `id: 22, 
            text: "A. They can affect the degree to which people are content with what they have.\\nB. They are not used by people all the time.\\nC. They influence people's choice of profession.\\nD. They are useful in the pursuit of objectives assigned by others.\\nE. They enable people to act in ways which are not typical for them."`
);
fs.writeFileSync('src/data/test14ReadingData.ts', content);
