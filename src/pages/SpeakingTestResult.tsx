import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import Markdown from 'react-markdown';
import { renderMarkdown } from '../lib/markdown';
import { SpeakingRecordingsReview } from '../components/SpeakingRecordingsReview';
import { SpeakingPerformanceReport } from '../components/SpeakingPerformanceReport';

export function SpeakingTestResult({ submissionId, sessionId }: { submissionId: string; sessionId?: string }) {
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const hasVideoLink = submissionData?.audioUrl && (
    submissionData.audioUrl.includes('drive.google.com') || 
    submissionData.audioUrl.includes('youtube.com') || 
    submissionData.audioUrl.includes('youtu.be')
  );
  const isOffline = submissionData?.assignmentId === 'offline_speaking' || submissionData?.assignmentTitle?.toLowerCase().includes('offline') || hasVideoLink;

  useEffect(() => {
    async function fetchData() {
      try {
        if (submissionId) {
          const subDoc = await getDoc(doc(db, 'submissions', submissionId));
          if (subDoc.exists()) {
            setSubmissionData(subDoc.data());
          }
        }
      } catch (err) {
        console.error("Error fetching submission data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [submissionId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading test results...</div>;
  }

  if (!submissionData) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Result Not Found</h2>
        <p className="text-slate-500">Could not load the submission data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-5xl mx-auto pt-8 px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>
      
      {/* We can just render both components */}
      {submissionData.assignmentId !== 'offline_speaking' && !submissionData.assignmentTitle?.toLowerCase().includes('offline') && (
         <SpeakingPerformanceReport testId={submissionData.assignmentTitle || submissionData.assignmentId} />
      )}
      
      {(submissionData.audioUrl || submissionData.assignmentId === 'offline_speaking') && (
        <div className="pb-8">
           <SpeakingRecordingsReview testId={isOffline ? 'offline_speaking' : (submissionData.assignmentTitle || submissionData.assignmentId)} providedAudioUrl={submissionData.audioUrl} />
        </div>
      )}

      {(submissionData.assignmentId === 'offline_speaking' || submissionData.assignmentTitle?.toLowerCase().includes('offline') || submissionData.teacherComment || submissionData.aiFeedback || submissionData.feedback || submissionData.answers?.feedback || submissionData.answers?.teacherComment) && (
        <div className="max-w-4xl mx-auto w-full px-8 pb-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-[#282B5C] mb-4">Feedback</h2>
                
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-slate-700 whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
                    <div className="mb-4 prose prose-slate max-w-none">
                        <Markdown>{submissionData.teacherComment || submissionData.aiFeedback || submissionData.feedback || submissionData.answers?.feedback || submissionData.answers?.teacherComment || "No feedback provided for this activity yet."}</Markdown>
                    </div>
                    {(submissionData.vietnameseTranslation || submissionData.teacherCommentVi || submissionData.answers?.vietnameseTranslation || submissionData.answers?.teacherCommentVi) && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Vietnamese Translation</h4>
                            <div className="prose prose-slate max-w-none">
                                <Markdown>{submissionData.vietnameseTranslation || submissionData.teacherCommentVi || submissionData.answers?.vietnameseTranslation || submissionData.answers?.teacherCommentVi}</Markdown>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
