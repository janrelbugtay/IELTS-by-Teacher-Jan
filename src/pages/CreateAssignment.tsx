import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { OperationType } from '../types';
import { handleFirestoreError } from '../lib/errorHandler';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

export function CreateAssignment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'reading' | 'listening' | 'writing' | 'speaking'>('reading');
  const [speakingParts, setSpeakingParts] = useState({ part1: true, part2: true, part3: true });
  const [content, setContent] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'assignments'), {
        title: title.trim(),
        description: description.trim(),
        type,
        ...(type === 'speaking' ? { speakingParts } : {}),
        content: content.trim(),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      navigate('/admin');
    } catch (err) {
      console.error(err);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'assignments');
      } catch (handledError: any) {
        setError(JSON.parse(handledError.message).error || 'Failed to create assignment');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-natural-700 hover:text-natural-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Portal
      </Link>

      <div className="bg-white p-8 rounded-2xl border border-natural-200 shadow-sm">
        <h1 className="text-3xl font-serif tracking-tight text-natural-900 mb-6">Create New Assignment</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wide text-natural-800 mb-2">Assignment Title</label>
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl border border-natural-300 focus:ring-2 focus:ring-natural-900 focus:border-natural-900 transition-all outline-none"
              placeholder="e.g., Academic Reading Test 1"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wide text-natural-800 mb-2">Module Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full p-3 rounded-xl border border-natural-300 focus:ring-2 focus:ring-natural-900 focus:border-natural-900 transition-all outline-none bg-white"
            >
              <option value="reading">Reading</option>
              <option value="listening">Listening</option>
              <option value="writing">Writing</option>
              <option value="speaking">Speaking</option>
            </select>
          </div>
          {type === 'speaking' && (
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-natural-800 mb-2">Speaking Parts</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={speakingParts.part1}
                    onChange={(e) => setSpeakingParts(prev => ({ ...prev, part1: e.target.checked }))}
                    className="w-4 h-4 text-natural-900 border-natural-300 rounded focus:ring-natural-900"
                  />
                  <span>Part 1</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={speakingParts.part2}
                    onChange={(e) => setSpeakingParts(prev => ({ ...prev, part2: e.target.checked }))}
                    className="w-4 h-4 text-natural-900 border-natural-300 rounded focus:ring-natural-900"
                  />
                  <span>Part 2</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={speakingParts.part3}
                    onChange={(e) => setSpeakingParts(prev => ({ ...prev, part3: e.target.checked }))}
                    className="w-4 h-4 text-natural-900 border-natural-300 rounded focus:ring-natural-900"
                  />
                  <span>Part 3</span>
                </label>
              </div>
            </div>
          )}


          <div>
            <label className="block text-sm font-bold uppercase tracking-wide text-natural-800 mb-2">Short Description</label>
            <textarea
              required
              maxLength={1000}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-natural-300 focus:ring-2 focus:ring-natural-900 focus:border-natural-900 transition-all outline-none resize-none"
              placeholder="Provide a brief overview of this assignment..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wide text-natural-800 mb-2">Assignment Content / Prompts</label>
            <p className="text-xs text-natural-700 mb-3">
              For Reading/Writing: Paste the full text or prompt here. 
              For Listening: Provide a link to the audio and the questions.
              For Speaking: Provide the questions for the selected parts.
            </p>
            <textarea
              required
              maxLength={10000}
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 rounded-xl border border-natural-300 focus:ring-2 focus:ring-natural-900 focus:border-natural-900 transition-all outline-none resize-y font-mono text-sm leading-relaxed"
              placeholder="# Passage 1&#10;&#10;Read the following text..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link 
              to="/admin"
              className="px-6 py-3 font-semibold text-natural-700 hover:text-natural-900 hover:bg-natural-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || !title || !description || !content}
              className="px-6 py-3 bg-natural-900 text-white font-semibold rounded-xl hover:bg-natural-800 focus:ring-4 focus:ring-natural-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Publish Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
