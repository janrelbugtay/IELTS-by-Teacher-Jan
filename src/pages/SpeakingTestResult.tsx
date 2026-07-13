import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Play, Pause, FileText, CheckCircle, Video, Edit2, Check, Languages } from 'lucide-react';
import { format } from 'date-fns';
import { renderMarkdown } from '../lib/markdown';
import { useAuth } from '../contexts/AuthContext';

function getEmbedUrl(url: string) {
  if (typeof url !== 'string') return url;
  if (!url) return url;
  if (url.includes('drive.google.com')) {
    return url.replace(/\/view.*$/, '/preview');
  }
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }
  if (url.includes('youtu.be/')) {
    return url.replace('youtu.be/', 'youtube.com/embed/');
  }
  return url;
}

export function SpeakingTestResult({ submissionId, sessionId }: { submissionId: string; sessionId?: string }) {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editedComment, setEditedComment] = useState("");
  const [editedCommentVi, setEditedCommentVi] = useState("");
  const [showVi, setShowVi] = useState(false);
  const [savingComment, setSavingComment] = useState(false);

  const handleSaveComment = async () => {
      if (!submissionId) return;
      try {
          setSavingComment(true);
          await updateDoc(doc(db, 'submissions', submissionId), {
              teacherComment: editedComment,
              teacherCommentVi: editedCommentVi
          });
          setSubmissionData((prev: any) => ({ ...prev, teacherComment: editedComment, teacherCommentVi: editedCommentVi }));
          setIsEditingComment(false);
      } catch (err) {
          console.error("Error saving comment", err);
          alert("Failed to save feedback");
      } finally {
          setSavingComment(false);
      }
  };

  useEffect(() => {
    async function fetchRecordings() {
      try {
        let docs = [];
        if (sessionId) {
          const q = query(
            collection(db, 'submissions'),
            where('sessionId', '==', sessionId),
            where('audioData', '!=', null)
          );
          const snapshot = await getDocs(q);
          docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
          // Sort by part and questionIndex
          docs.sort((a, b) => {
            if (a.part !== b.part) return (a.part || 0) - (b.part || 0);
            return (a.questionIndex || 0) - (b.questionIndex || 0);
          });
          setRecordings(docs);
        }

        if (submissionId) {
          const subDoc = await getDoc(doc(db, 'submissions', submissionId));
          if (subDoc.exists()) {
            setSubmissionData(subDoc.data());
          }
        }
      } catch (err) {
        console.error("Error fetching speaking recordings", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecordings();
  }, [sessionId, submissionId]);

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading recordings...</div>;
  }

  const hasRecordings = recordings.length > 0;
  const hasDriveLink = submissionData && submissionData.audioUrl;

  if (!hasRecordings && !hasDriveLink) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">No Recordings Found</h2>
        <p className="text-slate-500">Audio recordings for this session are missing or could not be loaded.</p>
      </div>
    );
  }

  // Calculate overall score average
  let totalScore = 0;
  let scoreCount = 0;
  recordings.forEach(rec => {
    if (rec.aiFeedback?.bandScore) {
      totalScore += Number(rec.aiFeedback.bandScore);
      scoreCount++;
    }
  });
  const avgScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : null;

  return (
    <div className="space-y-8 mt-8">
      {avgScore && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="text-emerald-800 font-bold text-lg">AI Estimated Band Score</h3>
            <p className="text-emerald-600 text-sm">Based on {scoreCount} evaluated responses</p>
          </div>
          <div className="text-4xl font-black text-emerald-600">{avgScore}</div>
        </div>
      )}
      
      {hasDriveLink && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
           <div className="flex items-center gap-2 mb-4">
              <Video className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-900">Speaking Test Recording</h2>
           </div>
           <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
             <iframe 
               src={getEmbedUrl(submissionData.audioUrl)}
               className="w-full h-full"
               allow="autoplay; encrypted-media"
               allowFullScreen
               title="Speaking Recording"
             ></iframe>
           </div>
        </div>
      )}

      {submissionData && (submissionData.teacherComment || submissionData.teacherCommentVi || submissionData.aiFeedback || isAdmin) && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <h2 className="text-xl font-bold text-slate-900">Overall Feedback</h2>
                <div className="flex items-center gap-4">
                    {(submissionData.teacherCommentVi || isEditingComment) && (
                        <button onClick={() => setShowVi(!showVi)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showVi ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            <Languages className="w-4 h-4" /> {showVi ? 'Tiếng Việt' : 'English'}
                        </button>
                    )}
                    {isAdmin && !isEditingComment && (
                        <button onClick={() => { setIsEditingComment(true); setEditedComment(submissionData.teacherComment || ""); setEditedCommentVi(submissionData.teacherCommentVi || ""); }} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                            <Edit2 className="w-4 h-4" /> Edit Feedback
                        </button>
                    )}
                </div>
            </div>
            
            {isEditingComment ? (
                <div className="mb-6 space-y-4">
                    {showVi ? (
                        <>
                            <h3 className="font-bold text-[#1E4DB7] flex items-center gap-2"><FileText size={18}/> Teacher's Comment (Tiếng Việt)</h3>
                            <textarea
                                value={editedCommentVi}
                                onChange={(e) => setEditedCommentVi(e.target.value)}
                                className="w-full h-32 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Viết nhận xét bằng tiếng Việt... (Hỗ trợ Markdown)"
                            />
                        </>
                    ) : (
                        <>
                            <h3 className="font-bold text-[#1E4DB7] flex items-center gap-2"><FileText size={18}/> Teacher's Comment (English)</h3>
                            <textarea
                                value={editedComment}
                                onChange={(e) => setEditedComment(e.target.value)}
                                className="w-full h-32 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Write feedback here... (Markdown supported)"
                            />
                        </>
                    )}
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsEditingComment(false)} disabled={savingComment} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                        <button onClick={handleSaveComment} disabled={savingComment} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                            <Check className="w-4 h-4" /> {savingComment ? "Saving..." : "Save Feedback"}
                        </button>
                    </div>
                </div>
            ) : (submissionData.teacherComment || submissionData.teacherCommentVi) ? (
                <div className="mb-6">
                    <h3 className="font-bold text-[#1E4DB7] mb-2 flex items-center gap-2"><FileText size={18}/> Teacher's Comment {showVi ? '(Tiếng Việt)' : ''}</h3>
                    <div className="bg-blue-50 p-4 rounded-xl text-slate-700 border border-blue-100 leading-relaxed prose prose-slate max-w-none prose-sm" dangerouslySetInnerHTML={renderMarkdown(showVi ? (submissionData.teacherCommentVi || submissionData.teacherComment) : (submissionData.teacherComment || submissionData.teacherCommentVi))} />
                </div>
            ) : null}
            
            {submissionData.aiFeedback && (
                <div>
                    <h3 className="font-bold text-emerald-700 mb-2 flex items-center gap-2"><CheckCircle size={18}/> AI Evaluation</h3>
                    <div className="bg-emerald-50 p-4 rounded-xl text-slate-700 border border-emerald-100 leading-relaxed prose prose-slate max-w-none prose-sm" dangerouslySetInnerHTML={renderMarkdown(submissionData.aiFeedback)} />
                </div>
            )}
        </div>
      )}

      {hasRecordings && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Individual Question Responses</h2>
          {recordings.map((rec, index) => (
            <div key={rec.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A5F] bg-[#1E3A5F]/10 px-2 py-1 rounded-md mb-2 inline-block">
                    Part {rec.part}
                  </span>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight mt-1">{rec.questionText}</h3>
                </div>
                {rec.aiFeedback?.bandScore && (
                  <div className="shrink-0 ml-4 text-center">
                    <div className="text-2xl font-bold text-[#1E4DB7]">{rec.aiFeedback.bandScore}</div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 rounded-xl p-4 mb-4 flex items-center gap-4">
                <audio src={rec.audioData || undefined} controls className="w-full h-10" />
              </div>
              {rec.aiFeedback ? (
                <div className="space-y-4">
                  {rec.aiFeedback.transcription && (
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <FileText size={16} className="text-blue-500"/> Transcription
                      </h4>
                      <p className="text-slate-600 bg-slate-50 p-4 rounded-xl text-sm leading-relaxed border border-slate-100">
                        "{rec.aiFeedback.transcription}"
                      </p>
                    </div>
                  )}
                                  
                  {rec.aiFeedback.feedback && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(rec.aiFeedback.feedback).map(([category, text]) => (
                        <div key={category} className="bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                          <h4 className="font-bold text-blue-900 capitalize text-sm mb-1">{category}</h4>
                          <p className="text-sm text-slate-700 leading-relaxed">{String(text)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {rec.aiFeedback.improvements && Array.isArray(rec.aiFeedback.improvements) && rec.aiFeedback.improvements.length > 0 && (
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                      <h4 className="font-bold text-emerald-900 text-sm mb-2 flex items-center gap-2">
                        <CheckCircle size={16} /> Areas for Improvement
                      </h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {rec.aiFeedback.improvements.map((imp: string, i: number) => (
                          <li key={i} className="text-sm text-emerald-800">{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 text-sm italic bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                  Evaluation pending or failed for this response.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
