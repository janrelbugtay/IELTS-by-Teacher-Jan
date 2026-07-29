const fs = require('fs');
let code = fs.readFileSync('src/pages/SpeakingTestResult.tsx', 'utf8');

const search = `{submissionData.vietnameseTranslation && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Vietnamese Translation</h4>
                            <div className="text-slate-600">
                                {submissionData.vietnameseTranslation}
                            </div>
                        </div>
                    )}`;

const replace = `{(submissionData.vietnameseTranslation || submissionData.teacherCommentVi) && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Vietnamese Translation</h4>
                            <div className="text-slate-600">
                                {submissionData.vietnameseTranslation || submissionData.teacherCommentVi}
                            </div>
                        </div>
                    )}`;

if(code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/pages/SpeakingTestResult.tsx', code);
    console.log("Patched SpeakingTestResult.tsx translation fallback");
} else {
    console.log("Could not find search string in SpeakingTestResult.tsx");
}
