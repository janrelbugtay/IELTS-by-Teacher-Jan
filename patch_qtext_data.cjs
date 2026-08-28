const fs = require('fs');
const file = 'src/data/test17ReadingData.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/{ id: 9, text: "Question 9" }/g, '{ id: 9, text: "" }');
content = content.replace(/{ id: 10, text: "Question 10" }/g, '{ id: 10, text: "" }');
content = content.replace(/{ id: 11, text: "Question 11" }/g, '{ id: 11, text: "" }');
content = content.replace(/{ id: 12, text: "Question 12" }/g, '{ id: 12, text: "" }');
content = content.replace(/{ id: 13, text: "Question 13" }/g, '{ id: 13, text: "" }');

fs.writeFileSync(file, content);
console.log('patched data');
