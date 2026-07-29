const fs = require('fs');
let code = fs.readFileSync('src/pages/SpeakingTestResult.tsx', 'utf8');

const search = `                    <div className="mb-4">
                        {submissionData.teacherComment || submissionData.aiFeedback || submissionData.feedback || "No feedback provided for this activity yet."}
                    </div>
                    {(submissionData.vietnameseTranslation || submissionData.teacherCommentVi) && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Vietnamese Translation</h4>
                            <div className="text-slate-600">
                                {submissionData.vietnameseTranslation || submissionData.teacherCommentVi}
                            </div>
                        </div>
                    )}`;

const replace = `                    <div className="mb-4">
                        {submissionData.teacherComment || submissionData.aiFeedback || submissionData.feedback || submissionData.answers?.feedback || submissionData.answers?.teacherComment || "No feedback provided for this activity yet."}
                    </div>
                    {(submissionData.vietnameseTranslation || submissionData.teacherCommentVi || submissionData.answers?.vietnameseTranslation || submissionData.answers?.teacherCommentVi) && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Vietnamese Translation</h4>
                            <div className="text-slate-600">
                                {submissionData.vietnameseTranslation || submissionData.teacherCommentVi || submissionData.answers?.vietnameseTranslation || submissionData.answers?.teacherCommentVi}
                            </div>
                        </div>
                    )}`;

if(code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/pages/SpeakingTestResult.tsx', code);
    console.log("Patched SpeakingTestResult.tsx fallback");
} else {
    console.log("Could not find search string in SpeakingTestResult.tsx");
}
