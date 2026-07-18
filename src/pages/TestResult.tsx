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
import { JanuaryListeningTest } from './JanuaryListeningTest';
import { MarchListeningTest } from './MarchListeningTest';
import { AprilListeningTest } from './AprilListeningTest';
import { MayListeningTest } from './MayListeningTest';
import { JuneListeningTest } from './JuneListeningTest';
import { ComputerWritingTest } from './ComputerWritingTest';
import { JanuaryWritingTest } from './JanuaryWritingTest';
import { FebruaryWritingTest } from './FebruaryWritingTest';
import { MarchWritingTest } from './MarchWritingTest';
import { AprilWritingTest } from './AprilWritingTest';
import { getReadingTestData } from '../data/readingTestData';
import { SpeakingTestResult } from './SpeakingTestResult';


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
      if (submission.assignmentTitle?.toLowerCase().includes('january')) {
          return <JanuaryListeningTest submissionId={id} />;
      }
      if (submission.assignmentTitle?.toLowerCase().includes('february')) {
          return <FebruaryListeningTest submissionId={id} />;
      }
      if (submission.assignmentTitle?.toLowerCase().includes('march')) {
          return <MarchListeningTest submissionId={id} />;
      }
      if (submission.assignmentTitle?.toLowerCase().includes('april')) {
          return <AprilListeningTest submissionId={id} />;
      }
      if (submission.assignmentTitle?.toLowerCase().includes('may')) {
          return <MayListeningTest submissionId={id} />;
      }
      if (submission.assignmentTitle?.toLowerCase().includes('june')) {
          return <JuneListeningTest submissionId={id} />;
      }
      return <ComputerListeningTest submissionId={id} />;
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
      if (submission.assignmentTitle?.toLowerCase().includes('april')) {
          return <AprilWritingTest submissionId={id} />;
      }
      return <ComputerWritingTest submissionId={id} />;
  }
  if (type === 'speaking') {
      return <SpeakingTestResult submissionId={id} />;
  }

  // Generic fallback render for other test types
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-start gap-4 mb-8">
            <div className="p-4 bg-blue-50 rounded-2xl">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{submission.assignmentTitle}</h1>
              <div className="flex items-center gap-4 text-slate-500">
                <span className="capitalize">{submission.assignmentType}</span>
                <span>•</span>
                <span>Submitted by {submission.studentName || 'Student'}</span>
                <span>•</span>
                <span>{submission.createdAt?.toDate ? format(submission.createdAt.toDate(), 'PPP p') : 'Just now'}</span>
              </div>
            </div>
          </div>
          
          {submission.score !== undefined && (
             <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 mb-8">
               <div className="text-lg font-bold text-slate-900">Score: {submission.score}</div>
               {submission.bandScore && <div className="text-lg font-bold text-blue-600">Band Score: {submission.bandScore}</div>}
             </div>
          )}
          
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2">Submission Details</h2>
            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={renderMarkdown(typeof submission.answers === 'string' ? submission.answers : JSON.stringify(submission.answers))} />
          </div>
        </div>
      </div>
    </div>
  );
}
