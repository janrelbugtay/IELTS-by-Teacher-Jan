const fs = require('fs');
let srCode = fs.readFileSync('src/pages/SpeakingTestResult.tsx', 'utf8');

const feedbackSearch = `<div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-slate-700 whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
                    {submissionData.teacherComment || submissionData.aiFeedback || submissionData.feedback || "No feedback provided for this activity yet."}
                </div>`;

const feedbackReplace = `<div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-slate-700 whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
                    <div className="mb-4">
                        {submissionData.teacherComment || submissionData.aiFeedback || submissionData.feedback || "No feedback provided for this activity yet."}
                    </div>
                    {submissionData.vietnameseTranslation && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Vietnamese Translation</h4>
                            <div className="text-slate-600">
                                {submissionData.vietnameseTranslation}
                            </div>
                        </div>
                    )}
                </div>`;

if(srCode.includes(feedbackSearch)) {
    srCode = srCode.replace(feedbackSearch, feedbackReplace);
    fs.writeFileSync('src/pages/SpeakingTestResult.tsx', srCode);
    console.log("Patched SpeakingTestResult.tsx");
}

let trCode = fs.readFileSync('src/pages/TestResult.tsx', 'utf8');
if(trCode.includes(feedbackSearch)) {
    trCode = trCode.replace(feedbackSearch, feedbackReplace);
    fs.writeFileSync('src/pages/TestResult.tsx', trCode);
    console.log("Patched TestResult.tsx");
}
