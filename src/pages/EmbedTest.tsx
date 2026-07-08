import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const CONVERSION_MAPS = {
  reading: [[0, 82], [5, 102], [13, 120], [23, 140], [29, 160], [32, 170]]
};

const getScaleScore = (marks: number) => {
  const map = CONVERSION_MAPS.reading;
  if (marks <= map[0][0]) return map[0][1];
  for (let i = 1; i < map.length; i++) {
    if (marks <= map[i][0]) {
      const p1 = map[i - 1];
      const p2 = map[i];
      const fraction = (marks - p1[0]) / (p2[0] - p1[0]);
      return Math.round(p1[1] + fraction * (p2[1] - p1[1]));
    }
  }
  return map[map.length - 1][1];
};

export function EmbedTest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const src = searchParams.get('src');
  const { user } = useAuth();
  
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Validate origin if needed, here we accept from same origin
      if (event.data?.type === 'PET_TEST_SUBMITTED' && user) {
        const { testId, score, maxScore, studentName } = event.data.payload;
        
        try {
          const scaleScore = getScaleScore(score);

          await addDoc(collection(db, 'submissions'), {
            userId: user.uid,
            studentName: studentName || user.displayName || 'Student',
            assignmentId: testId,
            assignmentTitle: 'B1 Preliminary Reading - Test 1', // We can map this or pass it from the test
            assignmentType: 'reading',
            answers: JSON.stringify({ rawScore: score, maxScore: maxScore }),
            bandScore: scaleScore,
            overallBand: scaleScore,
            score: score,
            maxScore: maxScore,
            status: 'completed',
            createdAt: serverTimestamp(),
          });
          
          // Show alert and redirect
          alert('Test submitted successfully!');
          navigate('/ielts/dashboard?course=pet&tab=reading');
        } catch (error) {
          console.error('Error saving submission:', error);
          alert('Failed to save submission. Please try again.');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, navigate]);

  if (!src) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Test Not Found</h2>
          <button 
            onClick={() => navigate(-1)}
            className="text-[#1E4DB7] hover:underline font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0 shadow-sm relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-[#1E4DB7] font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <h1 className="text-lg font-bold text-slate-900 hidden sm:block">Practice Test</h1>
        <div className="w-20"></div>
      </div>
      <iframe 
        src={src || undefined} 
        className="w-full flex-1 border-0"
        title="Practice Test"
        allow="microphone; camera"
      />
    </div>
  );
}
