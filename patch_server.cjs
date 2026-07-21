const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const searchStr = `Your goal is to evaluate the student's writing strictly according to the official IELTS Writing Task Band Descriptors provided below.
Be strict and realistic. Do not inflate scores.`;

const replaceStr = `Your goal is to evaluate the student's writing strictly according to the official IELTS Writing Task Band Descriptors provided below.
Be strict and realistic. Do not inflate scores.
CRITICAL INSTRUCTION: You MUST carefully read the provided IELTS Writing Task Question. Evaluate the student's response SPECIFICALLY against this prompt. If the student's response is off-topic, memorized, or fails to address the specific topic and requirements of the prompt, you MUST severely penalize the Task Achievement / Task Response score (Band 5.0 or lower).`;

content = content.replace(searchStr, replaceStr);

fs.writeFileSync('server.ts', content);
console.log('Patched server.ts successfully');
