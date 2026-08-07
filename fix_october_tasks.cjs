const fs = require('fs');

let content = fs.readFileSync('src/pages/OctoberWritingTest.tsx', 'utf8');

const t1Prompt = "The table and the chart below provide a breakdown of the total expenditure and the average amount of money spent by students per week while studying abroad in 4 countries. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.";
const t2Prompt = "Nowadays it is easy to apply for and be given a credit card. However, some people experience problems when they are not able to pay their debt back. In your opinion, do the advantages of credit cards outweigh the disadvantages?";

content = content.replace(/const prompt1Raw = "[^"]*";/, `const prompt1Raw = "${t1Prompt}";`);
content = content.replace(/const prompt2Raw = "[^"]*";/, `const prompt2Raw = "${t2Prompt} Give reasons for your answer and include any relevant examples from your own knowledge or experience.";`);

content = content.replace(/\[Insert Task 1 Prompt Here\]/g, t1Prompt);
content = content.replace(/\[Insert Task 2 Prompt Here\]/g, "Nowadays it is easy to apply for and be given a credit card. However, some people experience problems when they are not able to pay their debt back.<br /><br />In your opinion, do the advantages of credit cards outweigh the disadvantages?");

const oldImg = '<img src="https://drive.google.com/thumbnail?id=1ZBw6BPamaIf801hTx52KE1J5yOzsh4Bm&sz=w1000" style={{ maxWidth: \'100%\', maxHeight: \'300px\', objectFit: \'contain\' }} alt="Task 1 Graph" referrerPolicy="no-referrer" />';
const newImg = '<img src="https://drive.google.com/thumbnail?id=1eqsQNFxCjB9RR7xUoExmQEamGEh2Sluv&sz=w1000" style={{ maxWidth: \'100%\', maxHeight: \'300px\', objectFit: \'contain\' }} alt="Task 1 Graph" referrerPolicy="no-referrer" />';

content = content.replace(oldImg, newImg);

const oldImg2 = '[Insert Task 1 Image Here]';
const newImg2 = '<img src="https://drive.google.com/thumbnail?id=1eqsQNFxCjB9RR7xUoExmQEamGEh2Sluv&sz=w1000" style={{ width: \'100%\', height: \'auto\', maxHeight: \'600px\', objectFit: \'contain\' }} alt="Task 1 Graph" referrerPolicy="no-referrer" />';
content = content.replace(oldImg2, newImg2);

fs.writeFileSync('src/pages/OctoberWritingTest.tsx', content);
console.log('Fixed tasks');
