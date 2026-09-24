import React, { useState } from 'react';
import { X, FolderInput, Folder, Shield, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CourseFolder } from '../types';

interface MoveStudentModalProps {
  student?: any;
  students?: any[];
  folders: CourseFolder[];
  onClose: () => void;
  onMoved: (studentIds: string[], newCourse: string, newFolderId: string | null, newFolderName: string | null) => void;
}

const COURSES = ['Pre-Starter', 'Starter', 'Movers', 'Flyers', 'KET', 'PET', 'IELTS'];

export function MoveStudentModal({ student, students, folders, onClose, onMoved }: MoveStudentModalProps) {
  const targetStudents = students && students.length > 0 ? students : (student ? [student] : []);
  const isMultiple = targetStudents.length > 1;
  const isIelts = targetStudents.some((s) => s?.course?.toUpperCase() === 'IELTS');

  // If IELTS student, destination course MUST be 'IELTS'
  const [selectedCourse, setSelectedCourse] = useState<string>(
    isIelts ? 'IELTS' : (targetStudents[0]?.course || 'IELTS')
  );
  // targetFolderId: '' or null means Course Root / Main Folder
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    !isMultiple ? (targetStudents[0]?.folderId || '') : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter active folders available for the selected course (exclude deleted folders)
  const courseFolders = folders.filter((f) => f.course === selectedCourse && !f.isDeleted);

  // Helper to build hierarchy display (parent -> child)
  const getFolderDisplayName = (folder: CourseFolder, visited = new Set<string>()): string => {
    if (!folder.parentId || visited.has(folder.id)) return folder.name;
    visited.add(folder.id);
    const parent = courseFolders.find((f) => f.id === folder.parentId);
    if (parent) {
      return `${getFolderDisplayName(parent, visited)} › ${folder.name}`;
    }
    return folder.name;
  };

  const handleCourseChange = (newCourse: string) => {
    if (isIelts && newCourse !== 'IELTS') {
      setError('IELTS students can only be moved within the IELTS folder.');
      return;
    }
    setError('');
    setSelectedCourse(newCourse);
    setSelectedFolderId(''); // reset folder when changing course
  };

  const handleMove = async (e: React.FormEvent) => {
    e.preventDefault();

    if (targetStudents.length === 0) {
      onClose();
      return;
    }

    // Strict validation
    if (isIelts && selectedCourse !== 'IELTS') {
      setError('IELTS students can only be moved within the IELTS folder.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const targetFolder = courseFolders.find((f) => f.id === selectedFolderId);
      const targetFolderId = targetFolder ? targetFolder.id : null;
      const targetFolderName = targetFolder ? targetFolder.name : null;

      const studentIds = targetStudents.map((s) => s.id);

      await Promise.all(
        studentIds.map((id) =>
          setDoc(doc(db, 'users', id), {
            course: selectedCourse,
            folderId: targetFolderId,
            folderName: targetFolderName
          }, { merge: true })
        )
      );

      onMoved(studentIds, selectedCourse, targetFolderId, targetFolderName);
      onClose();
    } catch (err: any) {
      console.error('Error moving student(s):', err);
      setError(err.message || 'Failed to move student(s).');
    } finally {
      setLoading(false);
    }
  };

  const singleStudent = targetStudents[0];
  const currentFolderName = singleStudent?.folderName || (singleStudent?.folderId ? folders.find((f) => f.id === singleStudent.folderId)?.name : null) || 'Main Folder';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl shadow-sm">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Move Student</h2>
              <p className="text-xs text-slate-500 font-medium">Organize student into course or subfolder</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleMove} className="p-6 space-y-5">
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-medium rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Profile Card */}
          {isMultiple ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Moving {targetStudents.length} Students
                </span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Batch Move
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {targetStudents.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {s.firstName || s.name || 'Student'}
                    <span className="text-slate-400 text-[10px]">({s.course})</span>
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
              {singleStudent?.photoURL ? (
                <img 
                  src={singleStudent.photoURL} 
                  alt={singleStudent.name} 
                  className="w-10 h-10 rounded-full object-cover border border-slate-200" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                  {(singleStudent?.firstName || singleStudent?.name || 'S')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">
                  {singleStudent?.firstName || singleStudent?.name || 'Unknown Student'}
                  {singleStudent?.nickname && <span className="text-blue-600 ml-1.5 italic font-normal">"{singleStudent.nickname}"</span>}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {singleStudent?.email || singleStudent?.studentId || 'Student Account'}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Current Location</div>
                <div className="text-xs font-bold text-slate-700">
                  {singleStudent?.course} › <span className="text-blue-600">{currentFolderName}</span>
                </div>
              </div>
            </div>
          )}

          {/* Special IELTS Policy Notice */}
          {isIelts ? (
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#1E4DB7] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">IELTS Policy Enforced</h4>
                <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                  IELTS students can <strong>only be moved within the IELTS folder</strong> (main folder or any IELTS subfolders).
                </p>
              </div>
            </div>
          ) : null}

          {/* Target Course Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Target Course</span>
              {isIelts && (
                <span className="text-[10px] text-blue-600 font-semibold lowercase">(locked to IELTS)</span>
              )}
            </label>
            {isIelts ? (
              <div className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-sm font-bold flex items-center justify-between cursor-not-allowed">
                <span>IELTS Course</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">Locked</span>
              </div>
            ) : (
              <select
                value={selectedCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {COURSES.map((c) => (
                  <option key={c} value={c}>
                    {c} Course
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Target Folder Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Target Folder / Subfolder
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
              
              {/* Root Course Option */}
              <label 
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                  selectedFolderId === '' 
                    ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="folderRadio"
                  checked={selectedFolderId === ''}
                  onChange={() => setSelectedFolderId('')}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <Folder className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{selectedCourse} (Main / Root Folder)</div>
                  <div className="text-[10px] text-slate-500">Uncategorized students in {selectedCourse}</div>
                </div>
              </label>

              {/* Subfolders Options */}
              {courseFolders.map((f) => {
                const displayName = getFolderDisplayName(f);
                const isSelected = selectedFolderId === f.id;
                const isNested = !!f.parentId;

                return (
                  <label
                    key={f.id}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-300 text-blue-900 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    } ${isNested ? 'ml-4' : ''}`}
                  >
                    <input
                      type="radio"
                      name="folderRadio"
                      checked={isSelected}
                      onChange={() => setSelectedFolderId(f.id)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <Folder className={`w-5 h-5 shrink-0 ${f.color ? `text-${f.color}-500` : 'text-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-1.5">
                        {displayName}
                        {isNested && (
                          <span className="text-[9px] bg-slate-100 text-slate-500 font-normal px-1.5 py-0.2 rounded">
                            subfolder
                          </span>
                        )}
                      </div>
                      {f.description && (
                        <div className="text-[10px] text-slate-500 truncate">{f.description}</div>
                      )}
                    </div>
                  </label>
                );
              })}

              {courseFolders.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                  No custom subfolders yet in {selectedCourse}. (The student will be moved to the {selectedCourse} main folder).
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#1E4DB7] hover:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <FolderInput className="w-4 h-4" />
              {loading ? 'Moving Student...' : 'Confirm Move'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
