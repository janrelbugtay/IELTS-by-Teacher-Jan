const fs = require('fs');
let code = fs.readFileSync('src/pages/SpeakingTestResult.tsx', 'utf8');

if (!code.includes("import Markdown from 'react-markdown';")) {
    code = code.replace("import { renderMarkdown } from '../lib/markdown';", "import Markdown from 'react-markdown';\nimport { renderMarkdown } from '../lib/markdown';");
}

const search1 = `<div className="mb-4 prose prose-slate max-w-none" dangerouslySetInnerHTML={renderMarkdown(submissionData.teacherComment || submissionData.aiFeedback || submissionData.feedback || submissionData.answers?.feedback || submissionData.answers?.teacherComment || "No feedback provided for this activity yet.")} />`;
const replace1 = `<div className="mb-4 prose prose-slate max-w-none">
                        <Markdown>{submissionData.teacherComment || submissionData.aiFeedback || submissionData.feedback || submissionData.answers?.feedback || submissionData.answers?.teacherComment || "No feedback provided for this activity yet."}</Markdown>
                    </div>`;

if (code.includes(search1)) {
    code = code.replace(search1, replace1);
}

const search2 = `<div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={renderMarkdown(submissionData.vietnameseTranslation || submissionData.teacherCommentVi || submissionData.answers?.vietnameseTranslation || submissionData.answers?.teacherCommentVi)} />`;
const replace2 = `<div className="prose prose-slate max-w-none">
                                <Markdown>{submissionData.vietnameseTranslation || submissionData.teacherCommentVi || submissionData.answers?.vietnameseTranslation || submissionData.answers?.teacherCommentVi}</Markdown>
                            </div>`;

if (code.includes(search2)) {
    code = code.replace(search2, replace2);
}

fs.writeFileSync('src/pages/SpeakingTestResult.tsx', code);
console.log("Patched SpeakingTestResult.tsx to use react-markdown");
