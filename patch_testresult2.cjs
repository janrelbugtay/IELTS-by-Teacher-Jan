const fs = require('fs');
let content = fs.readFileSync('src/pages/TestResult.tsx', 'utf8');

const oldRouting = `  if (type === 'writing') {
      const aId = submission.assignmentId;
      if (aId === '3') return <JanuaryWritingTest submissionId={id} />;`;

const newRouting = `  if (type === 'writing') {
      let aId = submission.assignmentId;
      let title = submission.assignmentTitle?.toLowerCase() || '';

      if (aId === '35' || title.includes('september')) {
          const answerText = typeof submission.answers === 'string' ? submission.answers.toLowerCase() : JSON.stringify(submission.answers).toLowerCase();
          if (answerText.includes('expenditure') || answerText.includes('tuition') || answerText.includes('country a')) {
              aId = '39';
              title = 'october';
          }
      }

      if (aId === '3') return <JanuaryWritingTest submissionId={id} />;`;

content = content.replace(oldRouting, newRouting);

// Also need to patch the string matching for titles below that
const oldTitleMatching = `      if (submission.assignmentTitle?.toLowerCase().includes('january')) return <JanuaryWritingTest submissionId={id} />;`;
const newTitleMatching = `      if (title.includes('january')) return <JanuaryWritingTest submissionId={id} />;`;

// We'll just replace the specific string matches:
content = content.replace(/if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('january'\)\)/g, "if (title.includes('january'))");
content = content.replace(/if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('february'\)\)/g, "if (title.includes('february'))");
content = content.replace(/if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('march'\)\)/g, "if (title.includes('march'))");
content = content.replace(/if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('april'\)\)/g, "if (title.includes('april'))");
content = content.replace(/if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('may'\)\)/g, "if (title.includes('may'))");
content = content.replace(/if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('june'\)\)/g, "if (title.includes('june'))");
content = content.replace(/if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('july'\)\)/g, "if (title.includes('july'))");
content = content.replace(/if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('august'\)\)/g, "if (title.includes('august'))");
content = content.replace(/if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('september'\)\)/g, "if (title.includes('september'))");
content = content.replace(/if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('october'\)\)/g, "if (title.includes('october'))");

fs.writeFileSync('src/pages/TestResult.tsx', content);
console.log("Patched TestResult.tsx");
