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
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Sync if initialFormData changes from outside
  useEffect(() => {
    if (initialFormData) {
      setBulkText(formatFormDataToPasteText(initialFormData, 'all'));
    }
  }, [initialFormData]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { formData: parsed } = parseFullTestText(bulkText);
      await onSaveOnly(parsed);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save speaking test.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Edit Speaking Test {testNumber}
          </h1>
          <button
            type="button"
            onClick={onPreview}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Back to Test
          </button>
        </div>

        {/* Bulk Paste Box */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <label className="block text-base font-bold text-slate-800">
            Bulk Paste
          </label>

          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={22}
            placeholder="Paste your speaking test text here (automatically identifies Parts 1, 2, and 3)..."
            className="w-full p-4 font-mono text-sm leading-relaxed rounded-xl border border-slate-300 focus:border-[#4F7DFF] focus:ring-4 focus:ring-blue-100 outline-none resize-y transition-all text-slate-800 bg-[#FAFAFA]"
          />

          {savedMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-sm font-semibold animate-in fade-in duration-200">
              <Check size={16} className="text-emerald-600 shrink-0" />
              Saved successfully!
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !bulkText.trim()}
            className="px-8 py-3.5 rounded-xl font-bold text-base bg-[#4F7DFF] hover:bg-blue-600 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>

      </div>
    </div>
  );
};
