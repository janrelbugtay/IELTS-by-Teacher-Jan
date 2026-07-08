import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Play, Pause, FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function SpeakingTestResult({ submissionId, sessionId }: { submissionId: string; sessionId?: string }) {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecordings() {
      if (!sessionId) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'submissions'),
          where('sessionId', '==', sessionId),
          where('audioData', '!=', null)
        );
        const snapshot = await getDocs(q);
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        // Sort by part and questionIndex
        docs.sort((a, b) => {
          if (a.part !== b.part) return (a.part || 0) - (b.part || 0);
          return (a.questionIndex || 0) - (b.questionIndex || 0);
        });
        setRecordings(docs);
      } catch (err) {
        console.error("Error fetching speaking recordings", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecordings();
  }, [sessionId]);

  if (loading) {
    return <div className="p-8 text-center animate-pulse">Loading recordings...</div>;
  }

  if (recordings.length === 0) {
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

      <div className="space-y-6">
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
    </div>
  );
}
