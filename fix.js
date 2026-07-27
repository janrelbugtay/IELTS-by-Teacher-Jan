const fs = require('fs');
let file = fs.readFileSync('src/pages/TestResult.tsx', 'utf8');

file = file.replace(/\/\/ Swap logic so assignmentTitle has priority\n\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('january'\)\) return <JanuaryWritingTest submissionId=\{id\} \/>;/g, "const aId = submission.assignmentId;");

fs.writeFileSync('src/pages/TestResult.tsx', file);
