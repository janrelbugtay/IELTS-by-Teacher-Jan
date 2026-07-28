import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Download, Trophy, BarChart3, CheckCircle2, ArrowRight, Zap, Mic, Edit2, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export interface GrammarCorrection {
  wrong: string;
  wrongWord: string;
  correct: string;
  type: string;
}

export interface VocabUpgrade {
  original: string;
  upgrades: { band: string; text: string; color: string; bg: string }[];
}

export interface PerformanceReportData {
  overallScore: number;
  scores: {
    fluency: number;
    lexical: number;
    grammar: number;
    pronunciation: number;
  };
  grammarCorrections: GrammarCorrection[];
  vocabUpgrades: VocabUpgrade[];
}

const emptyReportData: PerformanceReportData = {
  overallScore: 0,
  scores: {
    fluency: 0,
    lexical: 0,
    grammar: 0,
    pronunciation: 0
  },
  grammarCorrections: [],
  vocabUpgrades: []
};

export const SpeakingPerformanceReport = ({ testId, onNext, reportData = emptyReportData }: { testId?: string, onNext?: () => void, reportData?: PerformanceReportData }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<PerformanceReportData>(reportData);
  const [customTitle, setCustomTitle] = useState('');

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedId = testId ? (testId.includes('Practice') ? testId : testId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) : '';
  const title = customTitle || (testId && testId.includes('Practice') ? testId : (formattedId ? `${formattedId} Speaking Practice` : 'Speaking Practice'));

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you would save editableData and customTitle to Firebase here
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {isEditing ? (
              <input 
                type="text" 
                value={customTitle} 
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder={title}
                className="text-3xl font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 w-full max-w-md"
              />
            ) : (
              <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            )}
            <p className="text-slate-500 mt-1">Test completed on {today}</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button 
                onClick={isEditing ? handleSave : () => setIsEditing(true)}
                className="flex items-center gap-2 bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2.5 rounded-xl font-medium hover:bg-amber-200 transition-colors shadow-sm"
              >
                {isEditing ? <><Save size={18} /> Save Report</> : <><Edit2 size={18} /> Edit Report</>}
              </button>
            )}
            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={18} /> Export PDF
            </button>
            {onNext ? (
              <button 
                onClick={onNext}
                className="flex items-center gap-2 bg-[#4F7DFF] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                Review Recording <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={() => navigate('/ielts/dashboard')}
                className="bg-[#4F7DFF] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-sm"
              >
                Return to Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Score Card */}
          <div className="bg-gradient-to-b from-[#282B5C] to-[#1a1c40] rounded-3xl p-8 text-center text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-yellow-200" />
            <Trophy size={48} className="text-yellow-400 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-slate-200 mb-2">Overall Band Score</h3>
            
            {isEditing ? (
              <input 
                type="number" 
                step="0.5"
                value={editableData.overallScore} 
                onChange={(e) => setEditableData({...editableData, overallScore: Number(e.target.value)})}
                className="text-5xl font-bold mb-4 text-center bg-white/20 border border-white/30 rounded w-32 py-2 text-white"
              />
            ) : (
              <div className="text-7xl font-bold mb-4 drop-shadow-md">{editableData.overallScore || '-'}</div>
            )}
            
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium">
              Target: 7.5
            </div>
          </div>

          {/* Criteria Breakdown Card */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="text-[#4F7DFF]" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Criteria Breakdown</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <ScoreBar 
                label="Fluency & Coherence" 
                score={editableData.scores.fluency} 
                color="bg-[#4F7DFF]" 
                isEditing={isEditing}
                onChange={(v) => setEditableData({...editableData, scores: {...editableData.scores, fluency: v}})}
              />
              <ScoreBar 
                label="Lexical Resource" 
                score={editableData.scores.lexical} 
                color="bg-[#F7B731]" 
                isEditing={isEditing}
                onChange={(v) => setEditableData({...editableData, scores: {...editableData.scores, lexical: v}})}
              />
              <ScoreBar 
                label="Grammatical Range" 
                score={editableData.scores.grammar} 
                color="bg-[#20BF6B]" 
                isEditing={isEditing}
                onChange={(v) => setEditableData({...editableData, scores: {...editableData.scores, grammar: v}})}
              />
              <ScoreBar 
                label="Pronunciation" 
                score={editableData.scores.pronunciation} 
                color="bg-[#EB3B5A]" 
                isEditing={isEditing}
                onChange={(v) => setEditableData({...editableData, scores: {...editableData.scores, pronunciation: v}})}
              />
            </div>
          </div>
        </div>

        {/* Grammar Corrections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-[#20BF6B]" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Grammar Corrections</h3>
            </div>
            {isEditing && (
              <button 
                onClick={() => setEditableData({...editableData, grammarCorrections: [...editableData.grammarCorrections, { wrong: '', wrongWord: '', correct: '', type: 'Grammar' }]})}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg"
              >
                + Add Correction
              </button>
            )}
          </div>
          
          {editableData.grammarCorrections.length === 0 && !isEditing ? (
            <div className="text-slate-500 bg-white p-6 rounded-2xl border border-slate-200 text-center">No corrections available yet.</div>
          ) : (
            editableData.grammarCorrections.map((corr, idx) => (
              <GrammarCorrectionCard 
                key={idx}
                correction={corr}
                isEditing={isEditing}
                onChange={(updated) => {
                  const newCorrs = [...editableData.grammarCorrections];
                  newCorrs[idx] = updated;
                  setEditableData({...editableData, grammarCorrections: newCorrs});
                }}
                onRemove={() => {
                  const newCorrs = [...editableData.grammarCorrections];
                  newCorrs.splice(idx, 1);
                  setEditableData({...editableData, grammarCorrections: newCorrs});
                }}
              />
            ))
          )}
        </div>

        {/* Vocabulary Upgrades */}
        <div className="space-y-4 mt-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Zap className="text-[#F7B731]" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Vocabulary Upgrades</h3>
            </div>
            {isEditing && (
              <button 
                onClick={() => setEditableData({...editableData, vocabUpgrades: [...editableData.vocabUpgrades, { original: '', upgrades: [{ band: '7', text: '', color: 'text-[#4F7DFF]', bg: 'bg-blue-50' }] }]})}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg"
              >
                + Add Upgrade
              </button>
            )}
          </div>
          
          {editableData.vocabUpgrades.length === 0 && !isEditing ? (
             <div className="text-slate-500 bg-white p-6 rounded-2xl border border-slate-200 text-center">No upgrades available yet.</div>
          ) : (
            editableData.vocabUpgrades.map((item, idx) => (
              <VocabUpgradeCard 
                key={idx}
                item={item}
                isEditing={isEditing}
                onChange={(updated) => {
                  const newUpgrades = [...editableData.vocabUpgrades];
                  newUpgrades[idx] = updated;
                  setEditableData({...editableData, vocabUpgrades: newUpgrades});
                }}
                onRemove={() => {
                  const newUpgrades = [...editableData.vocabUpgrades];
                  newUpgrades.splice(idx, 1);
                  setEditableData({...editableData, vocabUpgrades: newUpgrades});
                }}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

// Subcomponents

const ScoreBar = ({ label, score, color, isEditing, onChange }: { label: string, score: number, color: string, isEditing: boolean, onChange: (v: number) => void }) => {
  const percentage = (score / 9) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-slate-700">{label}</span>
        {isEditing ? (
          <input 
            type="number" 
            step="0.5"
            max="9"
            min="0"
            value={score} 
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 text-right font-bold border border-slate-300 rounded px-1"
          />
        ) : (
          <span className={`font-bold ${color.replace('bg-', 'text-')}`}>{score || '-'}</span>
        )}
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const GrammarCorrectionCard = ({ correction, isEditing, onChange, onRemove }: { key?: string | number, correction: GrammarCorrection, isEditing: boolean, onChange: (c: GrammarCorrection) => void, onRemove: () => void }) => {
  const renderWrongText = () => {
    if (!correction.wrong) return null;
    if (!correction.wrongWord) return <p className="text-lg text-red-500 line-through decoration-2 mt-1">{correction.wrong}</p>;
    
    const parts = correction.wrong.split(correction.wrongWord);
    if (parts.length === 2) {
      return (
        <p className="text-lg text-slate-700 mt-1">
          {parts[0]}
          <span className="text-red-500 line-through decoration-2">{correction.wrongWord}</span>
          {parts[1]}
        </p>
      );
    }
    return <p className="text-lg text-red-500 line-through decoration-2 mt-1">{correction.wrong}</p>;
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm space-y-3 relative">
        <button onClick={onRemove} className="absolute top-4 right-4 text-red-500 text-sm font-medium">Remove</button>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Original Sentence</label>
          <input type="text" className="w-full border border-slate-300 rounded p-2 mt-1" value={correction.wrong} onChange={(e) => onChange({...correction, wrong: e.target.value})} placeholder="e.g. I have live in Vietnam for ten years." />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Wrong Word (to cross out)</label>
          <input type="text" className="w-full border border-slate-300 rounded p-2 mt-1" value={correction.wrongWord} onChange={(e) => onChange({...correction, wrongWord: e.target.value})} placeholder="e.g. have live" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Corrected Sentence</label>
          <input type="text" className="w-full border border-slate-300 rounded p-2 mt-1" value={correction.correct} onChange={(e) => onChange({...correction, correct: e.target.value})} placeholder="e.g. I have lived in Vietnam for ten years." />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Error Type</label>
          <input type="text" className="w-full border border-slate-300 rounded p-2 mt-1" value={correction.type} onChange={(e) => onChange({...correction, type: e.target.value})} placeholder="e.g. Tense" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-400 mb-1">You said:</div>
        {renderWrongText()}
      </div>
      <div className="hidden md:flex text-slate-300">
        <ArrowRight size={24} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-400 mb-1">Correction ({correction.type}):</div>
        <p className="text-lg font-medium text-[#20BF6B] mt-1">{correction.correct}</p>
      </div>
    </div>
  );
};

const VocabUpgradeCard = ({ item, isEditing, onChange, onRemove }: { key?: string | number, item: VocabUpgrade, isEditing: boolean, onChange: (u: VocabUpgrade) => void, onRemove: () => void }) => {
  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm space-y-4 relative mb-4">
        <button onClick={onRemove} className="absolute top-4 right-4 text-red-500 text-sm font-medium">Remove</button>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Original Word/Phrase</label>
          <input type="text" className="w-full border border-slate-300 rounded p-2 mt-1" value={item.original} onChange={(e) => onChange({...item, original: e.target.value})} placeholder="e.g. The food is very good." />
        </div>
        
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase">Upgrades</label>
          {item.upgrades.map((upg, i) => (
            <div key={i} className="flex gap-2 items-center bg-slate-50 p-2 rounded">
              <input type="text" className="w-20 border border-slate-300 rounded p-1 text-sm" value={upg.band} onChange={(e) => {
                const newUpgrades = [...item.upgrades];
                newUpgrades[i].band = e.target.value;
                onChange({...item, upgrades: newUpgrades});
              }} placeholder="Band 7" />
              <input type="text" className="flex-1 border border-slate-300 rounded p-1 text-sm" value={upg.text} onChange={(e) => {
                const newUpgrades = [...item.upgrades];
                newUpgrades[i].text = e.target.value;
                onChange({...item, upgrades: newUpgrades});
              }} placeholder="Improved text" />
              <button className="text-red-500 px-2" onClick={() => {
                const newUpgrades = [...item.upgrades];
                newUpgrades.splice(i, 1);
                onChange({...item, upgrades: newUpgrades});
              }}>X</button>
            </div>
          ))}
          <button 
            onClick={() => onChange({...item, upgrades: [...item.upgrades, { band: '8', text: '', color: 'text-[#6CCB5F]', bg: 'bg-emerald-50' }]})}
            className="text-xs bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded"
          >
            + Upgrade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-4">
      <div className="flex items-center gap-4 bg-slate-50 px-6 py-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
          <Mic size={20} />
        </div>
        <p className="text-lg font-medium text-slate-700">"{item.original}"</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
        {item.upgrades.map((upg, i) => (
          <div key={i} className={`${upg.bg} rounded-xl p-5 border border-white/40 shadow-sm relative overflow-hidden group hover:shadow-md transition-all`}>
            <div className={`inline-block ${upg.color} bg-white px-3 py-1 rounded-md text-xs font-bold tracking-wide mb-3 shadow-sm`}>
              Band {upg.band}
            </div>
            <p className="text-slate-800 font-medium">{upg.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
