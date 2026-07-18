import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, X, Send, User, MessageSquare, Users, ChevronLeft, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ChatBox() {
  const { user, userCourse, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'group' | 'dm'>('group');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [adminCourseSelect, setAdminCourseSelect] = useState(userCourse || 'IELTS');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentCourse = isAdmin ? adminCourseSelect : (userCourse || 'IELTS');
  
  // Room ID Logic
  let roomId = '';
  if (activeTab === 'group') {
    roomId = `course_${currentCourse.toLowerCase().trim()}`;
  } else if (activeTab === 'dm' && selectedUser) {
    const ids = [user?.uid || "", selectedUser.id || ""].sort((a, b) => a.localeCompare(b));
    roomId = `dm_${ids[0]}_${ids[1]}`;
  }

  // Fetch Available Users for DM
  useEffect(() => {
    if (!user || !isOpen || activeTab !== 'dm') return;
    
    const fetchUsers = async () => {
      try {
        let usersQuery;
        if (isAdmin) {
          usersQuery = query(collection(db, 'users'));
        } else {
          // If not admin, get admin and users in same course
          usersQuery = query(collection(db, 'users'), where('course', '==', userCourse || 'IELTS'));
        }
        
        const snapshot = await getDocs(usersQuery);
        let users = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        
        // Remove self
        users = users.filter(u => u.id !== user.uid);
        
        // If not admin, add Teacher Jan to the list if not already there
        if (!isAdmin) {
          const hasAdmin = users.some(u => u.role === 'admin');
          if (!hasAdmin) {
            users.unshift({
              id: 'admin_id_placeholder', // Usually we'd need actual admin ID, but if we query by role='admin' maybe?
              username: 'Teacher Jan',
              role: 'admin',
              firstName: 'Teacher',
              lastName: 'Jan'
            });
            // Better yet, just fetch the admin separately if needed, but let's assume admin has a known doc or we can just show "Teacher Jan" 
            // Wait, we can't DM an unknown ID. Let's fetch admin by role.
          }
        }
        setAvailableUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    
    // Actually let's just fetch all users for now and filter out self.
    const fetchAllUsers = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'users'));
            let allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
            
            if (!isAdmin) {
                // Students only see admin and classmates
                allUsers = allUsers.filter(u => (u.course === userCourse || u.role === 'admin' || ['janrelbugtay03@gmail.com', 'khaisangschool.edu.vn@gmail.com'].includes(u.email || '')) && u.id !== user.uid);
            } else {
                allUsers = allUsers.filter(u => u.id !== user.uid);
            }
            allUsers = allUsers.map(u => (['janrelbugtay03@gmail.com', 'khaisangschool.edu.vn@gmail.com'].includes(u.email || '')) ? { ...u, role: 'admin' } : u);
            setAvailableUsers(allUsers);
        } catch(e) {}
    }
    fetchAllUsers();
  }, [isOpen, activeTab, user, isAdmin, userCourse]);

  // Fetch Messages
  useEffect(() => {
    if (!user || !roomId) {
      setMessages([]);
      return;
    }
    
    const q = query(
      collection(db, 'chats'),
      where('roomId', '==', roomId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data({ serverTimestamps: "estimate" }) as any)
      }));
      
      msgs.sort((a: any, b: any) => {
        const now = Date.now();
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (typeof a.createdAt === 'number' ? a.createdAt : now));
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (typeof b.createdAt === 'number' ? b.createdAt : now));
        return timeA - timeB;
      });
      
      if (msgs.length > 50) msgs = msgs.slice(msgs.length - 50);
      
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => {
      console.error("Chat onSnapshot error:", error);
    });

    return () => unsubscribe();
  }, [roomId, user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !roomId) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'chats'), {
        roomId,
        text: messageText,
        senderId: user.uid,
        senderName: user.displayName || user.email?.split('@')[0] || 'User',
        senderRole: isAdmin ? 'admin' : 'student',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!user) return null;

  const filteredUsers = availableUsers.filter(u => 
    (u.role === 'admin' && 'teacher jan'.includes(searchQuery.toLowerCase())) ||
    (u.nickname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.lastName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center text-white z-50 hover:shadow-[0_8px_40px_rgb(59,130,246,0.3)] transition-all"
          >
            <MessageCircle size={32} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 h-[550px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-white flex justify-between items-center z-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/10" />
              <div className="flex items-center gap-3 relative z-10">
                {(activeTab === 'dm' && selectedUser) ? (
                  <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                    <ChevronLeft size={20} />
                  </button>
                ) : (
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
                    <MessageSquare size={20} className="text-blue-300" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-[15px] leading-tight tracking-wide">
                    {activeTab === 'dm' && selectedUser ? (selectedUser.role === 'admin' ? 'Teacher Jan' : (selectedUser.nickname || selectedUser.firstName || selectedUser.name || selectedUser.username)) : 'ERA Chat'}
                  </h3>
                  <p className="text-[11px] text-slate-300 font-medium">
                    {activeTab === 'dm' && selectedUser ? (selectedUser.role === 'admin' ? 'Admin / Teacher' : selectedUser.course) : (isAdmin ? 'Admin View' : 'Connect with peers & admin')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors relative z-10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs (Hide if in a DM conversation) */}
            {!(activeTab === 'dm' && selectedUser) && (
              <div className="flex bg-slate-50 border-b border-slate-200 p-1">
                <button
                  onClick={() => setActiveTab('group')}
                  className={`flex-1 py-2 text-sm font-semibold transition-all rounded-md flex items-center justify-center gap-2 ${activeTab === 'group' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <Users size={16} />
                  Group Chat
                </button>
                <button
                  onClick={() => setActiveTab('dm')}
                  className={`flex-1 py-2 text-sm font-semibold transition-all rounded-md flex items-center justify-center gap-2 ${activeTab === 'dm' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <User size={16} />
                  Direct Messages
                </button>
              </div>
            )}

            {/* Admin Course Selector (Group Chat) */}
            {isAdmin && activeTab === 'group' && (
              <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
                <label className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Course Channel</label>
                <select 
                  value={adminCourseSelect} 
                  onChange={(e) => setAdminCourseSelect(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 font-medium text-sm text-slate-700 transition-all cursor-pointer"
                >
                  <option value="Pre-starter">Pre-starter</option>
                  <option value="Starter">Starter</option>
                  <option value="Movers">Movers</option>
                  <option value="Flyers">Flyers</option>
                  <option value="KET">KET</option>
                  <option value="PET">PET</option>
                  <option value="IELTS">IELTS</option>
                </select>
              </div>
            )}

            {/* Content Area */}
            {activeTab === 'dm' && !selectedUser ? (
              // Users List
              <div className="flex-1 overflow-y-auto bg-white flex flex-col">
                <div className="p-3 border-b border-slate-100 sticky top-0 bg-white z-10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <User size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No users found.</p>
                    </div>
                  ) : (
                    filteredUsers.map(u => (
                      <div 
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${u.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-indigo-500' : 'bg-gradient-to-br from-blue-400 to-cyan-500'}`}>
                          {u.role === 'admin' ? '👨‍🏫' : ((u.nickname || u.firstName || u.name || u.username || 'U')[0]?.toUpperCase())}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{u.role === 'admin' ? 'Teacher Jan' : (u.nickname || u.firstName || u.name || u.username || 'User')}</p>
                          <p className="text-xs text-slate-500">{u.role === 'admin' ? 'Admin' : u.course}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              // Messages Chat
              <>
                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
                  {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 h-full opacity-60">
                      <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center">
                        <MessageCircle size={32} className="text-slate-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-600">No messages yet</p>
                        <p className="text-xs text-slate-500 mt-1">Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = msg.senderId === user.uid;
                      const isTeacher = msg.senderRole === 'admin';
                      const showName = !isMe && (i === 0 || messages[i-1].senderId !== msg.senderId);
                      const msgTime = msg.createdAt?.toDate ? msg.createdAt.toDate() : new Date();

                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={msg.id} 
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          {showName && (
                            <span className={`text-[11px] font-semibold mb-1 ml-1 tracking-wide ${isTeacher ? 'text-indigo-600' : 'text-slate-500'}`}>
                              {isTeacher ? '👨‍🏫 Teacher Jan' : (availableUsers.find(u => u.id === msg.senderId)?.nickname || availableUsers.find(u => u.id === msg.senderId)?.firstName || availableUsers.find(u => u.id === msg.senderId)?.name || msg.senderName)}
                            </span>
                          )}
                          <div className="flex items-end gap-1">
                            <div 
                              className={`max-w-[240px] sm:max-w-[280px] px-4 py-2.5 text-[14px] leading-relaxed shadow-sm relative group ${
                                isMe 
                                  ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm' 
                                  : isTeacher
                                    ? 'bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-2xl rounded-bl-sm font-medium'
                                    : 'bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-bl-sm'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-slate-100 shadow-[0_-4px_10px_rgb(0,0,0,0.02)] z-10">
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      <Send size={18} className="ml-1" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
