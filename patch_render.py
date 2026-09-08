import re

with open('src/pages/ComputerWritingTest.tsx', 'r') as f:
    content = f.read()

# Add the import
if "import { WritingPerformanceReport" not in content:
    content = content.replace("import { EraLogo } from '../components/EraLogo';", "import { EraLogo } from '../components/EraLogo';\nimport { WritingPerformanceReport } from '../components/WritingPerformanceReport';")

# Find the isSubmitted rendering block and replace it
# We know it starts with {state.isSubmitted && !isEvaluating && (
# and ends right before <div className="px-8 py-5 bg-[#f8fafc] border-b border-gray-200 flex-none">

search_str = r"\{state\.isSubmitted && !isEvaluating && \([\s\S]*?(?=<div className=\"px-8 py-5 bg-\[\#f8fafc\] border-b border-gray-200 flex-none\">)"

new_render = """{state.isSubmitted && !isEvaluating && (
                    <div id="result-overlay" className="absolute inset-0 z-[60] bg-[#cbd5e1] flex flex-col items-center auto-fade-in overflow-y-auto p-4 md:p-8">
                        <div className="print-hidden max-w-5xl mx-auto w-full flex justify-between items-center mb-6 sticky top-0 bg-white/90 backdrop-blur py-3 px-6 rounded shadow z-10 border border-gray-300">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Your Answer Sheets</h2>
                                <p className="text-sm text-gray-600">Test submitted successfully. {isAdmin ? "Please evaluate the submission." : "Your teacher will review your writing soon."}</p>
                            </div>
                            <div className="space-x-4 flex">
                                <button onClick={() => navigate('/dashboard')} className="bg-gray-600 text-white px-5 py-2 rounded font-bold shadow hover:bg-gray-700 flex items-center space-x-2 cursor-pointer">
                                    <span>Dashboard</span>
                                </button>
                                <button onClick={() => {
                                    localStorage.removeItem(`${STORAGE_KEY}_${id}`);
                                    window.location.reload();
                                }} className="bg-slate-100 text-slate-700 px-5 py-2 rounded font-bold shadow hover:bg-slate-200 transition-colors flex items-center space-x-2 border border-slate-300">
                                    <span>Retake {typeLabel}</span>
                                </button>
                                <button onClick={() => window.print()} className="bg-blue-600 text-white px-5 py-2 rounded font-bold shadow hover:bg-blue-700 transition-colors flex items-center space-x-2 cursor-pointer">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    <span>Print PDF</span>
                                </button>
                            </div>
                        </div>

                        <div id="result-sheets-container" className="flex flex-col items-center pb-20 space-y-12 w-full">
                            {(!publishConfig || publishConfig.part1) && (
                                <WritingPerformanceReport 
                                    taskNum={1} 
                                    text={state.textPart1}
                                    report={(() => { try { return JSON.parse(state.aiFeedbackRaw).part1; } catch(e) { return null; } })()}
                                    loadingReport={false}
                                    errorText={""}
                                    candidateName={state.studentName}
                                    submissionId={submissionId}
                                    onReevaluate={() => { updateState({activePart: 1}); setTimeout(handleGenerateReport, 0); }}
                                    onReportEdited={async (taskNum: number, newReport: any) => {
                                        let rawData: any = {};
                                        try { if (state.aiFeedbackRaw) rawData = JSON.parse(state.aiFeedbackRaw); } catch(e) {}
                                        rawData.part1 = newReport;
                                        const newRawStr = JSON.stringify(rawData);
                                        const overallBand = parseFloat(newReport.scores?.overallBand) || 0;
                                        setState(prev => ({ ...prev, aiFeedbackRaw: newRawStr, aiBandScore: overallBand }));
                                        
                                        if (submissionId) {
                                            const { updateDoc, doc } = await import('firebase/firestore');
                                            const docRef = doc(db, 'submissions', submissionId);
                                            await updateDoc(docRef, { aiFeedbackRaw: newRawStr, bandScore: overallBand, requiresEvaluation: false });
                                        }
                                    }}
                                />
                            )}
                            {(!publishConfig || publishConfig.part2) && (
                                <WritingPerformanceReport 
                                    taskNum={2} 
                                    text={state.textPart2}
                                    report={(() => { try { return JSON.parse(state.aiFeedbackRaw).part2; } catch(e) { return null; } })()}
                                    loadingReport={false}
                                    errorText={""}
                                    candidateName={state.studentName}
                                    submissionId={submissionId}
                                    onReevaluate={() => { updateState({activePart: 2}); setTimeout(handleGenerateReport, 0); }}
                                    onReportEdited={async (taskNum: number, newReport: any) => {
                                        let rawData: any = {};
                                        try { if (state.aiFeedbackRaw) rawData = JSON.parse(state.aiFeedbackRaw); } catch(e) {}
                                        rawData.part2 = newReport;
                                        const newRawStr = JSON.stringify(rawData);
                                        const overallBand = parseFloat(newReport.scores?.overallBand) || 0;
                                        setState(prev => ({ ...prev, aiFeedbackRaw: newRawStr, aiBandScore: overallBand }));
                                        
                                        if (submissionId) {
                                            const { updateDoc, doc } = await import('firebase/firestore');
                                            const docRef = doc(db, 'submissions', submissionId);
                                            await updateDoc(docRef, { aiFeedbackRaw: newRawStr, bandScore: overallBand, requiresEvaluation: false });
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}

                """

content = re.sub(search_str, new_render, content)

with open('src/pages/ComputerWritingTest.tsx', 'w') as f:
    f.write(content)

