import React, { useState } from 'react';
import { CheckCircle, Edit3, Send, Loader, Award, BookOpen, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { renderMarkdown } from '../lib/markdown';
import { EraLogo } from '../components/EraLogo';

export function EraAIIeltsApp() {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [taskType, setTaskType] = useState('task2');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      setError("Please enter your text before analyzing.");
      return;
    }

    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch('/api/evaluate-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputText, taskType, userId: user?.uid })
      });

      if (!response.ok) {
        let errText = await response.text();
        try {
            const parsedErr = JSON.parse(errText);
            if (parsedErr.error) errText = parsedErr.error;
        } catch(e) {}
        throw new Error(errText);
      }

      const result = await response.json();
      
      if (response.ok && result.feedback) {
        setFeedback(result.feedback);
        
        // Save to Firestore behind the scenes if matched a band score
        const bandMatch = result.feedback.match(/Final IELTS Band\s*=\s*([\d.]+)/i);
        const overallBand = bandMatch ? parseFloat(bandMatch[1]) : 0;
        
        if (user) {
          try {
            await addDoc(collection(db, 'submissions'), {
              assignmentId: 'era-ai-writing',
              assignmentTitle: `ERA AI Writing ${taskType === 'task1' ? 'Task 1' : 'Task 2'}`,
              assignmentType: 'writing',
              userId: user.uid,
              answers: inputText,
              aiFeedback: result.feedback,
              bandScore: overallBand,
              timeSpent: 0,
              createdAt: serverTimestamp()
            });
          } catch (e) {
            console.error("Failed to save submission", e);
          }
        }
      } else {
        setError(result.error || "ERA AI couldn't process the request. Please try again.");
      }
    } catch (err) {
      setError("Failed to connect to ERA AI. Please check your connection and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

// Using renderMarkdown from lib/markdown.ts

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white shadow-lg sticky top-0 z-10 border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <EraLogo className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">ERA AI</h1>
              <p className="text-blue-200 text-sm font-medium tracking-wide">10-Step IELTS Examiner & Corrector</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          <div className="xl:col-span-4 space-y-6 flex flex-col">
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 flex-grow">
              <h2 className="text-lg font-bold mb-4 flex items-center text-slate-800 border-b border-slate-100 pb-3">
                <Edit3 className="w-5 h-5 mr-2 text-blue-600" />
                Submit Your Draft
              </h2>
              
              <div className="flex flex-col gap-2 mb-5">
                {[
                  { id: 'task1', icon: <CheckCircle className="w-4 h-4 mr-2" />, label: 'Task 1 Writing' },
                  { id: 'task2', icon: <BookOpen className="w-4 h-4 mr-2" />, label: 'Task 2 Writing' }
                ].map((task) => (
                  <button
                    key={task.id}
                    onClick={() => setTaskType(task.id)}
                    className={`flex items-center justify-start py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                      taskType === task.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {task.icon}
                    {task.label}
                  </button>
                ))}
              </div>

              <div className="mb-5">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Paste your ${taskType.replace('task', 'Task ')} essay here to receive a full 10-step examiner evaluation...`}
                  className="w-full h-80 p-4 rounded-xl border border-slate-300 bg-slate-50 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none text-slate-800 placeholder-slate-400 leading-relaxed"
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setInputText('')}
                  className="text-slate-500 hover:text-red-600 text-sm font-medium flex items-center p-2 rounded-lg hover:bg-red-50 transition"
                >
                  <RefreshCw className="w-4 h-4 mr-1.5" /> Clear
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className={`flex items-center px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all duration-300 ${
                    loading 
                      ? 'bg-slate-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" /> Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" /> Grade Essay
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{error}</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-sm border border-indigo-100 p-6 hidden xl:block">
              <h3 className="font-bold text-indigo-900 mb-3 flex items-center">
                <ChevronRight className="w-5 h-5 text-indigo-500 mr-1" /> The 10-Step Evaluation
              </h3>
              <ul className="text-sm text-indigo-800 space-y-2.5 font-medium">
                <li className="flex items-start"><span className="text-indigo-400 mr-2">1.</span> Inline Corrections</li>
                <li className="flex items-start"><span className="text-indigo-400 mr-2">2.</span> Error Analysis Table</li>
                <li className="flex items-start"><span className="text-indigo-400 mr-2">3.</span> Grammar Issues</li>
                <li className="flex items-start"><span className="text-indigo-400 mr-2">4.</span> Vocab Upgrades</li>
                <li className="flex items-start"><span className="text-indigo-400 mr-2">5.</span> Sentence Improvement</li>
                <li className="flex items-start"><span className="text-indigo-400 mr-2">6.</span> Fully Corrected Essay</li>
                <li className="flex items-start"><span className="text-indigo-400 mr-2">7.</span> Strict Scoring Table</li>
                <li className="flex items-start"><span className="text-indigo-400 mr-2">8.</span> Improvement Roadmap</li>
                <li className="flex items-start"><span className="text-indigo-400 mr-2">9.</span> Band 9 Rewrite</li>
                <li className="flex items-start"><span className="text-indigo-400 mr-2">10.</span> Positive Feedback</li>
              </ul>
            </div>
          </div>

          <div className="xl:col-span-8">
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
              <div className="bg-slate-50 border-b border-slate-200 px-8 py-5 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  Examiner Report & Corrections
                </h2>
                <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  Band 9 Standards
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto flex-grow bg-white scroll-smooth">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <EraLogo className="w-8 h-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 mb-2 animate-pulse">Running 10-Step Evaluation...</h3>
                    <p className="font-medium text-slate-500 text-center max-w-sm">ERA AI is strictly checking grammar, upgrading vocabulary, and calculating your official band score.</p>
                  </div>
                ) : feedback ? (
                  <div 
                    className="prose prose-blue max-w-none prose-p:text-slate-700 prose-headings:text-slate-800"
                    dangerouslySetInnerHTML={renderMarkdown(feedback)}
                  ></div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
                      <BookOpen className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-600 mb-2">Ready for Grading</h3>
                    <p className="text-center font-medium max-w-sm text-slate-500 leading-relaxed">
                      Submit your essay on the left to receive a comprehensive, color-coded examiner report and a Band 9 rewrite.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
