const fs = require('fs');
let content = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

content = content.replace(
  '<div className={`grid grid-cols-1 sm:grid-cols-2 gap-2`}>',
  '<div className={`flex flex-col gap-2`}>'
);

content = content.replace(
  '<div className={`mb-6 pb-6 border-b grid grid-cols-2 md:grid-cols-3 gap-3 ${theme.border}`}>',
  '<div className={`mb-6 pb-6 border-b grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 ${theme.border}`}>'
);

content = content.replace(
  '<div className={`mb-6 pb-6 border-b grid grid-cols-2 md:grid-cols-3 gap-3 ${theme.border}`}>',
  '<div className={`mb-6 pb-6 border-b grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 ${theme.border}`}>'
);

fs.writeFileSync('src/pages/ComputerReadingTest.tsx', content);
console.log("Updated ComputerReadingTest.tsx");
