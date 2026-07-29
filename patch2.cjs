const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');
const search = `                 <button
                   onClick={async () => {
                     try {
                       const refId = doc(collection(db, 'submissions')).id;
                       await setDoc(doc(db, 'submissions', refId), {
                         assignmentId: 'offline_speaking',
                         assignmentTitle: 'Offline Speaking Assignment',
                         assignmentType: 'speaking',
                         userId: targetUserId,
                         answers: 'Offline submission',
                         createdAt: serverTimestamp(),
                       });
                     } catch(err) {
                       console.error(err);
                     }
                   }}
                   className="flex items-center gap-2 bg-[#1E4DB7] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors"
                 >
                   <Plus className="w-4 h-4" /> Add Offline Entry
                 </button>`;

const replace = `                 <button
                  onClick={() => {
                      setOfflineForm({ name: 'Offline Speaking Assignment', link: '', score: '', date: new Date().toISOString().split('T')[0], feedback: '' });
                      setShowAddOffline(true);
                  }}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Offline Entry
                </button>`;

code = code.replace(search, replace);
fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
