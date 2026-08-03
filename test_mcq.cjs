const fs = require('fs');

let content = fs.readFileSync('src/data/test14ReadingData.ts', 'utf8');
content = content.replace(
  /type: "checkbox",\s*options: \[\s*"A.*?,\s*"B.*?,\s*"C.*?,\s*"D.*?,\s*"E.*?"\s*\],\s*questions: \[\s*\{\s*id: 21,\s*text: "First correct answer"\s*\},\s*\{\s*id: 22,\s*text: "Second correct answer"\s*\}\s*\]/,
  `type: "mcq",
        options: ["A", "B", "C", "D", "E"],
        questions: [
          { 
            id: 21, 
            text: "A. They can affect the degree to which people are content with what they have.\\nB. They are not used by people all the time.\\nC. They influence people's choice of profession.\\nD. They are useful in the pursuit of objectives assigned by others.\\nE. They enable people to act in ways which are not typical for them."
          },
          { 
            id: 22, 
            text: "" 
          }
        ]`
);
fs.writeFileSync('src/data/test14ReadingData.ts', content);
