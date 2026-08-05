import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
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
    let unsubscribe: () => void;
    async function fetchData() {
      try {
        if (submissionId) {
          const subRef = doc(db, 'submissions', submissionId);
          unsubscribe = onSnapshot(subRef, (subDoc) => {
            if (subDoc.exists()) {
              setSubmissionData(subDoc.data());
            }
            setLoading(false);
          }, (err) => {
            console.error("Error fetching submission data", err);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Error setting up snapshot", err);
        setLoading(false);
      }
    }

    fetchData();
    return () => {
      if (unsubscribe) unsubscribe();
    };
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
      
      {/* We can just render both components */}
      {submissionData.assignmentId !== 'offline_speaking' && !submissionData.assignmentTitle?.toLowerCase().includes('offline') && (
         <SpeakingPerformanceReport testId={submissionData.assignmentTitle || submissionData.assignmentId} audioUrl={submissionData.audioUrl} submissionId={submissionId} submissionData={submissionData} />
      )}
      
      {isOffline && (submissionData.audioUrl || submissionData.assignmentId === 'offline_speaking') && (
        <div className="pb-8">
           <SpeakingRecordingsReview testId={'offline_speaking'} providedAudioUrl={submissionData.audioUrl} providedAnswers={submissionData.answers} />
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
