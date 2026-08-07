const fs = require('fs');
let content = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');
content = content.replace(/MOCK_QUESTIONS\.part3\[qIndex\]\.sampleAnswer/g, '(MOCK_QUESTIONS.part3[qIndex] as any).sampleAnswer');
content = content.replace(/const sample = arr\[qIndex\]\.sampleAnswer;/g, 'const sample = (arr[qIndex] as any).sampleAnswer;');
fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', content);
