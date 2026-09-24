import React, { useState } from 'react';
import { 
  X, 
  Folder, 
  FolderPlus, 
  FolderInput, 
  ChevronRight, 
  ArrowLeft, 
  UserPlus, 
  Key, 
  LayoutDashboard, 
  Trash2, 
  Edit2, 
  Check, 
  Users, 
  Shield,
  Layers
} from 'lucide-react';
import { Link } from 'react-router';
import { format } from 'date-fns';
import { doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CourseFolder } from '../types';

interface CourseFolderModalProps {
  courseName: string;
  courseUsers: any[];
  allFolders: CourseFolder[];
  onClose: () => void;
  onOpenCreateFolder: (courseName: string, parentFolder?: CourseFolder | null) => void;
  onOpenCreateStudent: (courseName: string, folderId?: string | null, folderName?: string | null, lock?: boolean) => void;
  onOpenMoveStudent: (student: any) => void;
  onGenerateCredentials: (u: any) => void;
}

export function CourseFolderModal({
  courseName,
  courseUsers,
  allFolders,
  onClose,
  onOpenCreateFolder,
  onOpenCreateStudent,
  onOpenMoveStudent,
  onGenerateCredentials
}: CourseFolderModalProps) {
  // Navigation stack: current active folder inside this course (null = course root)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewAllStudents, setViewAllStudents] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  
  // Custom in-app confirmation state (avoids iframe confirm() blocks)
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'folder' | 'student';
    item: any;
    name: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [localDeletedIds, setLocalDeletedIds] = useState<string[]>([]);

  // Folders belonging to this course (excluding deleted and locally deleted)
  const courseFolders = allFolders.filter((f) => f.course === courseName && !f.isDeleted && !localDeletedIds.includes(f.id));
  const activeCourseUsers = courseUsers.filter((u) => !u.isDeleted && !localDeletedIds.includes(u.id));
  const currentFolder = currentFolderId ? courseFolders.find((f) => f.id === currentFolderId) || null : null;

  // Build breadcrumbs path with cycle safeguard
  const breadcrumbs: { id: string | null; name: string }[] = [{ id: null, name: `${courseName} Root` }];
  if (currentFolder) {
    const trail: { id: string; name: string }[] = [];
    const visited = new Set<string>();
    let curr: CourseFolder | undefined = currentFolder;
    while (curr && !visited.has(curr.id)) {
      visited.add(curr.id);
      trail.unshift({ id: curr.id, name: curr.name });
      if (curr.parentId) {
        curr = courseFolders.find((f) => f.id === curr!.parentId);
      } else {
        break;
      }
    }
    breadcrumbs.push(...trail);
  }

  // Child subfolders at current level
  const childFolders = courseFolders.filter((f) => {
    if (currentFolderId === null) {
      return !f.parentId;
    }
    return f.parentId === currentFolderId;
  });

  // Calculate student count for a folder (including nested subfolders)
  const getFolderStudentCount = (folderId: string): number => {
    const getDescendants = (id: string, visited = new Set<string>()): string[] => {
      if (visited.has(id)) return [];
      visited.add(id);
      const children = courseFolders.filter((f) => f.parentId === id);
      const childIds = children.map((c) => c.id);
      return [...childIds, ...childIds.flatMap((cId) => getDescendants(cId, visited))];
    };
    const allRelevantFolderIds = [folderId, ...getDescendants(folderId)];
    return activeCourseUsers.filter((u) => allRelevantFolderIds.includes(u.folderId)).length;
  };

  // Direct students in the current view
  const displayedStudents = activeCourseUsers.filter((u) => {
    if (viewAllStudents && currentFolderId === null) {
      return true;
    }
    if (currentFolderId === null) {
      return !u.folderId;
    }
    return u.folderId === currentFolderId;
  });

  const handleSaveRename = async (folderId: string) => {
    if (!editFolderName.trim()) return;
    try {
      await updateDoc(doc(db, 'folders', folderId), {
        name: editFolderName.trim()
      });
      setEditingFolderId(null);
    } catch (err) {
      console.error('Failed to rename folder', err);
    }
  };

  const handleDeleteFolder = (folder: CourseFolder) => {
    setItemToDelete({
      type: 'folder',
      item: folder,
      name: folder.name
    });
  };

  const handleDeleteStudent = (student: any) => {
    const studentName = student.firstName || student.name || 'Student';
    setItemToDelete({
      type: 'student',
      item: student,
      name: studentName
    });
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      if (itemToDelete.type === 'folder') {
        const folderId = itemToDelete.item.id;
        // Optimistic UI removal
        setLocalDeletedIds(prev => [...prev, folderId]);

        // Soft-delete to Trash Bin
        await setDoc(doc(db, 'folders', folderId), {
          isDeleted: true,
          deletedAt: Date.now()
        }, { merge: true });

        if (currentFolderId === folderId) {
          setCurrentFolderId(itemToDelete.item.parentId || null);
        }
      } else {
        const studentId = itemToDelete.item.id;
        // Optimistic UI removal
        setLocalDeletedIds(prev => [...prev, studentId]);

        // Soft-delete student to Trash Bin
        await setDoc(doc(db, 'users', studentId), {
          isDeleted: true,
          deletedAt: Date.now()
        }, { merge: true });
      }
      setItemToDelete(null);
    } catch (err) {
      console.error('Failed to move item to trash', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isIelts = courseName === 'IELTS';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-2xl shadow-sm">
              <Folder className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">{courseName} Course</h2>
                {isIelts && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3" /> IELTS Zone
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {courseUsers.length} Enrolled Student{courseUsers.length !== 1 ? 's' : ''} • {courseFolders.length} Custom Folder{courseFolders.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCreateFolder(courseName, currentFolder)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-blue-700 font-bold text-xs rounded-xl transition-colors border border-blue-200 shadow-2xs cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-blue-600" />
              <span>{currentFolder ? '+ Subfolder' : '+ New Folder'}</span>
            </button>

            <button
              onClick={() => onOpenCreateStudent(courseName, currentFolder?.id, currentFolder?.name, isIelts)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1E4DB7] hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Create Student</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Breadcrumb Navigation Bar */}
        <div className="px-6 py-3 bg-slate-100/90 border-b border-slate-200/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {currentFolderId && (
              <button
                onClick={() => {
                  const parent = currentFolder?.parentId ? courseFolders.find((f) => f.id === currentFolder.parentId) : null;
                  setCurrentFolderId(parent ? parent.id : null);
                }}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 mr-1 flex items-center gap-1 font-bold text-xs"
                title="Go back up one level"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.id || 'root'}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <button
                    onClick={() => setCurrentFolderId(crumb.id)}
                    disabled={isLast}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-colors ${
                      isLast
                        ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                        : 'hover:bg-slate-200 text-slate-600 cursor-pointer'
                    }`}
                  >
                    <Folder className={`w-3.5 h-3.5 ${isLast ? 'text-blue-600' : 'text-slate-400'}`} />
                    {crumb.name}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {currentFolder && (
            <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Viewing subfolder contents
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
          
          {/* Subfolders Section */}
          <div className="p-6 bg-slate-50/50">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>
                  {currentFolder ? `Subfolders inside "${currentFolder.name}"` : `Folders inside ${courseName}`}
                </span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  {childFolders.length}
                </span>
              </h3>

              <button
                onClick={() => onOpenCreateFolder(courseName, currentFolder)}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                {currentFolder ? '+ Subfolder' : '+ New Folder'}
              </button>
            </div>

            {childFolders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {childFolders.map((folder) => {
                  const studentCount = getFolderStudentCount(folder.id);
                  const subSubCount = courseFolders.filter((f) => f.parentId === folder.id).length;
                  const isRenaming = editingFolderId === folder.id;

                  return (
                    <div
                      key={folder.id}
                      className="group bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 rounded-2xl p-4 transition-all duration-150 flex flex-col justify-between shadow-2xs hover:shadow-sm cursor-pointer"
                      onClick={() => {
                        if (!isRenaming) setCurrentFolderId(folder.id);
                      }}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shadow-2xs">
                              <Folder className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              {isRenaming ? (
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="text"
                                    value={editFolderName}
                                    onChange={(e) => setEditFolderName(e.target.value)}
                                    autoFocus
                                    className="px-2 py-1 text-xs border border-blue-400 rounded-lg bg-white font-bold w-full"
                                  />
                                  <button
                                    onClick={() => handleSaveRename(folder.id)}
                                    className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setEditingFolderId(null)}
                                    className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-700">
                                    {folder.name}
                                  </div>
                                  {folder.description && (
                                    <p className="text-[11px] text-slate-500 truncate">{folder.description}</p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setEditingFolderId(folder.id);
                                setEditFolderName(folder.name);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                              title="Rename"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFolder(folder)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <strong className="text-slate-800">{studentCount}</strong> student{studentCount !== 1 ? 's' : ''}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {subSubCount > 0 && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                              {subSubCount} sub
                            </span>
                          )}
                          <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                            Open <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-5 border border-dashed border-slate-200 rounded-2xl text-center bg-white">
                <p className="text-xs text-slate-500">
                  {currentFolder ? (
                    <span>No subfolders inside <strong>"{currentFolder.name}"</strong> yet.</span>
                  ) : (
                    <span>No custom folders inside <strong>{courseName}</strong> yet.</span>
                  )}
                </p>
                <button
                  onClick={() => onOpenCreateFolder(courseName, currentFolder)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors border border-blue-200 cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  {currentFolder ? 'Create Subfolder Inside This Folder' : 'Create First Folder'}
                </button>
              </div>
            )}
          </div>

          {/* Students in Current Folder */}
          <div className="p-6 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Students in {currentFolder ? `"${currentFolder.name}"` : `${courseName} Main Folder`}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    {displayedStudents.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {currentFolder
                    ? `Students assigned to folder "${currentFolder.name}"`
                    : viewAllStudents
                    ? `Showing all ${courseUsers.length} enrolled students in ${courseName}`
                    : `Showing ${displayedStudents.length} students currently in ${courseName} root main folder`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {currentFolderId === null && (
                  <button
                    onClick={() => setViewAllStudents(!viewAllStudents)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all border cursor-pointer ${
                      viewAllStudents
                        ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {viewAllStudents ? '✓ Showing All' : 'Show All Enrolled'}
                  </button>
                )}

                <button
                  onClick={() => onOpenCreateStudent(courseName, currentFolder?.id, currentFolder?.name, isIelts)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#1E4DB7] hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Student Here</span>
                </button>
              </div>
            </div>

            {displayedStudents.length > 0 ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider border-b border-slate-200">
                      <th className="px-4 py-3 font-bold">Student Name / Account</th>
                      <th className="px-4 py-3 font-bold">Assigned Folder</th>
                      <th className="px-4 py-3 font-bold">Joined</th>
                      <th className="px-4 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {displayedStudents.map((u) => {
                      const createdStr = u.createdAt?.toDate
                        ? format(u.createdAt.toDate(), 'MMM d, yyyy')
                        : typeof u.createdAt === 'number'
                        ? format(new Date(u.createdAt), 'MMM d, yyyy')
                        : 'N/A';

                      const assignedFolderName = u.folderName || (u.folderId ? allFolders.find((f) => f.id === u.folderId)?.name : null) || 'Main Folder';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              {u.photoURL ? (
                                <img
                                  src={u.photoURL}
                                  alt={u.firstName || u.name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200 shrink-0">
                                  {(u.firstName || u.name || 'U')[0].toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-slate-900 leading-snug">
                                  {u.firstName || u.name?.split(' ')[0] || u.displayName || 'Unknown'}
                                  {u.nickname && (
                                    <span className="text-blue-600 ml-1.5 italic font-normal text-xs">
                                      "{u.nickname}"
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 font-medium">
                                  {u.email || u.studentId || u.username || 'No email'}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
                              <Folder className="w-3.5 h-3.5 text-blue-500" />
                              <span className="truncate max-w-[140px]">{assignedFolderName}</span>
                            </span>
                          </td>

                          <td className="px-4 py-3 text-xs text-slate-600">{createdStr}</td>

                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Move Button */}
                              <button
                                onClick={() => onOpenMoveStudent(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition-colors border border-blue-200 shadow-2xs cursor-pointer"
                                title={`Move ${u.name || 'Student'} to another folder`}
                              >
                                <FolderInput className="w-3.5 h-3.5 text-blue-600" />
                                <span>Move</span>
                              </button>

                              {/* Creds Button */}
                              <button
                                onClick={() => onGenerateCredentials(u)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200 shadow-2xs cursor-pointer"
                                title="Generate Student Credentials"
                              >
                                <Key className="w-3.5 h-3.5 text-amber-600" />
                                <span className="hidden sm:inline">Creds</span>
                              </button>

                              {/* View Dashboard */}
                              <Link
                                to={u.course === 'PET' ? `/pet/dashboard?userId=${u.uid || u.id}` : `/ielts/dashboard?userId=${u.uid || u.id}`}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg transition-colors border border-slate-200 shadow-2xs"
                                title="View Dashboard"
                              >
                                <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                                <span className="hidden sm:inline">View</span>
                              </Link>

                              {/* Delete Student Button */}
                              <button
                                onClick={() => handleDeleteStudent(u)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg transition-colors border border-rose-200 shadow-2xs cursor-pointer"
                                title="Move student to Trash Bin"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-center bg-slate-50/40">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  No students in this folder
                </span>
                <p className="text-xs text-slate-500 max-w-sm">
                  Create a student directly here or move an existing student into this folder.
                </p>
                <button
                  onClick={() => onOpenCreateStudent(courseName, currentFolder?.id, currentFolder?.name, isIelts)}
                  className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E4DB7] hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Student Here
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Move to Trash Confirmation Dialog */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Move {itemToDelete.type === 'folder' ? 'Folder' : 'Student'} to Trash?
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Are you sure you want to move <strong>"{itemToDelete.name}"</strong> to the Trash Bin? You can restore it anytime from the Trash Bin next to IELTS.
            </p>
            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? 'Moving...' : 'Move to Trash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
