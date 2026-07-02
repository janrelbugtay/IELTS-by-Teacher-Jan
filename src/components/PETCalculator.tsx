import React, { useState, useEffect, useMemo } from 'react';

// --- SVG Icons ---
const BookIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);

const EditIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const HeadphonesIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const MessageIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ResetIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

const DownloadIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const MIN_POINTS = { reading: 5, writing: 10, listening: 5, speaking: 7 };
const MAX_POINTS = { reading: 32, writing: 40, listening: 25, speaking: 30 };

// Map arrays: [Raw Marks, Cambridge Scale Score]
const CONVERSION_MAPS = {
  reading: [[0, 82], [5, 102], [13, 120], [23, 140], [29, 160], [32, 170]],
  writing: [[0, 82], [10, 102], [16, 120], [24, 140], [34, 160], [40, 170]],
  listening: [[0, 82], [5, 102], [11, 120], [18, 140], [23, 160], [25, 170]],
  speaking: [[0, 82], [7, 102], [12, 120], [18, 140], [24, 160], [30, 170]]
};

// Interpolation function to get accurate scale scores between anchor points
const getScaleScore = (marks: number, section: 'reading' | 'writing' | 'listening' | 'speaking') => {
  const map = CONVERSION_MAPS[section];
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

const getGrade = (scaleScore: number | null) => {
  if (scaleScore === null) return "-";
  if (scaleScore < 102) return "Not Reported";
  if (scaleScore <= 119) return "Level A1";
  if (scaleScore <= 139) return "Fail - Level A2";
  if (scaleScore <= 152) return "Pass - Grade C (Level B1)";
  if (scaleScore <= 159) return "Pass - Grade B (Level B1)";
  return "Pass - Grade A (Level B2)";
};

const Select = ({ label, value, max, onChange }: any) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 px-3 pr-8 text-gray-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-medium transition-all"
      >
        {Array.from({ length: max + 1 }).map((_, i) => (
          <option key={i} value={i}>{i}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  </div>
);

const ScoreSummary = ({ title, points, maxPoints, minPoints, scaleScore }: any) => (
  <div className="mt-6">
    <h3 className="text-sm font-semibold text-gray-700 mb-3">{title} Score Summary</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
        <div className="text-sm text-gray-500 mb-1">Points</div>
        <div className="text-2xl font-bold text-sky-600">{points} <span className="text-gray-400 text-lg font-medium">/ {maxPoints}</span></div>
        <div className="text-xs text-gray-400 mt-1">Minimum {minPoints} points required</div>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
        <div className="text-sm text-gray-500 mb-1">Cambridge Scale Score</div>
        <div className="text-2xl font-bold text-sky-600">{scaleScore}</div>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
        <div className="text-sm text-gray-500 mb-1">Grade</div>
        <div className="text-md font-semibold text-gray-800">{getGrade(scaleScore)}</div>
      </div>
    </div>
  </div>
);

export function PETCalculator() {
  const initialScores = {
    reading: { p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0 },
    writing: {
      p1c: 0, p1a: 0, p1o: 0, p1l: 0,
      p2c: 0, p2a: 0, p2o: 0, p2l: 0,
    },
    listening: { p1: 0, p2: 0, p3: 0, p4: 0 },
    speaking: { g: 0, d: 0, p: 0, i: 0, ga: 0 }
  };

  const initialTouched = { reading: false, writing: false, listening: false, speaking: false };

  const [activeTab, setActiveTab] = useState('reading');
  const [scores, setScores] = useState(initialScores);
  const [touched, setTouched] = useState(initialTouched);

  // Inject print styles to ensure clean PDF export
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
        .print\\:hidden { display: none !important; }
        .shadow-sm, .shadow-md, .shadow-inner { box-shadow: none !important; }
        .border { border-color: #e2e8f0 !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleScoreChange = (section: 'reading' | 'writing' | 'listening' | 'speaking', field: string, value: number) => {
    setScores(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    setTouched(prev => ({ ...prev, [section]: true }));
  };

  const handleResetSection = (section: 'reading' | 'writing' | 'listening' | 'speaking') => {
    setScores(prev => ({ ...prev, [section]: initialScores[section] }));
    setTouched(prev => ({ ...prev, [section]: false }));
  };

  const handleResetAll = () => {
    setScores(initialScores);
    setTouched(initialTouched);
  };

  const totals = useMemo(() => {
    const r = scores.reading;
    const w = scores.writing;
    const l = scores.listening;
    const s = scores.speaking;
    
    return {
      reading: r.p1 + r.p2 + r.p3 + r.p4 + r.p5 + r.p6,
      writing: w.p1c + w.p1a + w.p1o + w.p1l + w.p2c + w.p2a + w.p2o + w.p2l,
      listening: l.p1 + l.p2 + l.p3 + l.p4,
      speaking: s.g + s.d + s.p + s.i + (s.ga * 2) // Global Achievement is weighted x2
    };
  }, [scores]);

  const scaleScores = useMemo(() => ({
    reading: touched.reading ? getScaleScore(totals.reading, 'reading') : null,
    writing: touched.writing ? getScaleScore(totals.writing, 'writing') : null,
    listening: touched.listening ? getScaleScore(totals.listening, 'listening') : null,
    speaking: touched.speaking ? getScaleScore(totals.speaking, 'speaking') : null,
  }), [totals, touched]);

  const activeScaleScores = Object.values(scaleScores).filter(s => s !== null) as number[];
  const globalAverage = activeScaleScores.length > 0
    ? Math.round(activeScaleScores.reduce((a, b) => a + b, 0) / activeScaleScores.length)
    : null;

  const renderReadingSection = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <Select label="Part 1 (0-5)" value={scores.reading.p1} max={5} onChange={(v: number) => handleScoreChange('reading', 'p1', v)} />
        <Select label="Part 2 (0-5)" value={scores.reading.p2} max={5} onChange={(v: number) => handleScoreChange('reading', 'p2', v)} />
        <Select label="Part 3 (0-5)" value={scores.reading.p3} max={5} onChange={(v: number) => handleScoreChange('reading', 'p3', v)} />
        <Select label="Part 4 (0-5)" value={scores.reading.p4} max={5} onChange={(v: number) => handleScoreChange('reading', 'p4', v)} />
        <Select label="Part 5 (0-6)" value={scores.reading.p5} max={6} onChange={(v: number) => handleScoreChange('reading', 'p5', v)} />
        <Select label="Part 6 (0-6)" value={scores.reading.p6} max={6} onChange={(v: number) => handleScoreChange('reading', 'p6', v)} />
      </div>
      <hr className="my-6 border-gray-100" />
      <ScoreSummary title="Reading" points={totals.reading} maxPoints={MAX_POINTS.reading} minPoints={MIN_POINTS.reading} scaleScore={scaleScores.reading ?? getScaleScore(0, 'reading')} />
    </>
  );

  const renderWritingSection = () => (
    <>
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">Part 1</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Select label="Content (0-5)" value={scores.writing.p1c} max={5} onChange={(v: number) => handleScoreChange('writing', 'p1c', v)} />
             <Select label="Achievement (0-5)" value={scores.writing.p1a} max={5} onChange={(v: number) => handleScoreChange('writing', 'p1a', v)} />
             <Select label="Organisation (0-5)" value={scores.writing.p1o} max={5} onChange={(v: number) => handleScoreChange('writing', 'p1o', v)} />
             <Select label="Language (0-5)" value={scores.writing.p1l} max={5} onChange={(v: number) => handleScoreChange('writing', 'p1l', v)} />
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-3 text-sm">Part 2</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <Select label="Content (0-5)" value={scores.writing.p2c} max={5} onChange={(v: number) => handleScoreChange('writing', 'p2c', v)} />
             <Select label="Achievement (0-5)" value={scores.writing.p2a} max={5} onChange={(v: number) => handleScoreChange('writing', 'p2a', v)} />
             <Select label="Organisation (0-5)" value={scores.writing.p2o} max={5} onChange={(v: number) => handleScoreChange('writing', 'p2o', v)} />
             <Select label="Language (0-5)" value={scores.writing.p2l} max={5} onChange={(v: number) => handleScoreChange('writing', 'p2l', v)} />
          </div>
        </div>
      </div>
      <hr className="my-6 border-gray-100" />
      <ScoreSummary title="Writing" points={totals.writing} maxPoints={MAX_POINTS.writing} minPoints={MIN_POINTS.writing} scaleScore={scaleScores.writing ?? getScaleScore(0, 'writing')} />
    </>
  );

  const renderListeningSection = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Select label="Part 1 (0-7)" value={scores.listening.p1} max={7} onChange={(v: number) => handleScoreChange('listening', 'p1', v)} />
        <Select label="Part 2 (0-6)" value={scores.listening.p2} max={6} onChange={(v: number) => handleScoreChange('listening', 'p2', v)} />
        <Select label="Part 3 (0-6)" value={scores.listening.p3} max={6} onChange={(v: number) => handleScoreChange('listening', 'p3', v)} />
        <Select label="Part 4 (0-6)" value={scores.listening.p4} max={6} onChange={(v: number) => handleScoreChange('listening', 'p4', v)} />
      </div>
      <hr className="my-6 border-gray-100" />
      <ScoreSummary title="Listening" points={totals.listening} maxPoints={MAX_POINTS.listening} minPoints={MIN_POINTS.listening} scaleScore={scaleScores.listening ?? getScaleScore(0, 'listening')} />
    </>
  );

  const renderSpeakingSection = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <Select label="Grammar & Vocabulary (0-5)" value={scores.speaking.g} max={5} onChange={(v: number) => handleScoreChange('speaking', 'g', v)} />
        <Select label="Discourse Management (0-5)" value={scores.speaking.d} max={5} onChange={(v: number) => handleScoreChange('speaking', 'd', v)} />
        <Select label="Pronunciation (0-5)" value={scores.speaking.p} max={5} onChange={(v: number) => handleScoreChange('speaking', 'p', v)} />
        <Select label="Interactive Communication (0-5)" value={scores.speaking.i} max={5} onChange={(v: number) => handleScoreChange('speaking', 'i', v)} />
        <Select label="Global Achievement (0-5)" value={scores.speaking.ga} max={5} onChange={(v: number) => handleScoreChange('speaking', 'ga', v)} />
      </div>
      <hr className="my-6 border-gray-100" />
      <ScoreSummary title="Speaking" points={totals.speaking} maxPoints={MAX_POINTS.speaking} minPoints={MIN_POINTS.speaking} scaleScore={scaleScores.speaking ?? getScaleScore(0, 'speaking')} />
    </>
  );

  return (
    <div className="bg-[#f4f7fb] text-slate-800 p-4 md:p-8 font-sans selection:bg-sky-200">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-8 print:hidden">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">B1 Preliminary Calculator</h1>
          <p className="text-slate-500">Calculate your Cambridge English B1 Preliminary exam scores</p>
        </div>

        {/* Tab Navigation */}
        <div className="print:hidden">
          <div className="text-sm text-gray-500 mb-3 px-1">Select sections to calculate</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'reading', label: 'Reading', icon: <BookIcon /> },
              { id: 'writing', label: 'Writing', icon: <EditIcon /> },
              { id: 'listening', label: 'Listening', icon: <HeadphonesIcon /> },
              { id: 'speaking', label: 'Speaking', icon: <MessageIcon /> }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 cursor-pointer transition-all ${
                    isActive 
                      ? 'border-sky-500 bg-[#f0f9ff] text-sky-600 shadow-sm' 
                      : 'border-gray-200 bg-white text-gray-400 hover:border-sky-300 hover:bg-gray-50 hover:text-gray-600'
                  }`}
                >
                  {isActive && <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-sky-500 shadow-sm"></div>}
                  <div className="mb-2">{tab.icon}</div>
                  <span className="font-semibold text-sm">{tab.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Section Editor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 print:hidden">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2.5 text-sky-500">
              {activeTab === 'reading' && <BookIcon />}
              {activeTab === 'writing' && <EditIcon />}
              {activeTab === 'listening' && <HeadphonesIcon />}
              {activeTab === 'speaking' && <MessageIcon />}
              <h2 className="text-lg font-bold text-gray-800 capitalize">{activeTab}</h2>
            </div>
            <button 
              onClick={() => handleResetSection(activeTab as any)} 
              className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
              title={`Reset ${activeTab} section`}
            >
              <ResetIcon />
            </button>
          </div>

          {activeTab === 'reading' && renderReadingSection()}
          {activeTab === 'writing' && renderWritingSection()}
          {activeTab === 'listening' && renderListeningSection()}
          {activeTab === 'speaking' && renderSpeakingSection()}
        </div>

        {/* Global Summary Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mt-8 printable-section">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Cambridge English Scale Score</h2>
            <button 
              onClick={handleResetAll} 
              className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full print:hidden" 
              title="Reset all sections"
            >
              <ResetIcon />
            </button>
          </div>

          {activeScaleScores.length > 0 ? (
            <>
              {/* Individual Scores Display */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                 {touched.reading && (
                   <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                     <div className="text-xs text-gray-500 mb-1">Reading</div>
                     <div className="text-2xl font-bold text-sky-600">{scaleScores.reading}</div>
                   </div>
                 )}
                 {touched.writing && (
                   <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                     <div className="text-xs text-gray-500 mb-1">Writing</div>
                     <div className="text-2xl font-bold text-sky-600">{scaleScores.writing}</div>
                   </div>
                 )}
                 {touched.listening && (
                   <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                     <div className="text-xs text-gray-500 mb-1">Listening</div>
                     <div className="text-2xl font-bold text-sky-600">{scaleScores.listening}</div>
                   </div>
                 )}
                 {touched.speaking && (
                   <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                     <div className="text-xs text-gray-500 mb-1">Speaking</div>
                     <div className="text-2xl font-bold text-sky-600">{scaleScores.speaking}</div>
                   </div>
                 )}
              </div>

              {/* Global Average */}
              <div className="bg-[#f0f9ff] border border-sky-100 rounded-xl p-6 md:p-8 text-center mb-4">
                 <div className="text-sm font-semibold text-gray-600 mb-2">Global Average</div>
                 <div className="text-5xl font-bold text-sky-500 mb-2">{globalAverage}</div>
                 <div className="text-xs text-gray-500">Average of {activeScaleScores.length} section(s)</div>
              </div>

              {/* Overall Grade */}
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
                 <div className="text-sm font-semibold text-gray-500 mb-1">Overall Grade</div>
                 <div className="text-lg font-bold text-gray-800">{getGrade(globalAverage)}</div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
               <p className="font-medium text-gray-500">No sections calculated yet.</p>
               <p className="text-sm mt-1">Select sections above and adjust the scores to see your global average.</p>
            </div>
          )}
        </div>

        {/* Export Button */}
        <button
          onClick={() => window.print()}
          className="w-full mt-6 bg-[#0ea5e9] hover:bg-sky-600 text-white font-bold py-4 rounded-xl shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] transition-all flex justify-center items-center gap-2 print:hidden"
        >
          <DownloadIcon />
          Export Results Report (PDF)
        </button>

      </div>
    </div>
  );
}
