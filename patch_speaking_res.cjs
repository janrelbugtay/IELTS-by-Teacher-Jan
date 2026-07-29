const fs = require('fs');
let code = fs.readFileSync('src/pages/SpeakingTestResult.tsx', 'utf8');

const search = `      {(submissionData.assignmentId === 'offline_speaking' || submissionData.assignmentTitle?.toLowerCase().includes('offline')) && (
        <div className="max-w-4xl mx-auto w-full px-8 -mb-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-[#282B5C] mb-4">Feedback / Scores</h2>
                
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                        <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Overall Band</span>
                        <span className="text-lg font-bold">{submissionData.bandScore !== undefined && submissionData.bandScore !== null ? submissionData.bandScore.toFixed(1) : 'Pending'}</span>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-slate-700 whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
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
                </div>
            </div>
        </div>
      )}

      {(submissionData.audioUrl || submissionData.assignmentId === 'offline_speaking') && (
        <div className="pb-12">
           <SpeakingRecordingsReview testId={submissionData.assignmentTitle || submissionData.assignmentId} providedAudioUrl={submissionData.audioUrl} />
        </div>
      )}`;

const replace = `      {(submissionData.audioUrl || submissionData.assignmentId === 'offline_speaking') && (
        <div className="pb-8">
           <SpeakingRecordingsReview testId={submissionData.assignmentTitle || submissionData.assignmentId} providedAudioUrl={submissionData.audioUrl} />
        </div>
      )}

      {(submissionData.assignmentId === 'offline_speaking' || submissionData.assignmentTitle?.toLowerCase().includes('offline')) && (
        <div className="max-w-4xl mx-auto w-full px-8 pb-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-[#282B5C] mb-4">Feedback</h2>
                
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-slate-700 whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
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
                </div>
            </div>
        </div>
      )}`;

if(code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/pages/SpeakingTestResult.tsx', code);
    console.log("Patched SpeakingTestResult.tsx successfully");
} else {
    console.log("Could not find search string in SpeakingTestResult.tsx");
}
