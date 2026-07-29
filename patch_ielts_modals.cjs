const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

const stateInjectionPoint = `  const navigate = useNavigate();`;
const newState = `  const navigate = useNavigate();
  const [showAddOffline, setShowAddOffline] = useState(false);
  const [offlineForm, setOfflineForm] = useState({ name: '', link: '', score: '', date: new Date().toISOString().split('T')[0], feedback: '' });
  const [viewFeedbackItem, setViewFeedbackItem] = useState<any>(null);`;
code = code.replace(stateInjectionPoint, newState);

const addOfflineSpeakingPoint = `                <button
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

const newAddOfflineSpeaking = `                <button
                  onClick={() => {
                      setOfflineForm({ name: 'Offline Speaking Assignment', link: '', score: '', date: new Date().toISOString().split('T')[0], feedback: '' });
                      setShowAddOffline(true);
                  }}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Offline Entry
                </button>`;
// Notice I changed to emerald to match the offline section
code = code.replace(addOfflineSpeakingPoint, newAddOfflineSpeaking);

const offlineSpeakingMapPoint = `                        <button onClick={() => { navigate(isShared ? \`/shared/results/\${sub.id}\` : \`/results/\${sub.id}\`); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors text-center whitespace-nowrap">
                          Feedback
                        </button>`;

const newOfflineSpeakingMapPoint = `                        <button onClick={() => setViewFeedbackItem(sub)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors text-center whitespace-nowrap">
                          Feedback
                        </button>`;
code = code.replace(offlineSpeakingMapPoint, newOfflineSpeakingMapPoint);

const modalsInjectionPoint = `      </div>
    </div>
  );
}`;

const newModals = `        {/* Add Offline Modal */}
        {showAddOffline && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-[slideUp_0.3s_ease-out_forwards]">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h2 className="text-xl font-bold text-slate-800">Add Offline Speaking Entry</h2>
                        <button onClick={() => setShowAddOffline(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Assignment Name</label>
                            <input type="text" value={offlineForm.name} onChange={(e) => setOfflineForm({...offlineForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" placeholder="e.g. Speaking Test 1" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Google Drive Link (Audio/Video)</label>
                            <input type="text" value={offlineForm.link} onChange={(e) => setOfflineForm({...offlineForm, link: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" placeholder="Paste link here" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Band Score</label>
                                <input type="text" value={offlineForm.score} onChange={(e) => setOfflineForm({...offlineForm, score: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" placeholder="e.g. 6.5" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                                <input type="date" value={offlineForm.date} onChange={(e) => setOfflineForm({...offlineForm, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Teacher Feedback</label>
                            <textarea value={offlineForm.feedback} onChange={(e) => setOfflineForm({...offlineForm, feedback: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all min-h-[120px] resize-y" placeholder="Write feedback here..."></textarea>
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                        <button onClick={() => setShowAddOffline(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors text-sm">Cancel</button>
                        <button onClick={async () => {
                            try {
                                const refId = doc(collection(db, 'submissions')).id;
                                await setDoc(doc(db, 'submissions', refId), {
                                    assignmentId: 'offline_speaking',
                                    assignmentTitle: offlineForm.name || 'Offline Speaking Assignment',
                                    assignmentType: 'speaking',
                                    userId: targetUserId,
                                    answers: 'Offline submission',
                                    audioUrl: offlineForm.link || '',
                                    bandScore: parseFloat(offlineForm.score) || null,
                                    teacherComment: offlineForm.feedback || '',
                                    createdAt: serverTimestamp(),
                                });
                                setShowAddOffline(false);
                            } catch(err) {
                                console.error(err);
                            }
                        }} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors text-sm shadow-sm shadow-emerald-200">Save Entry</button>
                    </div>
                </div>
            </div>
        )}

        {/* View Feedback Modal */}
        {viewFeedbackItem && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-xl relative animate-[slideUp_0.3s_ease-out_forwards]">
                    <button 
                        onClick={() => setViewFeedbackItem(null)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Feedback: {viewFeedbackItem.assignmentTitle || 'Offline Speaking Assignment'}</h2>
                    <p className="text-sm text-slate-500 mb-6">
                      Band: {viewFeedbackItem.bandScore !== undefined && viewFeedbackItem.bandScore !== null ? viewFeedbackItem.bandScore.toFixed(1) : 'Pending'} • {viewFeedbackItem.createdAt ? format(viewFeedbackItem.createdAt, 'MMM d, yyyy') : 'N/A'}
                    </p>
                    
                    {viewFeedbackItem.audioUrl && (
                        <div className="mb-4">
                            <a href={viewFeedbackItem.audioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#1E4DB7] hover:text-blue-800 font-medium bg-blue-50 p-3 rounded-xl">
                                <Upload className="w-5 h-5" /> View Video / Audio in Google Drive
                            </a>
                        </div>
                    )}
                    
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-slate-700 whitespace-pre-wrap max-h-[50vh] overflow-y-auto">
                        {viewFeedbackItem.teacherComment || viewFeedbackItem.aiFeedback || viewFeedbackItem.feedback || "No feedback provided for this activity."}
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                        <button 
                            onClick={() => setViewFeedbackItem(null)}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}`;

code = code.replace(modalsInjectionPoint, newModals);

fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
