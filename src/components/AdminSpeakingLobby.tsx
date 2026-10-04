import React, { useState, useEffect } from 'react';
import { Save, Play, Eye, Trash2, Check, RotateCcw } from 'lucide-react';
import { 
  SpeakingFormData, 
  parseFullTestText, 
  formatFormDataToPasteText, 
  SAMPLE_BULK_TEST_TEXT 
} from '../utils/speakingTestParser';

interface AdminSpeakingLobbyProps {
  testNumber?: string;
  initialFormData: SpeakingFormData;
  onSaveAndStart: (data: SpeakingFormData) => Promise<void>;
  onSaveOnly: (data: SpeakingFormData) => Promise<void>;
  onPreview: () => void;
}

export const AdminSpeakingLobby: React.FC<AdminSpeakingLobbyProps> = ({
  testNumber = '1',
  initialFormData,
  onSaveAndStart,
  onSaveOnly,
  onPreview
}) => {
  const [bulkText, setBulkText] = useState<string>(() => 
    initialFormData ? formatFormDataToPasteText(initialFormData, 'all') : SAMPLE_BULK_TEST_TEXT
  );
  const [formData, setFormData] = useState<SpeakingFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Auto-parse whenever bulkText changes
  useEffect(() => {
    if (bulkText.trim()) {
      const { formData: parsed } = parseFullTestText(bulkText);
      setFormData(parsed);
    }
  }, [bulkText]);

  // Sync if initialFormData changes from outside
  useEffect(() => {
    if (initialFormData) {
      setFormData(initialFormData);
    }
  }, [initialFormData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { formData: parsed } = parseFullTestText(bulkText);
      await onSaveOnly(parsed);
      setFormData(parsed);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save speaking test.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndStart = async () => {
    try {
      setIsSaving(true);
      const { formData: parsed } = parseFullTestText(bulkText);
      await onSaveAndStart(parsed);
    } catch (err) {
      console.error(err);
      alert('Failed to save speaking test.');
    } finally {
      setIsSaving(false);
    }
  };

  const p1Count = formData?.part1?.length || 0;
  const p1Answers = formData?.part1?.filter(q => q.sampleAnswer?.trim()).length || 0;
  const p2Bullets = formData?.part2?.bulletPoints?.length || 0;
  const p3Count = formData?.part3?.length || 0;
  const p3Answers = formData?.part3?.filter(q => q.sampleAnswer?.trim()).length || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Admin Lobby: Edit Speaking Test {testNumber}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-semibold text-slate-500">
              <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
                Part 1: {p1Count} Questions ({p1Answers} Answers)
              </span>
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">
                Part 2: Cue Card ({p2Bullets} Bullets)
              </span>
              <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md border border-purple-100">
                Part 3: {p3Count} Questions ({p3Answers} Answers)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkText(SAMPLE_BULK_TEST_TEXT)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Reset to sample IELTS Speaking format"
            >
              <RotateCcw size={13} /> Sample Format
            </button>
            <button
              type="button"
              onClick={() => setBulkText('')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={13} /> Clear
            </button>
          </div>
        </div>

        {/* Main Bulk Paste Box */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Bulk Paste (Parts 1, 2, and 3)
            </label>
            <span className="text-xs text-slate-400">
              Automatically identifies topics, questions, and sample answers
            </span>
          </div>

          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={22}
            placeholder={`PART 1\nTopic: Hometown\n1. Where is your hometown?\nSample Answer: My hometown is...\n\nPART 2\nTopic: Describe an important decision\nYou should say:\n• what it was\n• when you made it\nSample Answer:\nAn important decision was...\n\nPART 3\nTopic: Choices\n1. How do people make decisions?\nSample Answer: People make decisions by...`}
            className="w-full p-4 font-mono text-sm leading-relaxed rounded-xl border border-slate-300 focus:border-[#4F7DFF] focus:ring-4 focus:ring-blue-100 outline-none resize-y transition-all text-slate-800 bg-[#FAFAFA]"
          />

          {savedMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-sm font-semibold animate-in fade-in duration-200">
              <Check size={16} className="text-emerald-600 shrink-0" />
              Saved successfully!
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onPreview}
            className="px-5 py-3 rounded-xl font-bold text-sm bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Eye size={16} /> Preview Test
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !bulkText.trim()}
              className="px-8 py-3 rounded-xl font-bold text-sm bg-[#4F7DFF] hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>

            <button
              type="button"
              onClick={handleSaveAndStart}
              disabled={isSaving || !bulkText.trim()}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Play size={16} fill="currentColor" />
              Save & Start Test
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
