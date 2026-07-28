const fs = require('fs');

const code = `import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { SpeakingRecordingsReview } from '../components/SpeakingRecordingsReview';
import { SpeakingPerformanceReport } from '../components/SpeakingPerformanceReport';

export function SpeakingTestResult({ submissionId, sessionId }: { submissionId: string; sessionId?: string }) {
  const [submissionData, setSubmissionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
      <SpeakingPerformanceReport testId={submissionData.assignmentTitle || submissionData.assignmentId} />
      
      {submissionData.audioUrl && (
        <div className="pb-12">
           <SpeakingRecordingsReview testId={submissionData.assignmentTitle || submissionData.assignmentId} providedAudioUrl={submissionData.audioUrl} />
        </div>
      )}
    </div>
  );
}
`

fs.writeFileSync('src/pages/SpeakingTestResult.tsx', code);
