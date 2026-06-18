import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Class, OperationType, ClassMember } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { handleFirestoreError } from '../lib/errorHandler';
import { Plus, Users, LayoutGrid, Globe, Settings, Briefcase, Clock, CheckSquare, Shuffle, Timer, FolderOpen, Lightbulb } from 'lucide-react';

interface Student {
  id?: string;
  name: string;
  classId: string;
  avatarUrl: string;
  joinedAt: any;
  addedBy: string;
}

export function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'classes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Class[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Class);
      });
      setClasses(data);
      if (data.length > 0 && !selectedClassId) {
        setSelectedClassId(data[0].id!);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'classes');
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      return;
    }
    const q = query(collection(db, 'students'), where('classId', '==', selectedClassId), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Student[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Student);
      });
      setStudents(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'students');
    });

    return unsubscribe;
  }, [selectedClassId]);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !user) return;
    try {
      await addDoc(collection(db, 'classes'), {
        name: newClassName.trim(),
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setNewClassName('');
      setIsAddingClass(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'classes');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !user || !selectedClassId) return;
    try {
      // Generate a random seed for the fun-emoji API so each student has a cute unique monster/emoji
      const seed = Math.random().toString(36).substring(7) + newStudentName;
      await addDoc(collection(db, 'students'), {
        classId: selectedClassId,
        name: newStudentName.trim(),
        points: 0,
        avatarSeed: seed,
        createdAt: serverTimestamp()
      });
      setNewStudentName('');
      setIsAddingStudent(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'students');
    }
  };

  if (loading) {
    return <div className="p-8 text-natural-700 animate-pulse">Loading classes...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white font-sans text-natural-800 overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 flex flex-col bg-white border-r border-natural-200 shrink-0">
          <div className="p-4 border-b border-white flex items-center justify-between pt-6">
            <h2 className="text-xs font-bold text-natural-900 px-2">Your Classes</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pt-2 pb-4 scrollbar-thin">
            <button className="w-full flex items-center gap-3 px-6 py-2.5 hover:bg-natural-50 text-natural-800 font-semibold text-sm transition-colors">
              <LayoutGrid className="w-4 h-4 text-natural-500" /> All classes
            </button>
            
            <button 
              onClick={() => setIsAddingClass(true)}
              className="w-full flex items-center gap-3 px-6 py-2.5 hover:bg-natural-50 text-natural-800 font-semibold text-sm transition-colors"
            >
              <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs shadow-sm"><Plus className="w-3 h-3" /></div>
              New Class
            </button>

            <div className="mt-2">
              {classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id!)}
                  className={`w-full flex items-center gap-3 px-6 py-2 transition-colors text-sm ${
                    selectedClassId === cls.id 
                      ? 'bg-natural-100 font-bold text-natural-900 border-l-4 border-l-transparent' // Using a pill shape instead? Actually the image shows a pill highlight. Let's do a pill highlight.
                      : 'hover:bg-natural-50 text-natural-700 font-medium'
                  }`}
                >
                  <div className={`flex items-center gap-3 w-full px-2 py-1.5 rounded-full ${selectedClassId === cls.id ? 'bg-natural-100' : ''}`}>
                    <Globe className="w-4 h-4 text-emerald-500" />
                    {cls.name}
                  </div>
                </button>
              ))}
            </div>

            {isAddingClass && (
              <div className="p-4 bg-natural-50 border-y border-natural-200 mt-2 text-sm">
                <form onSubmit={handleAddClass}>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Class Name"
                    value={newClassName}
                    onChange={e => setNewClassName(e.target.value)}
                    className="w-full p-2 border border-natural-300 rounded-lg mb-2 outline-none focus:border-purple-600"
                  />
                  <div className="flex justify-end gap-2 text-xs font-semibold">
                    <button type="button" onClick={() => setIsAddingClass(false)} className="text-natural-500 hover:text-natural-900">Cancel</button>
                    <button type="submit" className="text-white bg-natural-900 px-3 py-1 rounded-md">Save</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-white overflow-y-auto">
          {selectedClassId ? (
            <>
              <div className="flex items-center justify-between px-8 py-4 bg-white sticky top-0 z-10 border-b border-transparent">
                <div className="flex-1" />
                <div className="bg-natural-100 p-1 flex rounded-full font-semibold text-sm">
                  <button className="px-6 py-1 bg-white rounded-full shadow-sm text-natural-900">Students</button>
                  <button className="px-6 py-1 text-natural-600 hover:text-natural-900 transition-colors">Groups</button>
                </div>
                <div className="flex-1 flex justify-end">
                  <button className="flex items-center gap-2 px-4 py-1.5 bg-natural-100 hover:bg-natural-200 rounded-full text-sm font-bold text-natural-800 transition-colors">
                    <Settings className="w-4 h-4" /> Points
                  </button>
                </div>
              </div>

              <div className="p-8 pb-32">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5">
                  
                  {/* Whole Class Card */}
                  <div className="flex flex-col items-center">
                    <div className="relative bg-white border border-natural-200 shadow-sm rounded-3xl w-full aspect-[4/4.5] flex flex-col items-center justify-between p-3 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex-1 flex items-center justify-center">
                        <Users className="w-12 h-12 text-emerald-500" />
                      </div>
                      <span className="font-medium text-xs text-natural-800 text-center w-full mt-1">Whole Class</span>
                      <div className="absolute top-2 right-2 translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white font-bold px-1.5 min-w-[24px] h-6 flex items-center justify-center rounded-full text-xs shadow-sm border-2 border-white">
                        130
                      </div>
                    </div>
                  </div>

                  {/* Students Render */}
                  {students.map(student => (
                    <div key={student.id} className="flex flex-col items-center">
                      <div className="relative bg-white border border-natural-200 shadow-sm rounded-3xl w-full aspect-[4/4.5] flex flex-col items-center justify-between p-3 hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex-1 flex flex-col items-center justify-end pb-1 overflow-visible">
                          {/* We make the image slightly break out, or just center it nicely */}
                          <img 
                            src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${student.avatarSeed}&backgroundColor=transparent`} 
                            alt={student.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`;
                            }}
                            className="w-14 h-14 object-contain group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <span className="font-medium text-xs text-natural-800 text-center line-clamp-1 w-full bg-white">{student.name}</span>
                        
                        <div className="absolute top-2 right-2 translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs shadow-sm border-2 border-white">
                          {student.points}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Student Button */}
                  {!isAddingStudent ? (
                    <div className="flex flex-col items-center">
                      <button 
                        onClick={() => setIsAddingStudent(true)}
                        className="bg-white border text-purple-600 border-natural-200 rounded-3xl p-3 flex flex-col items-center justify-center w-full aspect-[4/4.5] hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-center">Add students</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white border border-natural-300 rounded-3xl p-3 flex flex-col w-full aspect-[4/4.5]">
                      <form onSubmit={handleAddStudent} className="flex flex-col h-full w-full">
                        <input
                          type="text"
                          autoFocus
                          placeholder="Name"
                          value={newStudentName}
                          onChange={e => setNewStudentName(e.target.value)}
                          className="w-full text-center p-2 mb-2 border-b border-natural-200 focus:outline-none focus:border-purple-600 text-sm"
                        />
                        <div className="flex gap-1 mt-auto text-xs font-semibold">
                          <button type="button" onClick={() => setIsAddingStudent(false)} className="flex-1 py-1 text-natural-500 hover:bg-natural-100 rounded-lg">Cancel</button>
                          <button type="submit" className="flex-1 py-1 text-white bg-purple-600 hover:bg-purple-700 rounded-lg">Add</button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-natural-500 font-medium p-8 text-center flex-col gap-4">
              <div className="w-16 h-16 border-4 border-natural-200 border-dashed rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-natural-300" />
              </div>
              <p>Create or select a class to view your students.</p>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="h-14 border-t border-natural-200 flex bg-white shrink-0 z-20">
        <div className="w-60 border-r border-natural-200 flex items-center px-4 md:px-6 text-xs text-natural-700 font-bold gap-1 shrink-0">
          Teacher resources <span className="text-natural-400 mx-1">&bull;</span> Support <span className="text-natural-400 ml-1">↗</span>
        </div>
        <div className="flex-1 flex items-center justify-left md:justify-center overflow-x-auto px-4 scrollbar-hide text-xs font-bold text-natural-700 gap-4 sm:gap-6 md:gap-8">
          <button className="flex items-center gap-2 hover:text-purple-600 whitespace-nowrap transition-colors text-purple-600">
            <LayoutGrid className="w-4 h-4" /> Toolkit
          </button>
          <button className="flex items-center gap-2 hover:text-purple-600 whitespace-nowrap transition-colors">
            <Clock className="w-4 h-4 text-purple-600" /> Attendance
          </button>
          <button className="flex items-center gap-2 hover:text-purple-600 whitespace-nowrap transition-colors">
            <CheckSquare className="w-4 h-4 text-purple-600" /> Select multiple
          </button>
          <button className="flex items-center gap-2 hover:text-purple-600 whitespace-nowrap transition-colors">
            <Shuffle className="w-4 h-4 text-natural-500" /> Random
          </button>
          <button className="flex items-center gap-2 hover:text-purple-600 whitespace-nowrap transition-colors">
            <Timer className="w-4 h-4 text-natural-500" /> Timer
          </button>
          <button className="flex items-center gap-2 hover:text-purple-600 whitespace-nowrap transition-colors">
            <FolderOpen className="w-4 h-4 text-natural-500" /> Portfolios
          </button>
          <button className="flex items-center gap-2 hover:text-purple-600 whitespace-nowrap transition-colors">
            <Lightbulb className="w-4 h-4 text-natural-500" /> Big Ideas
          </button>
        </div>
      </footer>
    </div>
  );
}
