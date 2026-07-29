const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

const search = `{isEditingProfile && (`;
const replace = `{showAddOffline && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Add Offline Entry</h3>
              <button onClick={() => setShowAddOffline(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Test Name</label>
                <input 
                  type="text"
                  value={offlineForm.name}
                  onChange={(e) => setOfflineForm({...offlineForm, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
                  placeholder="e.g. Offline Speaking Assignment"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Link (e.g. Google Drive Video/Audio)</label>
                <input 
                  type="url"
                  value={offlineForm.link}
                  onChange={(e) => setOfflineForm({...offlineForm, link: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Band Score</label>
                <input 
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  value={offlineForm.score}
                  onChange={(e) => setOfflineForm({...offlineForm, score: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
                  placeholder="e.g. 6.5"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                <input 
                  type="date"
                  value={offlineForm.date}
                  onChange={(e) => setOfflineForm({...offlineForm, date: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-900"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Feedback / Notes</label>
                <textarea 
                  value={offlineForm.feedback}
                  onChange={(e) => setOfflineForm({...offlineForm, feedback: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-slate-900 resize-none"
                  placeholder="Add any teacher feedback or personal notes here..."
                ></textarea>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => setShowAddOffline(false)} 
                  className="flex-1 py-3.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                      if (!targetUserId) return;
                      try {
                        const bandScore = parseFloat(offlineForm.score);
                        await addDoc(collection(db, 'submissions'), {
                          assignmentId: 'offline_speaking',
                          assignmentTitle: offlineForm.name || 'Offline Speaking Assignment',
                          assignmentType: 'speaking',
                          userId: targetUserId,
                          audioUrl: offlineForm.link,
                          bandScore: isNaN(bandScore) ? null : bandScore,
                          feedback: offlineForm.feedback,
                          createdAt: serverTimestamp(),
                        });
                        setShowAddOffline(false);
                      } catch (err) {
                        console.error(err);
                        alert("Failed to save entry");
                      }
                  }} 
                  className="flex-1 py-3.5 bg-emerald-600 text-white font-bold hover:bg-emerald-700 rounded-xl transition-colors shadow-lg shadow-emerald-500/30"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {isEditingProfile && (`;

code = code.replace(search, replace);
fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
