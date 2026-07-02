import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';

export const FebruaryWritingTest = ({ submissionId }: { submissionId?: string }) => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [currentPart, setCurrentPart] = useState(1);
    const [candidateName, setCandidateName] = useState(user?.displayName?.toUpperCase() || "");
    const [text1, setText1] = useState("");
    const [text2, setText2] = useState("");
    const [examStarted, setExamStarted] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60 * 60);
    const [loadingReport1, setLoadingReport1] = useState(false);
    const [loadingReport2, setLoadingReport2] = useState(false);
    const [report1, setReport1] = useState<any>(null);
    const [report2, setReport2] = useState<any>(null);
    const [error1, setError1] = useState("");
    const [error2, setError2] = useState("");
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const [isEditingReport1, setIsEditingReport1] = useState(false);
    const [isEditingReport2, setIsEditingReport2] = useState(false);
    const [editedReport1Str, setEditedReport1Str] = useState("");
    const [editedReport2Str, setEditedReport2Str] = useState("");

    const handleSaveEditedReport = async (taskNum: number) => {
        try {
            let newReport = null;
            if (taskNum === 1) {
                newReport = JSON.parse(editedReport1Str);
                setReport1(newReport);
                setIsEditingReport1(false);
            } else {
                newReport = JSON.parse(editedReport2Str);
                setReport2(newReport);
                setIsEditingReport2(false);
            }

            if (submissionId) {
                const docRef = doc(db, 'submissions', submissionId);
                const otherReport = taskNum === 1 ? report2 : report1;
                const data = newReport;
                
                let combinedBand = parseFloat(data.scores?.overallBand) || 0;
                let aiFeedbackMarkdown = `### Task ${taskNum} Evaluation\n**Overall Band Score:** ${data.scores?.overallBand}\n\n**Task Achievement / Response:** ${data.scores?.taskAchievement}\n*${data.feedback?.taskAchievement}*\n\n**Coherence and Cohesion:** ${data.scores?.coherenceCohesion}\n*${data.feedback?.coherenceCohesion}*\n\n**Lexical Resource:** ${data.scores?.lexicalResource}\n*${data.feedback?.lexicalResource}*\n\n**Grammatical Range and Accuracy:** ${data.scores?.grammaticalRange}\n*${data.feedback?.grammaticalRange}*\n\n#### Corrected Answer\n${data.correctedAnswer || ''}\n\n#### Error Marking\n${data.errorMarking || ''}\n`;
                
                if (otherReport && otherReport.scores) {
                    const band1 = taskNum === 1 ? parseFloat(data.scores?.overallBand) || 0 : parseFloat(otherReport.scores?.overallBand) || 0;
                    const band2 = taskNum === 2 ? parseFloat(data.scores?.overallBand) || 0 : parseFloat(otherReport.scores?.overallBand) || 0;
                    combinedBand = Math.round(((band1 + (band2 * 2)) / 3) * 2) / 2;
                    
                    const formatReport = (t: number, d: any) => `### Task ${t} Evaluation\n**Overall Band Score:** ${d.scores?.overallBand}\n\n**Task Achievement / Response:** ${d.scores?.taskAchievement}\n*${d.feedback?.taskAchievement}*\n\n**Coherence and Cohesion:** ${d.scores?.coherenceCohesion}\n*${d.feedback?.coherenceCohesion}*\n\n**Lexical Resource:** ${d.scores?.lexicalResource}\n*${d.feedback?.lexicalResource}*\n\n**Grammatical Range and Accuracy:** ${d.scores?.grammaticalRange}\n*${d.feedback?.grammaticalRange}*\n\n#### Corrected Answer\n${d.correctedAnswer || ''}\n\n#### Error Marking\n${d.errorMarking || ''}\n`;
                    
                    aiFeedbackMarkdown = formatReport(1, taskNum === 1 ? data : otherReport) + "\n---\n\n" + formatReport(2, taskNum === 2 ? data : otherReport);
                }

                await updateDoc(docRef, {
                    bandScore: combinedBand,
                    aiFeedback: aiFeedbackMarkdown,
                    aiFeedbackRaw: JSON.stringify({
                        part1: taskNum === 1 ? data : report1,
                        part2: taskNum === 2 ? data : report2
                    }),
                    requiresEvaluation: false
                });
            }
        } catch (e) {
            console.error("Failed to save edited report", e);
            alert("Invalid JSON format or save failed.");
        }
    };

    const text1Ref = useRef(text1);
    const text2Ref = useRef(text2);
    const candidateNameRef = useRef(candidateName);
    const sheetsContainerRef = useRef<HTMLDivElement>(null);

    const prompt1Raw = "The diagrams below show two cutting tools made from stone. They are from an early period (Tool A, 1.4 million years ago) and a later period (Tool B, 800,000 years ago) of human history. Both tools show front, side, and back views, alongside a 5cm scale. Tool A is roughly 7-8cm long, narrower, and less refined. Tool B is larger (around 10-12cm), wider, teardrop-shaped, and shows much more refined and detailed chipping. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.";
    const prompt2Raw = "In some parts of the world it is becoming popular to research the history of one's own family. Why might people want to do this? Is it a positive or negative development?";

    useEffect(() => {
        text1Ref.current = text1;
        text2Ref.current = text2;
        candidateNameRef.current = candidateName;
    }, [text1, text2, candidateName]);

    useEffect(() => {
        async function loadSubmission() {
            if (submissionId) {
                try {
                    const docRef = doc(db, 'submissions', submissionId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        let parsedAnswers: { part1?: string, part2?: string } = {};
                        if (typeof data.answers === 'string') {
                            try { parsedAnswers = JSON.parse(data.answers); } catch (e) {}
                        } else {
                            parsedAnswers = data.answers || {};
                        }
                        setText1(parsedAnswers.part1 || "");
                        setText2(parsedAnswers.part2 || "");
                        if (data.studentName) setCandidateName(data.studentName);
                        if (data.aiFeedbackRaw) {
                            try {
                                const parsedRaw = JSON.parse(data.aiFeedbackRaw);
                                if (parsedRaw.part1) setReport1(parsedRaw.part1);
                                if (parsedRaw.part2) setReport2(parsedRaw.part2);
                            } catch (e) {}
                        }
                        setExamStarted(true);
                        setIsSubmitted(true);
                        setTimeLeft(0);
                    }
                } catch (error) {
                    console.error("Error loading submission:", error);
                }
            }
        }
        loadSubmission();
    }, [submissionId]);

    useEffect(() => {
        let timer: any;
        if (examStarted && !isSubmitted && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [examStarted, isSubmitted, timeLeft]);

    const handleSubmit = async () => {
        if (isSubmitted) return;
        setIsSubmitted(true);
        if (user) {
            try {
                await addDoc(collection(db, 'submissions'), {
                    userId: user.uid,
                    studentName: candidateNameRef.current || 'CANDIDATE',
                    assignmentId: '6',
                    assignmentTitle: 'February Writing Practice',
                    assignmentType: 'writing',
                    createdAt: serverTimestamp(),
                    status: 'submitted',
                    answers: JSON.stringify({ part1: text1Ref.current, part2: text2Ref.current }),
                    bandScore: null,
                    timeSpent: 3600 - timeLeft,
                    requiresEvaluation: false 
                });
            } catch (error) {
                console.error("Failed to save submission", error);
            }
        }
    };

    const wordCount = (text: string) => {
        const trimmed = text.trim();
        return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const startTest = () => {
        if (!candidateName.trim()) setCandidateName("CANDIDATE");
        setExamStarted(true);
    };

    const getAIFeedback = async (taskNum: number) => {
        const studentText = taskNum === 1 ? text1 : text2;
        const rawPrompt = taskNum === 1 ? prompt1Raw : prompt2Raw;
        
        if (!studentText.trim()) {
            alert(`Please write something for Task ${taskNum} before requesting feedback.`);
            return;
        }

        if (taskNum === 1) {
            setLoadingReport1(true);
            setError1("");
        } else {
            setLoadingReport2(true);
            setError2("");
        }

        try {
            const response = await fetch('/api/evaluate-writing-json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputText: studentText, taskType: taskNum.toString(), rawPrompt })
            });

            if (!response.ok) {
                let errText = await response.text();
                try {
                    const parsedErr = JSON.parse(errText);
                    if (parsedErr.error) errText = parsedErr.error;
                } catch(e) {}
                throw new Error(`Evaluation failed: ${errText}`);
            }

            const data = await response.json();

            if (taskNum === 1) {
                setReport1(data);
                setLoadingReport1(false);
            } else {
                setReport2(data);
                setLoadingReport2(false);
            }

            if (submissionId) {
                try {
                    const docRef = doc(db, 'submissions', submissionId);
                    
                    // If we have the other report, we can calculate combined score and feedback
                    const otherReport = taskNum === 1 ? report2 : report1;
                    
                    let combinedBand = parseFloat(data.scores?.overallBand) || 0;
                    let aiFeedbackMarkdown = `### Task ${taskNum} Evaluation\n**Overall Band Score:** ${data.scores?.overallBand}\n\n**Task Achievement / Response:** ${data.scores?.taskAchievement}\n*${data.feedback?.taskAchievement}*\n\n**Coherence and Cohesion:** ${data.scores?.coherenceCohesion}\n*${data.feedback?.coherenceCohesion}*\n\n**Lexical Resource:** ${data.scores?.lexicalResource}\n*${data.feedback?.lexicalResource}*\n\n**Grammatical Range and Accuracy:** ${data.scores?.grammaticalRange}\n*${data.feedback?.grammaticalRange}*\n\n#### Corrected Answer\n${data.correctedAnswer || ''}\n\n#### Error Marking\n${data.errorMarking || ''}\n`;
                    
                    if (otherReport && otherReport.scores) {
                        const band1 = taskNum === 1 ? parseFloat(data.scores?.overallBand) || 0 : parseFloat(otherReport.scores?.overallBand) || 0;
                        const band2 = taskNum === 2 ? parseFloat(data.scores?.overallBand) || 0 : parseFloat(otherReport.scores?.overallBand) || 0;
                        combinedBand = Math.round(((band1 + (band2 * 2)) / 3) * 2) / 2; // round to nearest 0.5
                        
                        const formatReport = (t: number, d: any) => `### Task ${t} Evaluation\n**Overall Band Score:** ${d.scores?.overallBand}\n\n**Task Achievement / Response:** ${d.scores?.taskAchievement}\n*${d.feedback?.taskAchievement}*\n\n**Coherence and Cohesion:** ${d.scores?.coherenceCohesion}\n*${d.feedback?.coherenceCohesion}*\n\n**Lexical Resource:** ${d.scores?.lexicalResource}\n*${d.feedback?.lexicalResource}*\n\n**Grammatical Range and Accuracy:** ${d.scores?.grammaticalRange}\n*${d.feedback?.grammaticalRange}*\n\n#### Corrected Answer\n${d.correctedAnswer || ''}\n\n#### Error Marking\n${d.errorMarking || ''}\n`;
                        
                        aiFeedbackMarkdown = formatReport(1, taskNum === 1 ? data : otherReport) + "\n---\n\n" + formatReport(2, taskNum === 2 ? data : otherReport);
                    }

                    await updateDoc(docRef, {
                        bandScore: combinedBand,
                        aiFeedback: aiFeedbackMarkdown,
                        aiFeedbackRaw: JSON.stringify({
                            part1: taskNum === 1 ? data : report1,
                            part2: taskNum === 2 ? data : report2
                        }),
                        requiresEvaluation: false
                    });
                } catch (e) {
                    console.error("Failed to update submission with AI feedback", e);
                }
            }
        } catch (error: any) {
            console.error(error);
            if (taskNum === 1) {
                setError1(error.message || "There was a problem contacting the AI Examiner. Please try clicking the button again.");
                setLoadingReport1(false);
            } else {
                setError2(error.message || "There was a problem contacting the AI Examiner. Please try clicking the button again.");
                setLoadingReport2(false);
            }
        }
    };

    const downloadPDF = async () => {
        setIsGeneratingPdf(true);
        // Add class to body dynamically like HTML script did
        document.body.classList.add('pdf-generating');
        
        try {
            // Give the browser a moment to apply the print styles, then trigger print
            setTimeout(() => {
                window.print();
                document.body.classList.remove('pdf-generating');
                setIsGeneratingPdf(false);
            }, 500);
        } catch (err) {
            console.error("PDF generation error: ", err);
            alert("An error occurred while generating the PDF.");
            document.body.classList.remove('pdf-generating');
            setIsGeneratingPdf(false);
        }
    };

    const renderReport = (taskNum: number, data: any) => {
        if (!data || !data.scores || !data.feedback) return null;
        
        const taLabel = taskNum === 1 ? "Task Achievement" : "Task Response";
        const overallScore = parseFloat(data.scores.overallBand) || 0;
        const taScore = parseFloat(data.scores.taskAchievement) || 0;
        const ccScore = parseFloat(data.scores.coherenceCohesion) || 0;
        const lrScore = parseFloat(data.scores.lexicalResource) || 0;
        const grScore = parseFloat(data.scores.grammaticalRange) || 0;

        return (
            <div className="ai-report bg-white rounded-xl shadow-2xl mt-8 overflow-hidden border border-gray-200" style={{ width: '190mm', maxWidth: '190mm', margin: '0 auto', pageBreakAfter: 'always' }}>
                <div className="bg-indigo-900 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Official Examiner Report</h2>
                        <p className="text-indigo-200 text-sm mt-1 flex items-center gap-4">
                            Writing Task {taskNum} Evaluation
                            {isAdmin && (
                                <button 
                                    onClick={() => {
                                        if (taskNum === 1) {
                                            setEditedReport1Str(JSON.stringify(data, null, 2));
                                            setIsEditingReport1(true);
                                        } else {
                                            setEditedReport2Str(JSON.stringify(data, null, 2));
                                            setIsEditingReport2(true);
                                        }
                                    }}
                                    className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded"
                                >
                                    Edit (JSON)
                                </button>
                            )}
                        </p>
                    </div>
                    <div className="bg-yellow-400 text-indigo-900 rounded-full h-20 w-20 flex flex-col items-center justify-center font-bold shadow-lg border-4 border-indigo-800">
                        <span className="text-xs uppercase tracking-wider mb-[-4px]">Band</span>
                        <span className="text-3xl">{overallScore.toFixed(1)}</span>
                    </div>
                </div>

                {(taskNum === 1 && isEditingReport1) || (taskNum === 2 && isEditingReport2) ? (
                    <div className="p-8">
                        <textarea 
                            value={taskNum === 1 ? editedReport1Str : editedReport2Str}
                            onChange={e => taskNum === 1 ? setEditedReport1Str(e.target.value) : setEditedReport2Str(e.target.value)}
                            className="w-full h-[500px] font-mono text-xs p-4 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button 
                                onClick={() => taskNum === 1 ? setIsEditingReport1(false) : setIsEditingReport2(false)}
                                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleSaveEditedReport(taskNum)}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition shadow-md"
                            >
                                Save JSON
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-8">
                        <div className="mb-10">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">1. Estimated Band Scores</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg border text-center">
                                <div className="text-sm text-gray-500 font-semibold mb-1">{taLabel}</div>
                                <div className="text-2xl font-bold text-indigo-600">{taScore.toFixed(1)}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border text-center">
                                <div className="text-sm text-gray-500 font-semibold mb-1">Coherence & Cohesion</div>
                                <div className="text-2xl font-bold text-indigo-600">{ccScore.toFixed(1)}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border text-center">
                                <div className="text-sm text-gray-500 font-semibold mb-1">Lexical Resource</div>
                                <div className="text-2xl font-bold text-indigo-600">{lrScore.toFixed(1)}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border text-center">
                                <div className="text-sm text-gray-500 font-semibold mb-1">Grammar & Accuracy</div>
                                <div className="text-2xl font-bold text-indigo-600">{grScore.toFixed(1)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">2. Detailed Examiner Feedback</h3>
                        <div className="space-y-4">
                            <div className="bg-blue-50/50 p-4 rounded border border-blue-100">
                                <h4 className="font-bold text-blue-900 mb-1">{taLabel}</h4>
                                <p className="text-sm text-gray-700 leading-relaxed">{data.feedback.taskAchievement}</p>
                            </div>
                            <div className="bg-purple-50/50 p-4 rounded border border-purple-100">
                                <h4 className="font-bold text-purple-900 mb-1">Coherence & Cohesion</h4>
                                <p className="text-sm text-gray-700 leading-relaxed">{data.feedback.coherenceCohesion}</p>
                            </div>
                            <div className="bg-green-50/50 p-4 rounded border border-green-100">
                                <h4 className="font-bold text-green-900 mb-1">Lexical Resource</h4>
                                <p className="text-sm text-gray-700 leading-relaxed">{data.feedback.lexicalResource}</p>
                            </div>
                            <div className="bg-orange-50/50 p-4 rounded border border-orange-100">
                                <h4 className="font-bold text-orange-900 mb-1">Grammatical Range & Accuracy</h4>
                                <p className="text-sm text-gray-700 leading-relaxed">{data.feedback.grammaticalRange}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">3. Error Marking</h3>
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-base leading-loose font-serif shadow-inner whitespace-pre-wrap mb-6" dangerouslySetInnerHTML={{ __html: data.inlineMarkedEssay }} />
                        <p className="text-xs text-gray-500 mt-2 mb-4"><span className="line-through text-red-500">Red text</span> indicates errors. <span className="text-green-600 font-bold">Green text</span> indicates corrections.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">4. Final Corrected Answer</h3>
                        <div className="bg-indigo-50 text-gray-900 p-6 rounded-lg shadow-inner font-serif text-base leading-loose whitespace-pre-wrap border border-indigo-100">
                            {data.finalCorrectedAnswer}
                        </div>
                    </div>
                </div>
                )}
            </div>
        );
    };

    const renderSheet = (taskNum: number, text: string, report: any, loadingReport: boolean, errorText: string) => {
        const name = candidateName || 'CANDIDATE';
        const candNo = Math.floor(100000 + Math.random() * 900000).toString();
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = String(today.getFullYear());
        const redBarText = `Writing Task ${taskNum} \u00A0 \u00A0 \u00A0 `.repeat(10);
        
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
                    
                    <div className="sheet-text-area text-[#000080] font-serif px-2" style={{ flexGrow: 1, backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #94a3b8 31px, #94a3b8 32px)', lineHeight: '32px', fontSize: '18px', paddingTop: '5px', minHeight: '700px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {text}
                    </div>
                    
                    <div className="mt-6 border-t-2 border-[#ff3333] pt-2 text-center text-xs text-gray-600">
                        Word count: {wordCount(text)} words
                    </div>
                </div>

                {!report && !loadingReport && isAdmin && (
                    <div className="w-full flex justify-center mt-8 print-hidden">
                        <button onClick={() => getAIFeedback(taskNum)} className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-indigo-800 transition-all transform hover:-translate-y-1 flex items-center space-x-3 cursor-pointer border border-indigo-400/30">
                            <svg className="w-6 h-6 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            <span className="text-lg tracking-wide">Generate Official Report &mdash; Task {taskNum}</span>
                        </button>
                    </div>
                )}

                {loadingReport && (
                    <div className="bg-white rounded-lg shadow-lg p-10 mt-6 flex flex-col items-center justify-center text-center border border-indigo-100 w-full">
                        <div className="border-4 border-gray-100 border-t-blue-500 rounded-full w-10 h-10 animate-spin mb-4"></div>
                        <h3 className="text-xl font-bold text-gray-800">The Examiner is reviewing your essay...</h3>
                        <p className="text-gray-500 mt-2">Analyzing grammar, vocabulary, task achievement, and cohesion. This takes about 10-15 seconds.</p>
                    </div>
                )}

                {errorText && (
                    <div className="bg-red-50 text-red-600 p-6 rounded-lg mt-6 border border-red-200 shadow w-full">
                        <h3 className="font-bold text-lg mb-2">Error Generating Report</h3>
                        <p>{errorText}</p>
                    </div>
                )}

                {report && renderReport(taskNum, report)}
            </div>
        );
    };

    return (
        <div className="h-screen flex flex-col font-sans bg-[#dbe2e9] overflow-hidden">
            <style>{`
                .header-bg { background: linear-gradient(to bottom, #4a5568, #2d3748); }
                .bottom-bar { background: linear-gradient(to bottom, #e2e8f0, #cbd5e1); }
                .btn-header { background: linear-gradient(to bottom, #f7fafc, #e2e8f0); border: 1px solid #a0aec0; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
                .btn-header:active { background: #cbd5e1; }
                .tab-btn { background: #fff; border: 1px solid #cbd5e1; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
                .tab-btn.active { background-color: #3b82f6; color: white; border-color: #2563eb; }
                textarea { outline: none; resize: none; font-size: 14px; line-height: 1.5; font-family: 'Arial', sans-serif; }
                textarea:focus { border-color: #94a3b8; }
                textarea::-webkit-scrollbar { width: 16px; }
                textarea::-webkit-scrollbar-track { background: #f1f5f9; border-left: 1px solid #e2e8f0; }
                textarea::-webkit-scrollbar-thumb { background: #cbd5e1; border: 1px solid #94a3b8; border-radius: 8px; background-clip: padding-box; }
                .ielts-table th, .ielts-table td { border: 1px solid #a0aec0; padding: 8px 12px; text-align: center; }
                .ielts-table th { background-color: #f1f5f9; font-weight: bold; }
                
                .pdf-generating .print-hidden { display: none !important; }
                .pdf-generating #result-overlay { background: white !important; padding: 0 !important; overflow: visible !important; position: static !important; }
                .pdf-generating #result-sheets-container { display: block !important; width: 190mm !important; max-width: 190mm !important; padding: 0 !important; margin: 0 auto !important; }
                .pdf-generating .answer-sheet { width: 190mm !important; max-width: 190mm !important; min-height: 277mm !important; margin: 0 auto !important; box-shadow: none !important; border: 1px solid #cbd5e1 !important; page-break-after: always; }
                .pdf-generating .ai-report { width: 190mm !important; max-width: 190mm !important; margin: 0 auto !important; box-shadow: none !important; border: 1px solid #cbd5e1 !important; page-break-after: always; }
            `}</style>

            {!examStarted && !isSubmitted && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-sm shadow-xl p-6 w-[400px] max-w-full m-4">
                        <div className="flex items-center justify-between mb-4 border-b pb-2 border-gray-200">
                            <h2 className="text-lg font-bold text-gray-800">Candidate Details</h2>
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <p className="text-sm text-gray-600 mb-5">Please enter your details to begin the writing test.</p>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                            <input type="text" value={candidateName} onChange={e => setCandidateName(e.target.value.toUpperCase())} className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g., JOHN DOE" />
                        </div>
                        <div className="flex justify-end">
                            <button onClick={startTest} className="bg-[#3b82f6] text-white font-bold py-2 px-6 rounded-sm border border-[#2563eb] shadow-sm hover:bg-blue-600 focus:outline-none active:bg-blue-700 transition-colors cursor-pointer">Start Test</button>
                        </div>
                    </div>
                </div>
            )}

            {isSubmitted && (
                <div id="result-overlay" className="fixed inset-0 bg-[#cbd5e1] z-[60] overflow-y-auto p-4 md:p-8">
                    <div className="print-hidden max-w-5xl mx-auto w-full flex justify-between items-center mb-6 sticky top-0 bg-white/90 backdrop-blur py-3 px-6 rounded shadow z-10 border border-gray-300">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Your Answer Sheets</h2>
                            <p className="text-sm text-gray-600">Test submitted successfully. Get detailed AI feedback below.</p>
                        </div>
                        <div className="space-x-4 flex">
                            <button onClick={() => navigate('/ielts/dashboard')} className="bg-gray-600 text-white px-5 py-2 rounded font-bold shadow hover:bg-gray-700 flex items-center space-x-2 cursor-pointer">
                                <span>Dashboard</span>
                            </button>
                            <button onClick={downloadPDF} disabled={isGeneratingPdf} className="bg-blue-600 text-white px-5 py-2 rounded font-bold shadow hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer">
                                {isGeneratingPdf ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        <span>Download PDF</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div id="result-sheets-container" ref={sheetsContainerRef} className="flex flex-col items-center pb-20 space-y-12">
                        {renderSheet(1, text1, report1, loadingReport1, error1)}
                        {renderSheet(2, text2, report2, loadingReport2, error2)}
                    </div>
                </div>
            )}

            <header className="header-bg text-white h-12 flex items-center justify-between px-4 text-sm shrink-0 shadow-md z-10 relative">
                <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                    <span className="font-semibold tracking-wide">{candidateName || 'CANDIDATE'}</span>
                </div>
                <div className="flex items-center space-x-2 absolute left-1/2 transform -translate-x-1/2">
                    <svg className="w-5 h-5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="font-bold text-base">{formatTime(timeLeft)}</span>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="bg-white border border-gray-300 flex-1 flex flex-col rounded shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 shrink-0">
                        <h1 className="text-xl font-bold text-gray-900 mb-2">Part {currentPart}</h1>
                        <p className="text-sm text-gray-600">
                            You should spend about {currentPart === 1 ? '20' : '40'} minutes on this task. Write at least {currentPart === 1 ? '150' : '250'} words.
                        </p>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                        <div className="flex-1 p-6 overflow-y-auto md:border-r border-b md:border-b-0 border-gray-200">
                            {currentPart === 1 ? (
                                <div>
                                    <p className="text-sm text-gray-900 mb-6 leading-relaxed">
                                        <span className="font-bold">Task 1:</span> The diagrams below show two cutting tools made from stone. They are from an early period and a later period of human history. The tools were made by breaking off small pieces of stone. Summarize the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.
                                    </p>
                                    <div className="mt-8 flex flex-col items-center">
                                        <img src="https://drive.google.com/thumbnail?id=1J_-AGW72eucImYOtCb0fAW5JJ5xUsCIt&sz=w1000" alt="Diagram showing two stone cutting tools from early and later periods of human history" className="w-full max-w-lg h-auto shadow-sm border border-gray-200" />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm text-gray-700 mb-4">Write about the following topic:</p>
                                    <p className="text-sm font-bold text-gray-900 mb-4">
                                        In some parts of the world it is becoming popular to research the history of one's own family.
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 mb-6">
                                        Why might people want to do this?<br/>
                                        Is it a positive or negative development?
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        Give reasons for your answer and include any relevant examples from your own knowledge or experience.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 p-4 flex flex-col bg-gray-50/50">
                            {currentPart === 1 ? (
                                <textarea 
                                    className="flex-1 w-full border border-gray-300 p-3 shadow-inner rounded-sm" 
                                    placeholder="Start typing your Task 1 response here..."
                                    value={text1}
                                    onChange={e => setText1(e.target.value)}
                                    autoFocus
                                />
                            ) : (
                                <textarea 
                                    className="flex-1 w-full border border-gray-300 p-3 shadow-inner rounded-sm" 
                                    placeholder="Start typing your Task 2 response here..."
                                    value={text2}
                                    onChange={e => setText2(e.target.value)}
                                    autoFocus
                                />
                            )}
                            <div className="mt-2 text-xs text-gray-600 font-medium">
                                Word count: <span>{wordCount(currentPart === 1 ? text1 : text2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bottom-bar h-12 border-t border-gray-300 flex items-center justify-between px-4 shrink-0 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
                <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                        <span className="text-sm font-semibold text-gray-700">Review</span>
                    </label>
                    
                    <div className="flex items-center space-x-1">
                        <span className="text-sm font-bold text-gray-800 mr-2">Part 1</span>
                        <button onClick={() => setCurrentPart(1)} className={`tab-btn w-6 h-6 flex items-center justify-center rounded text-sm font-bold cursor-pointer transition-colors ${currentPart === 1 ? 'active' : 'bg-gray-800 text-white'}`}>1</button>
                        <span className="text-sm font-bold text-gray-800 mx-2 ml-4">Part 2</span>
                        <button onClick={() => setCurrentPart(2)} className={`tab-btn w-6 h-6 flex items-center justify-center rounded text-sm font-bold cursor-pointer transition-colors ${currentPart === 2 ? 'active' : 'bg-gray-800 text-white'}`}>2</button>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button onClick={handleSubmit} title="Submit Test" className="w-auto px-4 h-8 bg-[#1e293b] text-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-700 cursor-pointer transition-colors text-sm font-bold">
                        Submit Test & Get Feedback <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>
                </div>
            </footer>
        </div>
    );
};
