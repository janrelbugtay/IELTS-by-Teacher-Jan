import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  RotateCcw, 
  User, 
  Folder, 
  AlertTriangle, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Clock,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';
import { CourseFolder } from '../types';

interface TrashBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  deletedStudents: any[];
  deletedFolders: CourseFolder[];
  onRestoreStudent: (studentId: string) => Promise<void>;
  onRestoreFolder: (folderId: string) => Promise<void>;
  onPermanentDeleteStudent: (studentId: string) => Promise<void>;
  onPermanentDeleteFolder: (folderId: string) => Promise<void>;
  onEmptyTrash: () => Promise<void>;
}

export function TrashBinModal({
  isOpen,
  onClose,
  deletedStudents,
  deletedFolders,
  onRestoreStudent,
  onRestoreFolder,
  onPermanentDeleteStudent,
  onPermanentDeleteFolder,
  onEmptyTrash
}: TrashBinModalProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'students' | 'folders'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [itemToDeletePermanently, setItemToDeletePermanently] = useState<{ id: string; name: string; type: 'student' | 'folder' } | null>(null);

  if (!isOpen) return null;

  const totalItems = deletedStudents.length + deletedFolders.length;

  const filteredStudents = deletedStudents.filter((s) => {
    const q = searchQuery.toLowerCase();
    const name = (s.name || `${s.firstName || ''} ${s.lastName || ''}` || s.nickname || '').toLowerCase();
    const email = (s.email || s.studentId || '').toLowerCase();
    const course = (s.course || '').toLowerCase();
    return name.includes(q) || email.includes(q) || course.includes(q);
  });

  const filteredFolders = deletedFolders.filter((f) => {
    const q = searchQuery.toLowerCase();
    return f.name.toLowerCase().includes(q) || f.course.toLowerCase().includes(q);
  });

  const handleRestore = async (id: string, type: 'student' | 'folder') => {
    setActionLoadingId(id);
    try {
      if (type === 'student') {
        await onRestoreStudent(id);
      } else {
        await onRestoreFolder(id);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!itemToDeletePermanently) return;
    setActionLoadingId(itemToDeletePermanently.id);
    try {
      if (itemToDeletePermanently.type === 'student') {
        await onPermanentDeleteStudent(itemToDeletePermanently.id);
      } else {
        await onPermanentDeleteFolder(itemToDeletePermanently.id);
      }
      setItemToDeletePermanently(null);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmEmptyTrash = async () => {
    setActionLoadingId('empty-all');
    try {
      await onEmptyTrash();
      setConfirmEmpty(false);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDeletedDate = (val: any) => {
    if (!val) return 'Recently';
    try {
      if (typeof val === 'number') return format(new Date(val), 'MMM d, yyyy HH:mm');
      if (val.toDate) return format(val.toDate(), 'MMM d, yyyy HH:mm');
      return 'Recently';
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-2xl shadow-sm">
              <Trash2 className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Trash Bin</h2>
                <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2.5 py-0.5 rounded-full">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Items stored here can be restored back to their courses or deleted permanently.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {totalItems > 0 && (
              <button
                onClick={() => setConfirmEmpty(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors border border-rose-200 cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Empty Trash</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3.5 bg-white border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({totalItems})
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Students ({deletedStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('folders')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'folders'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Folders ({deletedFolders.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trash..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          
          {totalItems === 0 ? (
            <div className="p-12 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center bg-slate-50/50">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Trash Bin is Empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                When you delete a student or a folder from any course, it will be stored here safely. You can restore it anytime or delete it permanently.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Folders Section in Trash */}
              {(activeTab === 'all' || activeTab === 'folders') && filteredFolders.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Deleted Folders ({filteredFolders.length})</span>
                  </h3>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    {filteredFolders.map((f) => {
                      const isLoading = actionLoadingId === f.id;
                      return (
                        <div
                          key={f.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                              <Folder className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900">{f.name}</h4>
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                                  {f.course} Course
                                </span>
                                {f.parentId && (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">
                                    Subfolder
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>Deleted: {formatDeletedDate(f.deletedAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              disabled={isLoading}
                              onClick={() => handleRestore(f.id, 'folder')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{isLoading ? 'Restoring...' : 'Restore'}</span>
                            </button>

                            <button
                              disabled={isLoading}
                              onClick={() => setItemToDeletePermanently({ id: f.id, name: f.name, type: 'folder' })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Delete Permanently</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Students Section in Trash */}
              {(activeTab === 'all' || activeTab === 'students') && filteredStudents.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Deleted Students ({filteredStudents.length})</span>
                  </h3>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    {filteredStudents.map((s) => {
                      const isLoading = actionLoadingId === s.id;
                      const studentName = s.firstName || s.name || s.displayName || 'Unknown Student';
                      return (
                        <div
                          key={s.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200 shrink-0">
                              {(studentName[0] || 'S').toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900">
                                  {studentName}
                                  {s.nickname && (
                                    <span className="text-blue-600 italic font-normal ml-1">"{s.nickname}"</span>
                                  )}
                                </h4>
                                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                                  {s.course || 'No Course'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                <span>{s.email || s.studentId || 'No identifier'}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  Deleted: {formatDeletedDate(s.deletedAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              disabled={isLoading}
                              onClick={() => handleRestore(s.id, 'student')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{isLoading ? 'Restoring...' : 'Restore'}</span>
                            </button>

                            <button
                              disabled={isLoading}
                              onClick={() => setItemToDeletePermanently({ id: s.id, name: studentName, type: 'student' })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Delete Permanently</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No search results */}
              {searchQuery && filteredStudents.length === 0 && filteredFolders.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No trash items match "{searchQuery}"
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Confirmation Modal for Permanent Delete */}
      {itemToDeletePermanently && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Permanently?</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{itemToDeletePermanently.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setItemToDeletePermanently(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoadingId === itemToDeletePermanently.id}
                onClick={handleConfirmPermanentDelete}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId === itemToDeletePermanently.id ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Empty Trash */}
      {confirmEmpty && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Empty All Trash?</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              This will permanently delete all {totalItems} item{totalItems !== 1 ? 's' : ''} currently in the trash bin. This action cannot be undone.
            </p>
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setConfirmEmpty(false)}
                className="flex-1 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionLoadingId === 'empty-all'}
                onClick={handleConfirmEmptyTrash}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId === 'empty-all' ? 'Emptying...' : 'Yes, Empty All'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
