import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Submission, Assignment } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { FileText, ArrowLeft, CheckCircle2, XCircle, Languages } from 'lucide-react';
import { renderMarkdown } from '../lib/markdown';
import { ANSWER_KEY } from './ComputerReadingTest';
import { LISTENING_ANSWER_KEY } from './ComputerListeningTest';
import { ComputerReadingTest } from './ComputerReadingTest';
import { ComputerListeningTest } from './ComputerListeningTest';
import { FebruaryListeningTest } from './FebruaryListeningTest';
import { MarchListeningTest } from './MarchListeningTest';
import { AprilListeningTest } from './AprilListeningTest';
import { MayListeningTest } from './MayListeningTest';
import { ComputerWritingTest } from './ComputerWritingTest';
import { JanuaryWritingTest } from './JanuaryWritingTest';
import { FebruaryWritingTest } from './FebruaryWritingTest';
import { MarchWritingTest } from './MarchWritingTest';
import { getReadingTestData } from '../data/readingTestData';
import { SpeakingTestResult } from './SpeakingTestResult';

export function TestResult({ isShared = false }: { isShared?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editedComment, setEditedComment] = useState("");
  const [editedBandScore, setEditedBandScore] = useState<number | "">("");
  const [editedCommentVi, setEditedCommentVi] = useState("");
  const [showVi, setShowVi] = useState(false);

  const handleSaveComment = async () => {
    if (!id || !submission) return;
    try {
      const updateData: any = {};
      updateData.teacherComment = editedComment || "";
      updateData.teacherCommentVi = editedCommentVi || "";
      if (editedBandScore === "") {
          updateData.bandScore = null;
      } else {
          updateData.bandScore = Number(editedBandScore);
      }
      await updateDoc(doc(db, 'submissions', id), updateData);
      setSubmission({
        ...submission,
        teacherComment: editedComment,
        teacherCommentVi: editedCommentVi,
        bandScore: editedBandScore === "" ? undefined : Number(editedBandScore)
      });
      setIsEditingComment(false);
    } catch (err) {
      console.error("Error saving comment", err);
      alert("Failed to save: " + (err.message || err));
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      if (!isShared && !user) return;
      try {
        const subDoc = await getDoc(doc(db, 'submissions', id));
        if (subDoc.exists()) {
            const data = subDoc.data();
            const subData = { 
                id: subDoc.id, 
                ...data,
                createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (typeof data.createdAt === 'number' ? data.createdAt : Date.now())
            } as Submission;
            setSubmission(subData);
            
            if (subData.assignmentId) {
                const assignDoc = await getDoc(doc(db, 'assignments', subData.assignmentId));
                if (assignDoc.exists()) {
                    setAssignment({ id: assignDoc.id, ...assignDoc.data() } as Assignment);
                }
            }
        }
      } catch (err) {
        console.error("Error fetching result", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, user]);

  if (loading) {
    return <div className="p-10 text-center animate-pulse">Loading result...</div>;
  }

  if (!submission) {
    return <div className="p-10 text-center">Result not found.</div>;
  }

  const title = submission.assignmentTitle || assignment?.title || 'Test Submission';
  const rawType = submission.assignmentType || assignment?.type || 'unknown';
  let type = rawType.toLowerCase();
  if (type === 'unknown' && submission.assignmentTitle) {
      if (submission.assignmentTitle.toLowerCase().includes('reading')) type = 'reading';
      if (submission.assignmentTitle.toLowerCase().includes('listening')) type = 'listening';
      if (submission.assignmentTitle.toLowerCase().includes('speaking')) type = 'speaking';
  }

  if (type === 'reading') {
      let assignmentId = submission.assignmentId;
      if (!assignmentId && submission.assignmentTitle) {
          if (submission.assignmentTitle.toLowerCase().includes('january')) assignmentId = '1';
          else if (submission.assignmentTitle.toLowerCase().includes('february')) assignmentId = '4';
      }
      return <ComputerReadingTest submissionId={id} assignmentId={assignmentId} />;
  }

  if (type === 'listening') {
      if (submission.assignmentTitle?.toLowerCase().includes('february')) {
          return <FebruaryListeningTest submissionId={id} />;
      }
      return <ComputerListeningTest submissionId={id} />;
  }

  if (type === 'speaking' && !submission.assignmentId?.startsWith('offline_') && submission.sessionId) {
      return (
        <div className="max-w-4xl mx-auto py-10 space-y-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-start">
                 <div>
                     <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">SPEAKING</div>
                     <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
                     <p className="text-slate-600">Completed on {submission.createdAt ? format(submission.createdAt.toDate ? submission.createdAt.toDate() : new Date(submission.createdAt), 'MMMM d, yyyy h:mm a') : 'Unknown Date'}</p>
                 </div>
             </div>
          </div>
          <SpeakingTestResult submissionId={submission.id} sessionId={submission.sessionId} />
        </div>
      );
  }

  if (type === 'writing') {
      if (submission.assignmentTitle?.toLowerCase().includes('january')) {
          return <JanuaryWritingTest submissionId={id} />;
      }
      if (submission.assignmentTitle?.toLowerCase().includes('february')) {
          return <FebruaryWritingTest submissionId={id} />;
      }
      if (submission.assignmentTitle?.toLowerCase().includes('march')) {
          return <MarchWritingTest submissionId={id} />;
      }
      return <ComputerWritingTest submissionId={id} />;
  }

  
  let parsedAnswers: Record<string, string> = {};
  if (typeof submission.answers === 'string') {
     try {
       parsedAnswers = JSON.parse(submission.answers);
     } catch (e) {}
  } else {
     parsedAnswers = submission.answers as Record<string, string>;
  }

  let readingScoreCalc = 0;
  let hasCalculatedStats = false;
  let bandScoreCalc = 0;
  let percentageCalc = 0;

  if (type === 'reading' || type === 'listening') {
      let activeAnswerKey: any;
      if (type === 'reading') {
          const testData = getReadingTestData(submission?.assignmentId || submission?.id);
          activeAnswerKey = testData ? testData.answers : ANSWER_KEY;
      } else {
          activeAnswerKey = LISTENING_ANSWER_KEY;
      }
      
      readingScoreCalc = Array.from({ length: 40 }, (_, i) => i + 1).filter(qNum => {
          let userAns = (parsedAnswers[qNum] || '').toString().trim().replace(/\s+/g, ' ').toUpperCase();
          const correctAnsData = activeAnswerKey[qNum];
          if (!correctAnsData) return false;

          if (userAns === 'T') userAns = 'TRUE';
          if (userAns === 'F') userAns = 'FALSE';
          if (userAns === 'NG' || userAns === 'N') userAns = 'NOT GIVEN';
          if (userAns === 'Y') userAns = 'YES';
          if (userAns === 'N' && String(correctAnsData).includes('NO')) userAns = 'NO';

          const correctAnswers = String(correctAnsData).toUpperCase().split(/\s*OR\s*|\s*\/\s*/);
          for (let correctAns of correctAnswers) {
            correctAns = correctAns.trim();
            if (userAns === correctAns) return true;
            if (userAns.startsWith(correctAns + " ") || userAns.startsWith(correctAns + ".")) return true;
            const cleanUser = userAns.replace(/[^A-Z0-9]/g, '');
            const cleanAns = correctAns.replace(/[^A-Z0-9]/g, '');
            if (cleanUser === cleanAns && cleanAns.length > 0) return true;
          }
          return false;
      }).length;
      
      let bandScore = 0;
      if (type === 'reading') {
          if (readingScoreCalc >= 39) bandScore = 9.0;
          else if (readingScoreCalc >= 37) bandScore = 8.5;
          else if (readingScoreCalc >= 35) bandScore = 8.0;
          else if (readingScoreCalc >= 33) bandScore = 7.5;
          else if (readingScoreCalc >= 30) bandScore = 7.0;
          else if (readingScoreCalc >= 27) bandScore = 6.5;
          else if (readingScoreCalc >= 23) bandScore = 6.0;
          else if (readingScoreCalc >= 19) bandScore = 5.5;
          else if (readingScoreCalc >= 15) bandScore = 5.0;
          else if (readingScoreCalc >= 13) bandScore = 4.5;
          else if (readingScoreCalc >= 10) bandScore = 4.0;
          else if (readingScoreCalc >= 8) bandScore = 3.5;
          else if (readingScoreCalc >= 6) bandScore = 3.0;
          else if (readingScoreCalc >= 4) bandScore = 2.5;
          else if (readingScoreCalc >= 2) bandScore = 2.0;
      } else {
          if (readingScoreCalc >= 39) bandScore = 9.0;
          else if (readingScoreCalc >= 37) bandScore = 8.5;
          else if (readingScoreCalc >= 35) bandScore = 8.0;
          else if (readingScoreCalc >= 32) bandScore = 7.5;
          else if (readingScoreCalc >= 30) bandScore = 7.0;
          else if (readingScoreCalc >= 26) bandScore = 6.5;
          else if (readingScoreCalc >= 23) bandScore = 6.0;
          else if (readingScoreCalc >= 18) bandScore = 5.5;
          else if (readingScoreCalc >= 16) bandScore = 5.0;
          else if (readingScoreCalc >= 13) bandScore = 4.5;
          else if (readingScoreCalc >= 11) bandScore = 4.0;
          else if (readingScoreCalc >= 8) bandScore = 3.5;
          else if (readingScoreCalc >= 6) bandScore = 3.0;
          else if (readingScoreCalc >= 4) bandScore = 2.5;
          else if (readingScoreCalc >= 2) bandScore = 2.0;
      }

      bandScoreCalc = bandScore;
      percentageCalc = (readingScoreCalc / 40) * 100;
      hasCalculatedStats = true;
  }

  const finalBandScore = (hasCalculatedStats && (submission.bandScore === undefined || submission.bandScore === null)) ? bandScoreCalc : submission.bandScore;
  const finalPercentage = (hasCalculatedStats && (submission.percentage === undefined || submission.percentage === null)) ? percentageCalc : submission.percentage;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>
      
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
         <div className="flex justify-between items-start mb-6">
             <div>
                 <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{type}</div>
                 <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
                 <p className="text-slate-600">Completed on {submission.createdAt ? format(submission.createdAt.toDate ? submission.createdAt.toDate() : new Date(submission.createdAt), 'MMMM d, yyyy h:mm a') : 'Unknown Date'}</p>
             </div>
             <div className="text-right">
                 <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Band Score</div>
                 <div className="text-4xl font-bold text-[#1E4DB7]">{finalBandScore !== undefined && finalBandScore !== null ? finalBandScore.toFixed(1) : 'Pending'}</div>
             </div>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
             <div>
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Time Spent</div>
                 <div className="text-lg font-bold text-slate-900">{submission.timeSpent ? `${Math.floor(submission.timeSpent / 60)}m ${submission.timeSpent % 60}s` : 'N/A'}</div>
             </div>
             <div>
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Correct Answers</div>
                 <div className="text-lg font-bold text-slate-900">{finalPercentage !== undefined && finalPercentage !== null ? `${Math.round((finalPercentage / 100) * 40)} / 40` : 'N/A'}</div>
             </div>
             <div>
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Accuracy</div>
                 <div className="text-lg font-bold text-slate-900">{finalPercentage !== undefined && finalPercentage !== null ? `${finalPercentage.toFixed(0)}%` : 'N/A'}</div>
             </div>
         </div>
      </div>

      {submission.audioUrl && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-between">
                Audio Recording
                <a href={submission.audioUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#1E4DB7] hover:underline">Open in new tab</a>
              </h2>
              <audio src={submission.audioUrl} controls className="w-full h-12" />
          </div>
      )}
      
      {submission.fileUrl && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-between">
                Submission Document
                <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#1E4DB7] hover:underline">Open in new tab</a>
              </h2>
              <iframe src={submission.fileUrl} className="w-full h-[600px] border-0 rounded-xl" />
          </div>
      )}

      {(submission.teacherComment || submission.aiFeedback || isAdmin) && (
          <div className="bg-white p-8 rounded-3xl border border-blue-200 shadow-sm bg-blue-50/30 mb-8">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600"/> 
                      Feedback & Comments
                      {!isEditingComment && submission.teacherCommentVi && (
                          <button
                              onClick={() => setShowVi(!showVi)}
                              className="ml-4 flex items-center gap-1.5 px-3 py-1.5 bg-blue-100/50 hover:bg-blue-100 text-blue-700 text-sm font-bold rounded-lg transition-colors border border-blue-200/50"
                          >
                              <Languages className="w-4 h-4" />
                              {showVi ? 'Show Original' : 'View in Vietnamese'}
                          </button>
                      )}
                  </h2>
                  {isAdmin && !isEditingComment && (
                      <button 
                          onClick={() => {
                              setEditedComment(submission.teacherComment || "");
                              setEditedCommentVi(submission.teacherCommentVi || "");
                              setEditedBandScore(submission.bandScore ?? "");
                              setIsEditingComment(true);
                          }}
                          className="px-4 py-2 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-xl font-medium text-sm transition-colors"
                      >
                          Edit Feedback
                      </button>
                  )}
              </div>
              
              {isEditingComment ? (
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Band Score (Optional)</label>
                          <input 
                              type="number" step="0.5" min="0" max="9"
                              value={editedBandScore}
                              onChange={e => setEditedBandScore(e.target.value)}
                              className="w-32 px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Teacher Comment</label>
                          <textarea 
                              value={editedComment}
                              onChange={e => setEditedComment(e.target.value)}
                              className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                              placeholder="Write your feedback here..."
                          />
                          <label className="block text-sm font-bold text-slate-700 mb-2">Teacher Comment (Vietnamese Translation)</label>
                          <textarea 
                              value={editedCommentVi}
                              onChange={e => setEditedCommentVi(e.target.value)}
                              className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Thêm bản dịch phản hồi tại đây..."
                          />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                          <button 
                              onClick={() => setIsEditingComment(false)}
                              className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={handleSaveComment}
                              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-md"
                          >
                              Save Feedback
                          </button>
                      </div>
                  </div>
              ) : (
                  <>
                      {submission.teacherComment && (
                          <div className="mb-6">
                              <h3 className="font-bold text-slate-800 mb-2">Teacher Comment {showVi && submission.teacherCommentVi && "(Vietnamese)"}</h3>
                              <p className="text-slate-700 p-4 bg-white rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed">
                                {(showVi && submission.teacherCommentVi) ? submission.teacherCommentVi.replace(/(?<!^)\s*(?=[1-9]\.\s+[A-Z])/g, '\n\n') : submission.teacherComment.replace(/(?<!^)\s*(?=[1-9]\.\s+[A-Z])/g, '\n\n')}
                              </p>
                          </div>
                      )}
                      {submission.aiFeedback && (
                          <div>
                              <h3 className="font-bold text-slate-800 mb-2">AI Analysis</h3>
                              <div className="p-6 bg-white rounded-xl border border-slate-200" dangerouslySetInnerHTML={renderMarkdown(submission.aiFeedback)}></div>
                          </div>
                      )}
                      {!submission.teacherComment && !submission.aiFeedback && isAdmin && (
                          <div className="text-slate-500 italic">No feedback added yet.</div>
                      )}
                  </>
              )}
          </div>
      )}

      {/* Raw answers breakdown */}
      {(Object.keys(parsedAnswers).length > 0 || type === 'reading' || type === 'listening') && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Your Answers</h2>
              
              {type === 'writing' ? (
                  <div className="space-y-8">
                      {parsedAnswers.part1 && (
                          <div className="space-y-3">
                              <h3 className="font-bold text-lg text-slate-800 border-b pb-2">Part 1</h3>
                              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 whitespace-pre-wrap leading-relaxed shadow-sm">
                                  {parsedAnswers.part1}
                              </div>
                              <div className="text-sm font-medium text-slate-500">
                                  Word Count: {parsedAnswers.part1.trim() === "" ? 0 : parsedAnswers.part1.trim().split(/\s+/).filter(w => w.length > 0).length}
                              </div>
                          </div>
                      )}
                      
                      {parsedAnswers.part2 && (
                          <div className="space-y-3">
                              <h3 className="font-bold text-lg text-slate-800 border-b pb-2">Part 2</h3>
                              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 whitespace-pre-wrap leading-relaxed shadow-sm">
                                  {parsedAnswers.part2}
                              </div>
                              <div className="text-sm font-medium text-slate-500">
                                  Word Count: {parsedAnswers.part2.trim() === "" ? 0 : parsedAnswers.part2.trim().split(/\s+/).filter(w => w.length > 0).length}
                              </div>
                          </div>
                      )}
                  </div>
              ) : (type === 'reading' || type === 'listening') ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 flex-wrap gap-4">
                      {Array.from({ length: 40 }, (_, i) => i + 1).map((qNum) => {
                          let activeAnswerKey: any;
                          if (type === 'reading') {
                              const testData = getReadingTestData(submission.assignmentId);
                              activeAnswerKey = testData ? testData.answers : ANSWER_KEY;
                          } else {
                              activeAnswerKey = LISTENING_ANSWER_KEY;
                          }
                          
                          let userAns = (parsedAnswers[qNum] || '').toString().trim().replace(/\s+/g, ' ').toUpperCase();
                          const correctAnsData = activeAnswerKey[qNum];
                          let isCorrect = false;
                          
                          if (correctAnsData) {
                              if (userAns === 'T') userAns = 'TRUE';
                              if (userAns === 'F') userAns = 'FALSE';
                              if (userAns === 'NG' || userAns === 'N') userAns = 'NOT GIVEN';
                              if (userAns === 'Y') userAns = 'YES';
                              if (userAns === 'N' && String(correctAnsData).includes('NO')) userAns = 'NO';
                              const correctAnswers = String(correctAnsData).toUpperCase().split(/\s*OR\s*|\s*\/\s*/);
                              
                              for (let correctAns of correctAnswers) {
                                correctAns = correctAns.trim();
                                if (userAns === correctAns || userAns.startsWith(correctAns + " ") || userAns.startsWith(correctAns + ".")) {
                                    isCorrect = true;
                                    break;
                                }
                                const cleanUser = userAns.replace(/[^A-Z0-9]/g, '');
                                const cleanAns = correctAns.replace(/[^A-Z0-9]/g, '');
                                if (cleanUser === cleanAns && cleanAns.length > 0) {
                                    isCorrect = true;
                                    break;
                                }
                              }
                          }

                          return (
                              <div key={qNum} className={`flex flex-col gap-2 p-4 border rounded-xl shadow-sm ${isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                                  <div className="flex items-center justify-between">
                                      <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center shrink-0 ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{qNum}</div>
                                      {isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-600"/> : <XCircle className="w-5 h-5 text-red-600"/>}
                                  </div>
                                  <div>
                                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 mt-2">Your Answer</div>
                                      <div className={`font-bold ${isCorrect ? 'text-green-900' : 'text-red-900 line-through opacity-80'}`}>{userAns || '-'}</div>
                                  </div>
                                  {!isCorrect && (
                                    <div className="mt-2 pt-2 border-t border-red-200">
                                        <div className="text-xs font-bold text-green-700 uppercase tracking-widest mb-1">Correct Answer</div>
                                        <div className="font-bold text-green-900">{correctAnsData}</div>
                                    </div>
                                  )}
                              </div>
                          );
                      })}
                  </div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 flex-wrap gap-4">
                      {Object.entries(parsedAnswers).map(([q, ans]) => (
                          <div key={q} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                              <div className="w-8 h-8 rounded bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0">{q}</div>
                              <div className="font-medium text-slate-900">{typeof ans === 'string' ? ans : '-'}</div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}
    </div>
  );
}
