import re

with open('src/pages/JanuaryWritingTest.tsx', 'r') as f:
    content = f.read()

# I will write a simple generic version of WritingPerformanceReport that works everywhere
component = """
import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { renderMarkdown } from '../lib/markdown';

export const WritingPerformanceReport = ({ 
    taskNum, 
    text, 
    report, 
    loadingReport, 
    errorText, 
    candidateName, 
    submissionId,
    onReevaluate,
    onReportEdited
}: any) => {
    const { isAdmin } = useAuth();
    const [isEditingReport, setIsEditingReport] = useState(false);
    const [editedReport, setEditedReport] = useState<any>(null);
    
    const [inlineEditingFinalAnswer, setInlineEditingFinalAnswer] = useState(false);
    const [inlineFinalAnswerText, setInlineFinalAnswerText] = useState("");

    const handleSaveInlineFinalAnswer = async () => {
        try {
            const newReport = { ...report };
            newReport.finalCorrectedAnswer = inlineFinalAnswerText;
            onReportEdited && onReportEdited(taskNum, newReport);
            
            if (submissionId) {
                const docRef = doc(db, 'submissions', submissionId);
                // We assume the parent component handles updating the firebase doc, or we update it here if passed a callback
            }
            setInlineEditingFinalAnswer(false);
        } catch (error) {
            console.error("Error saving inline answer", error);
            alert("Failed to save final answer.");
        }
    };

    const handleSaveEditedReport = async () => {
        try {
            onReportEdited && onReportEdited(taskNum, editedReport);
            setIsEditingReport(false);
        } catch (error) {
            console.error("Error saving report", error);
            alert("Failed to save edited report.");
        }
    };

    const name = candidateName || 'CANDIDATE';
    const candNo = Math.floor(100000 + Math.random() * 900000).toString();
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear());
    const redBarText = `Writing Task ${taskNum} \\u00A0 \\u00A0 \\u00A0 `.repeat(10);

    return (
        <div className="w-full max-w-4xl flex flex-col items-center mb-12">
            <div className="answer-sheet relative bg-white p-8 md:p-12 border border-gray-300 w-full shrink-0" style={{ width: '210mm', minHeight: '297mm', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', pageBreakAfter: 'always' }}>
                <div className="text-center font-bold text-2xl mb-6 mt-4">IELTS Writing Answer Sheet - TASK {taskNum}</div>
                
                <div className="border-2 border-black mb-4 flex flex-col text-sm font-sans text-black">
                    <div className="flex border-b-2 border-black">
                        <div className="p-2 w-32 border-r-2 border-black font-bold flex items-center">Candidate<br/>Name</div>
                        <div className="p-2 flex-1 font-mono text-xl tracking-widest flex items-center">{name}</div>
                    </div>
                    <div className="flex border-b-2 border-black">
                        <div className="p-2 w-32 border-r-2 border-black font-bold flex items-center">Candidate<br/>No.</div>
                        <div className="p-2 flex-1 font-mono text-lg tracking-[0.5em] flex items-center">{candNo}</div>
                        <div className="p-2 w-24 border-x-2 border-black font-bold flex items-center">Centre<br/>No.</div>
                        <div className="p-2 w-40"></div>
                    </div>
                    <div className="flex">
                        <div className="p-2 w-32 border-r-2 border-black font-bold flex items-center">Test<br/>Module</div>
                        <div className="p-2 flex-1 flex items-center space-x-6">
                            <label className="flex items-center"><input type="checkbox" defaultChecked disabled className="mr-2 w-4 h-4" /> Academic</label>
                        </div>
                        <div className="p-2 w-24 border-x-2 border-black font-bold flex items-center justify-center">Test Date</div>
                        <div className="p-2 flex items-center space-x-3 font-mono">
                            <div className="flex flex-col items-center"><span className="border border-gray-500 px-3 py-1 text-base">{day}</span><span className="text-[10px] mt-1 font-sans">Day</span></div>
                            <div className="flex flex-col items-center"><span className="border border-gray-500 px-3 py-1 text-base">{month}</span><span className="text-[10px] mt-1 font-sans">Month</span></div>
                            <div className="flex flex-col items-center"><span className="border border-gray-500 px-3 py-1 text-base">{year}</span><span className="text-[10px] mt-1 font-sans">Year</span></div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-[#ff3333] text-white font-bold text-center overflow-hidden whitespace-nowrap py-1.5 mb-2 text-base tracking-widest">
                    {redBarText}
                </div>
                
                <div className="font-mono text-[15px] leading-8 text-gray-800 whitespace-pre-wrap mt-8 pt-4 pb-12 border-t border-gray-300 relative px-4" 
                    style={{
                        backgroundImage: 'linear-gradient(transparent 95%, #cbd5e1 95%)',
                        backgroundSize: '100% 32px',
                        minHeight: '200mm'
                    }}>
                    {text}
                    {(!text || text.trim() === '') && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 text-2xl font-sans italic rotate-[-45deg] pointer-events-none">NO ANSWER PROVIDED</div>
                    )}
                </div>
                
                <div className="mt-8 border-t-2 border-black pt-2 flex justify-between text-xs font-bold text-gray-600">
                    <div>EXAMINER USE ONLY</div>
                    <div>EXAMINER 2 NUMBER: &nbsp; _______________</div>
                </div>
            </div>

            {loadingReport && (
                <div className="w-full flex justify-center mt-12 print-hidden">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 flex items-center space-x-4 animate-pulse">
                        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div>
                            <h3 className="font-bold text-indigo-900 text-lg">AI Examiner is grading Task {taskNum}...</h3>
                            <p className="text-gray-500 text-sm">Analyzing task achievement, coherence, and grammar.</p>
                        </div>
                    </div>
                </div>
            )}
            
            {errorText && (
                <div className="w-full mt-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm print-hidden">
                    <h3 className="font-bold">Evaluation Error (Task {taskNum})</h3>
                    <p>{errorText}</p>
                    <button onClick={onReevaluate} className="mt-2 text-sm bg-red-100 px-3 py-1 rounded font-bold hover:bg-red-200">Try Again</button>
                </div>
            )}

            {report && !loadingReport && (
                <div className="ai-report bg-white rounded-xl shadow-2xl mt-8 overflow-hidden border border-gray-200" style={{ width: '190mm', maxWidth: '190mm', margin: '0 auto', pageBreakAfter: 'always' }}>
                    <div className="bg-indigo-900 text-white p-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Official Examiner Report</h2>
                            <p className="text-indigo-200 text-sm mt-1 flex items-center gap-4">
                                Writing Task {taskNum} Evaluation
                                {isAdmin && (
                                    <>
                                        <button 
                                            onClick={() => {
                                                setEditedReport(JSON.parse(JSON.stringify(report)));
                                                setIsEditingReport(true);
                                            }}
                                            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded"
                                        >
                                            Edit Report
                                        </button>
                                        <button 
                                            onClick={onReevaluate}
                                            className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-indigo-900 text-xs font-bold rounded ml-2 flex items-center justify-center cursor-pointer"
                                        >
                                            Re-evaluate
                                        </button>
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="bg-yellow-400 text-indigo-900 rounded-full h-20 w-20 flex flex-col items-center justify-center font-bold shadow-lg border-4 border-indigo-800">
                            <span className="text-sm uppercase tracking-wider mb-[-4px] opacity-80">Band</span>
                            <span className="text-3xl font-extrabold">{report.scores?.overallBand}</span>
                        </div>
                    </div>
                    
                    {isEditingReport ? (
                        <div className="p-6 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-4 text-lg">Edit Report Data</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div><label className="text-xs font-bold">Overall Band</label><input type="number" step="0.5" className="w-full border p-2" value={editedReport.scores?.overallBand || ""} onChange={e => setEditedReport({...editedReport, scores: {...editedReport.scores, overallBand: e.target.value}})} /></div>
                                <div><label className="text-xs font-bold">Task Achievement / Response</label><input type="number" step="0.5" className="w-full border p-2" value={editedReport.scores?.taskAchievement || ""} onChange={e => setEditedReport({...editedReport, scores: {...editedReport.scores, taskAchievement: e.target.value}})} /></div>
                                <div><label className="text-xs font-bold">Coherence and Cohesion</label><input type="number" step="0.5" className="w-full border p-2" value={editedReport.scores?.coherenceCohesion || ""} onChange={e => setEditedReport({...editedReport, scores: {...editedReport.scores, coherenceCohesion: e.target.value}})} /></div>
                                <div><label className="text-xs font-bold">Lexical Resource</label><input type="number" step="0.5" className="w-full border p-2" value={editedReport.scores?.lexicalResource || ""} onChange={e => setEditedReport({...editedReport, scores: {...editedReport.scores, lexicalResource: e.target.value}})} /></div>
                                <div><label className="text-xs font-bold">Grammatical Range</label><input type="number" step="0.5" className="w-full border p-2" value={editedReport.scores?.grammaticalRange || ""} onChange={e => setEditedReport({...editedReport, scores: {...editedReport.scores, grammaticalRange: e.target.value}})} /></div>
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-bold">Feedback - Task Achievement</label>
                                <textarea className="w-full border p-2 h-20" value={editedReport.feedback?.taskAchievement || ""} onChange={e => setEditedReport({...editedReport, feedback: {...editedReport.feedback, taskAchievement: e.target.value}})} />
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-bold">Feedback - Coherence</label>
                                <textarea className="w-full border p-2 h-20" value={editedReport.feedback?.coherenceCohesion || ""} onChange={e => setEditedReport({...editedReport, feedback: {...editedReport.feedback, coherenceCohesion: e.target.value}})} />
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-bold">Feedback - Lexical</label>
                                <textarea className="w-full border p-2 h-20" value={editedReport.feedback?.lexicalResource || ""} onChange={e => setEditedReport({...editedReport, feedback: {...editedReport.feedback, lexicalResource: e.target.value}})} />
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-bold">Feedback - Grammar</label>
                                <textarea className="w-full border p-2 h-20" value={editedReport.feedback?.grammaticalRange || ""} onChange={e => setEditedReport({...editedReport, feedback: {...editedReport.feedback, grammaticalRange: e.target.value}})} />
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-bold">Inline Marked Essay</label>
                                <textarea className="w-full border p-2 h-32" value={editedReport.inlineMarkedEssay || ""} onChange={e => setEditedReport({...editedReport, inlineMarkedEssay: e.target.value})} />
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-bold">Final Corrected Answer</label>
                                <textarea className="w-full border p-2 h-32" value={editedReport.finalCorrectedAnswer || ""} onChange={e => setEditedReport({...editedReport, finalCorrectedAnswer: e.target.value})} />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setIsEditingReport(false)} className="px-4 py-2 bg-slate-200 font-bold rounded">Cancel</button>
                                <button onClick={handleSaveEditedReport} className="px-4 py-2 bg-blue-600 text-white font-bold rounded">Save Changes</button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 md:p-8 space-y-8 bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">1. Detailed Scoring</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-700">{taskNum === 1 ? 'Task Achievement' : 'Task Response'}</span>
                                            <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded text-sm">{report.scores?.taskAchievement}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{report.feedback?.taskAchievement}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-700">Coherence & Cohesion</span>
                                            <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded text-sm">{report.scores?.coherenceCohesion}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{report.feedback?.coherenceCohesion}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-700">Lexical Resource</span>
                                            <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded text-sm">{report.scores?.lexicalResource}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{report.feedback?.lexicalResource}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-700">Grammatical Range</span>
                                            <span className="bg-indigo-100 text-indigo-800 font-bold px-2 py-1 rounded text-sm">{report.scores?.grammaticalRange}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{report.feedback?.grammaticalRange}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">2. Strengths & Weaknesses</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                                        <h4 className="font-bold text-green-800 flex items-center mb-3">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Strengths
                                        </h4>
                                        <ul className="list-disc pl-5 text-sm text-green-900 space-y-1">
                                            {report.keyStrengths?.map((s: string, i: number) => <li key={i}>{s}</li>) || <li>No specific strengths identified.</li>}
                                        </ul>
                                    </div>
                                    <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                                        <h4 className="font-bold text-red-800 flex items-center mb-3">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                            Areas for Improvement
                                        </h4>
                                        <ul className="list-disc pl-5 text-sm text-red-900 space-y-1">
                                            {report.keyWeaknesses?.map((w: string, i: number) => <li key={i}>{w}</li>) || <li>No specific weaknesses identified.</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">3. Inline Corrections</h3>
                                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={renderMarkdown(report.inlineMarkedEssay || "No inline markings.")} />
                            </div>
                            
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-center border-b pb-2 mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">4. Final Corrected Answer</h3>
                                    {isAdmin && !inlineEditingFinalAnswer && (
                                        <button onClick={() => { setInlineEditingFinalAnswer(true); setInlineFinalAnswerText(report.finalCorrectedAnswer || ""); }} className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold rounded">Edit</button>
                                    )}
                                </div>
                                {inlineEditingFinalAnswer ? (
                                    <div className="flex flex-col gap-2">
                                        <textarea className="w-full border border-blue-300 p-2 rounded h-40 text-sm" value={inlineFinalAnswerText} onChange={e => setInlineFinalAnswerText(e.target.value)}></textarea>
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => setInlineEditingFinalAnswer(false)} className="px-3 py-1 bg-gray-200 text-xs font-bold rounded hover:bg-gray-300">Cancel</button>
                                            <button onClick={handleSaveInlineFinalAnswer} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="prose prose-sm max-w-none text-blue-900" dangerouslySetInnerHTML={renderMarkdown(report.finalCorrectedAnswer || "No corrected answer available.")} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {!report && !loadingReport && isAdmin && (
                <div className="w-full flex justify-center mt-8 print-hidden">
                    <button onClick={onReevaluate} className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:-translate-y-1 flex items-center space-x-3 cursor-pointer border border-indigo-400/30">
                        <svg className="w-6 h-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        <span className="text-lg tracking-wide">Generate Official Report &mdash; Task {taskNum}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
"""

with open('src/components/WritingPerformanceReport.tsx', 'w') as f:
    f.write(component)
