import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Assignment, Submission, OperationType } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError } from '../lib/errorHandler';
import { ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router';

export function ViewAssignment() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [answers, setAnswers] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !id) return;

    const fetchAssignmentAndSubmission = async () => {
      try {
        const docRef = doc(db, 'assignments', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setAssignment({ id: docSnap.id, ...docSnap.data() } as Assignment);
        } else {
          setError('Assignment not found');
        }

        // Check if already submitted
        const subQ = query(
          collection(db, 'submissions'), 
          where('assignmentId', '==', id),
          where('userId', '==', user.uid)
        );
        const subSnap = await getDocs(subQ);
        if (!subSnap.empty) {
          const subDoc = subSnap.docs[0];
          setSubmission({ id: subDoc.id, ...subDoc.data() } as Submission);
          setAnswers(subDoc.data().answers);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `assignments/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentAndSubmission();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !answers.trim() || submission) return;

    setSubmitting(true);
    try {
      const submissionData = {
        assignmentId: id,
        userId: user.uid,
        answers: answers.trim(),
        createdAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'submissions'), submissionData);
      setSubmission({ id: docRef.id, ...submissionData } as Submission);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, 'submissions');
      setError('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'reading': return 'text-accent-green bg-accent-green/10 border-accent-green/20';
      case 'listening': return 'text-accent-blue bg-accent-blue/10 border-accent-blue/20';
      case 'writing': return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';
      default: return 'text-natural-700 bg-natural-100 border-natural-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse pb-16">
        <div className="w-32 h-6 bg-natural-200 rounded"></div>
        <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-natural-200 shadow-sm">
          <div className="w-24 h-6 bg-natural-200 rounded-full mb-6"></div>
          <div className="w-3/4 h-10 bg-natural-200 rounded-xl mb-4"></div>
          <div className="w-full h-24 bg-natural-200 rounded-xl mb-8"></div>
          <div className="w-full h-64 bg-natural-100 rounded-2xl mb-12"></div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="text-center py-20 max-w-lg mx-auto">
        <div className="bg-white p-8 rounded-3xl border border-natural-200 shadow-sm">
          <Clock className="w-12 h-12 text-natural-400 mx-auto mb-4" />
          <p className="text-xl font-serif text-natural-900 mb-6">{error || 'Assignment unavailable'}</p>
          <Link to="/dashboard" className="inline-flex items-center justify-center w-full px-6 py-3 bg-natural-900 text-white font-semibold rounded-xl hover:bg-natural-800 transition-colors">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-natural-600 hover:text-natural-900 transition-colors group">
        <div className="bg-white p-1.5 rounded-lg shadow-sm border border-natural-200 group-hover:border-natural-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </div>
        Back to Dashboard
      </Link>

      <div className="bg-white p-8 md:p-12 rounded-[2rem] border border-natural-200 shadow-sm">
        <div className="mb-10">
          <div className={`inline-flex items-center gap-2 mb-6 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border ${getTypeStyle(assignment.type)}`}>
            {assignment.type}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-natural-900 mb-6 leading-tight">{assignment.title}</h1>
          <p className="text-natural-700 text-lg leading-relaxed mb-10 max-w-3xl">{assignment.description}</p>
          
          <div className="relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-natural-300 rounded-full"></div>
            <div className="pl-6 md:pl-10">
              <div className="bg-natural-50 p-6 md:p-8 rounded-2xl border border-natural-200 whitespace-pre-wrap font-mono text-[15px] text-natural-800 leading-relaxed shadow-inner">
                {assignment.content}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-natural-100">
          <h2 className="text-2xl font-serif text-natural-900 mb-6">Your Answer</h2>
          {submission ? (
            <div className="space-y-6">
              <div className="flex items-start md:items-center gap-4 text-accent-green font-medium bg-natural-50 p-5 rounded-2xl border border-natural-200 shadow-sm">
                <div className="bg-accent-green text-white p-1.5 rounded-full shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-natural-900">Successfully submitted</p>
                  <p className="text-sm text-natural-700">Your teacher will review your work shortly.</p>
                </div>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-natural-200 whitespace-pre-wrap text-natural-800 leading-relaxed text-lg shadow-sm">
                {submission.answers}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <textarea
                value={answers}
                onChange={(e) => setAnswers(e.target.value)}
                placeholder="Type your answer here..."
                rows={12}
                className="w-full p-6 text-lg leading-relaxed rounded-2xl border border-natural-300 focus:ring-4 focus:ring-natural-900/10 focus:border-natural-900 transition-all resize-y text-natural-900 bg-white placeholder:text-natural-400 shadow-sm"
                required
              />
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting || !answers.trim()}
                  className="px-8 py-4 bg-natural-900 text-white font-bold rounded-xl hover:bg-natural-800 hover:-translate-y-0.5 transition-all shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] disabled:opacity-50 disabled:hover:-translate-y-0 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
