const fs = require('fs');

let content = fs.readFileSync('src/pages/OctoberWritingTest.tsx', 'utf8');

// Replace the task 1 prompt
content = content.replace(/The diagram gives information about the process of making carbonated drinks. Summarize the information by selecting and reporting the main features, and make comparisons where relevant./, '[Insert Task 1 Prompt Here]');

// Replace the image
content = content.replace(/<img src="https:\/\/drive\.google\.com\/thumbnail\?id=1ZBw6BPamaIf801hTx52KE1J5yOzsh4Bm\&sz=w1000" style=\{\{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain' \}\} alt="Task 1 Graph" referrerPolicy="no-referrer" \/>/, '[Insert Task 1 Image Here]');

// Replace task 2 prompt
content = content.replace(/It is argued that the parents of children who break the rules should be punished in some ways as parents are responsible for the children’s actions\.<br \/><br \/>[\s]+To what extent do you agree or disagree\?/, '[Insert Task 2 Prompt Here]');

// Replace taskId and examType if needed, they are hardcoded
content = content.replace(/const task1Prompt = "The diagram gives information about the process of making carbonated drinks. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.";/, 'const task1Prompt = "[Insert Task 1 Prompt Here]";');
content = content.replace(/const task2Prompt = "It is argued that the parents of children who break the rules should be punished in some ways as parents are responsible for the children’s actions. To what extent do you agree or disagree\?";/, 'const task2Prompt = "[Insert Task 2 Prompt Here]";');

content = content.replace(/const TEST_ID = "IELTS-WRITING-SEP2026-001";/, 'const TEST_ID = "IELTS-WRITING-OCT2026-001";');
content = content.replace(/const TEST_TITLE = "IELTS Writing Test 9";/, 'const TEST_TITLE = "IELTS Writing Test 10";');


fs.writeFileSync('src/pages/OctoberWritingTest.tsx', content);
console.log('Fixed prompts');
