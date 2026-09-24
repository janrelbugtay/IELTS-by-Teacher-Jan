import React, { useState } from 'react';
import { X, FolderPlus, Folder, AlertCircle } from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CourseFolder } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface CreateFolderModalProps {
  course: string;
  parentFolder?: CourseFolder | null;
  availableFolders?: CourseFolder[];
  onClose: () => void;
  onCreated: (folder: CourseFolder) => void;
}

export function CreateFolderModal({ 
  course, 
  parentFolder, 
  availableFolders = [], 
  onClose, 
  onCreated 
}: CreateFolderModalProps) {
  const { user } = useAuth();
  const [folderName, setFolderName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string>(parentFolder?.id || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Course folders available for nesting (excluding deleted)
  const courseFolders = availableFolders.filter((f) => f.course === course && !f.isDeleted);

  const getFolderDepth = (folder: CourseFolder, visited = new Set<string>()): number => {
    if (!folder.parentId || visited.has(folder.id)) return 0;
    visited.add(folder.id);
    const parent = courseFolders.find((f) => f.id === folder.parentId);
    return parent ? 1 + getFolderDepth(parent, visited) : 0;
  };

  const currentParent = courseFolders.find((f) => f.id === selectedParentId) || (parentFolder?.id === selectedParentId ? parentFolder : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setError('Please enter a folder name.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const folderRef = doc(collection(db, 'folders'));
      const newFolder: CourseFolder = {
        id: folderRef.id,
        name: folderName.trim(),
        course,
        parentId: selectedParentId || null,
        description: '',
        color: 'blue',
        createdBy: user?.email || 'admin',
        createdAt: Date.now()
      };

      await setDoc(folderRef, newFolder);
      onCreated(newFolder);
      onClose();
    } catch (err: any) {
      console.error('Error creating folder:', err);
      setError(err.message || 'Failed to create folder.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl shadow-sm">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {selectedParentId ? 'New Subfolder' : 'New Folder'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {currentParent ? (
                  <span>Inside <strong className="text-blue-600">{currentParent.name}</strong> ({course})</span>
                ) : (
                  <span>Inside <strong className="text-blue-600">{course}</strong> Course Root</span>
                )}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simple Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Folder Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Folder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Batch 2024, Morning Class, Weekday Intensive..."
              autoFocus
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Parent Location Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Create Inside
            </label>
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
            >
              <option value="">{course} (Root / Top Level)</option>
              {courseFolders.map((f) => {
                const depth = getFolderDepth(f);
                const indent = '— '.repeat(depth);
                return (
                  <option key={f.id} value={f.id}>
                    {indent}📁 {f.name} {depth > 0 ? `(Subfolder)` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !folderName.trim()}
              className="px-5 py-2.5 bg-[#1E4DB7] hover:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              {loading ? 'Creating...' : selectedParentId ? 'Create Subfolder' : 'Create Folder'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
