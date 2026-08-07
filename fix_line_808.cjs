const fs = require('fs');

let content = fs.readFileSync('src/pages/OctoberWritingTest.tsx', 'utf8');

const t1Prompt = "The table and the chart below provide a breakdown of the total expenditure and the average amount of money spent by students per week while studying abroad in 4 countries. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.";
content = content.replace(/The diagram gives information about the process of making carbonated drinks\. Summarize the information by selecting and reporting the main features, and make comparisons where relevant\./, t1Prompt);

fs.writeFileSync('src/pages/OctoberWritingTest.tsx', content);
console.log('Fixed line 808');
