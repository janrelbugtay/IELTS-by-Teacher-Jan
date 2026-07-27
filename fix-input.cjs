const fs = require('fs');

const fixFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // We want to make sure the placeholder is q.id
  content = content.replace(
    /placeholder=\{reviewMode \? \(answers\[q\.id\] \|\| "No Answer"\) : ""\}/g,
    'placeholder={reviewMode ? (answers[q.id] || "No Answer") : q.id.toString()}'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
};

fixFile('src/pages/ComputerReadingTest.tsx');
fixFile('src/pages/ComputerListeningTest.tsx');
