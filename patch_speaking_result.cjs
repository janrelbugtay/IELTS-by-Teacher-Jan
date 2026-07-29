const fs = require('fs');
let code = fs.readFileSync('src/pages/SpeakingTestResult.tsx', 'utf8');

if(!code.includes("import { renderMarkdown } from '../lib/markdown';")) {
    code = code.replace("import { useAuth } from '../contexts/AuthContext';", "import { useAuth } from '../contexts/AuthContext';\nimport { renderMarkdown } from '../lib/markdown';");
}

const isOfflineSearch = `const navigate = useNavigate();`;
const isOfflineReplace = `const navigate = useNavigate();
  const isOffline = submissionData?.assignmentId === 'offline_speaking' || submissionData?.assignmentTitle?.toLowerCase().includes('offline');`;

if(!code.includes("const isOffline =")) {
    code = code.replace(isOfflineSearch, isOfflineReplace);
}

const testIdSearch = `<SpeakingRecordingsReview testId={submissionData.assignmentTitle || submissionData.assignmentId} providedAudioUrl={submissionData.audioUrl} />`;
const testIdReplace = `<SpeakingRecordingsReview testId={isOffline ? 'offline_speaking' : (submissionData.assignmentTitle || submissionData.assignmentId)} providedAudioUrl={submissionData.audioUrl} />`;

if(code.includes(testIdSearch)) {
    code = code.replace(testIdSearch, testIdReplace);
}

const feedbackSearch = `<div className="mb-4">
                        {submissionData.teacherComment || submissionData.aiFeedback || submissionData.feedback || submissionData.answers?.feedback || submissionData.answers?.teacherComment || "No feedback provided for this activity yet."}
                    </div>`;
const feedbackReplace = `<div className="mb-4 prose prose-slate max-w-none" dangerouslySetInnerHTML={renderMarkdown(submissionData.teacherComment || submissionData.aiFeedback || submissionData.feedback || submissionData.answers?.feedback || submissionData.answers?.teacherComment || "No feedback provided for this activity yet.")} />`;

if(code.includes(feedbackSearch)) {
    code = code.replace(feedbackSearch, feedbackReplace);
}

const translationSearch = `<div className="text-slate-600">
                                {submissionData.vietnameseTranslation || submissionData.teacherCommentVi || submissionData.answers?.vietnameseTranslation || submissionData.answers?.teacherCommentVi}
                            </div>`;
const translationReplace = `<div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={renderMarkdown(submissionData.vietnameseTranslation || submissionData.teacherCommentVi || submissionData.answers?.vietnameseTranslation || submissionData.answers?.teacherCommentVi)} />`;

if(code.includes(translationSearch)) {
    code = code.replace(translationSearch, translationReplace);
}

fs.writeFileSync('src/pages/SpeakingTestResult.tsx', code);
console.log("Patched SpeakingTestResult.tsx");
