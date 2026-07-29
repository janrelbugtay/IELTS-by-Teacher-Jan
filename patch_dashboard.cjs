const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

// 1. Update initial state
const stateSearch = `const [offlineForm, setOfflineForm] = useState({ name: 'Offline Speaking Assignment', link: '', score: '', date: new Date().toISOString().split('T')[0], feedback: '' });`;
const stateReplace = `const [offlineForm, setOfflineForm] = useState({ id: '', name: 'Offline Speaking Assignment', link: '', score: '', date: new Date().toISOString().split('T')[0], feedback: '', vietnameseTranslation: '' });`;
if(code.includes(stateSearch)) {
    code = code.replace(stateSearch, stateReplace);
    console.log("Replaced offlineForm state");
}

// 2. Update Add button to reset state
const addBtnSearch = `setOfflineForm({ name: 'Offline Speaking Assignment', link: '', score: '', date: new Date().toISOString().split('T')[0], feedback: '' });`;
const addBtnReplace = `setOfflineForm({ id: '', name: 'Offline Speaking Assignment', link: '', score: '', date: new Date().toISOString().split('T')[0], feedback: '', vietnameseTranslation: '' });`;
if(code.includes(addBtnSearch)) {
    code = code.replace(addBtnSearch, addBtnReplace);
    console.log("Replaced add offline button reset");
}

// 3. Update Modal Save Entry logic
const saveSearch = `onClick={async () => {
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
                          createdAt: offlineForm.date ? new Date(offlineForm.date) : serverTimestamp(),
                        });
                        setShowAddOffline(false);
                      } catch (err) {
                        console.error(err);
                        alert("Failed to save entry");
                      }
                  }} `;

const saveReplace = `onClick={async () => {
                      if (!targetUserId) return;
                      try {
                        const bandScore = parseFloat(offlineForm.score);
                        const payload = {
                          assignmentTitle: offlineForm.name || 'Offline Speaking Assignment',
                          audioUrl: offlineForm.link,
                          bandScore: isNaN(bandScore) ? null : bandScore,
                          feedback: offlineForm.feedback,
                          vietnameseTranslation: offlineForm.vietnameseTranslation,
                          createdAt: offlineForm.date ? new Date(offlineForm.date) : serverTimestamp(),
                        };
                        if (offlineForm.id) {
                            await updateDoc(doc(db, 'submissions', offlineForm.id), payload);
                        } else {
                            await addDoc(collection(db, 'submissions'), {
                              ...payload,
                              assignmentId: 'offline_speaking',
                              assignmentType: 'speaking',
                              userId: targetUserId,
                            });
                        }
                        setShowAddOffline(false);
                      } catch (err) {
                        console.error(err);
                        alert("Failed to save entry");
                      }
                  }} `;

if(code.includes(saveSearch)) {
    code = code.replace(saveSearch, saveReplace);
    console.log("Replaced modal save logic");
}

// 4. Update Modal title
const titleSearch = `<h3 className="text-2xl font-bold text-slate-900">Add Offline Entry</h3>`;
const titleReplace = `<h3 className="text-2xl font-bold text-slate-900">{offlineForm.id ? 'Edit Offline Entry' : 'Add Offline Entry'}</h3>`;
if(code.includes(titleSearch)) {
    code = code.replace(titleSearch, titleReplace);
    console.log("Replaced modal title");
}

// 5. Add Vietnamese translation field
const translationField = `
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Vietnamese Translation</label>
                <textarea 
                  value={offlineForm.vietnameseTranslation || ''}
                  onChange={(e) => setOfflineForm({...offlineForm, vietnameseTranslation: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-slate-900 resize-none"
                  placeholder="Bản dịch tiếng Việt..."
                ></textarea>
              </div>`;
const txSearch = `placeholder="Add any teacher feedback or personal notes here..."
                ></textarea>
              </div>`;
if(code.includes(txSearch)) {
    code = code.replace(txSearch, txSearch + translationField);
    console.log("Added translation field");
}

// 6. Add Edit button to offline grid view
// find the inline edit for test title in offline grid
const gridTitleSearch = `
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-slate-900 line-clamp-1">{title}</h3>
                      </div>`;
const gridTitleReplace = `
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-slate-900 line-clamp-1">{title}</h3>
                        {isAdmin && (
                            <button onClick={(e) => {
                                e.stopPropagation();
                                setOfflineForm({
                                    id: sub.id,
                                    name: sub.assignmentTitle || 'Offline Speaking Assignment',
                                    link: sub.audioUrl || '',
                                    score: sub.bandScore !== undefined && sub.bandScore !== null ? sub.bandScore.toString() : '',
                                    date: sub.createdAt ? new Date(sub.createdAt.seconds ? sub.createdAt.seconds * 1000 : sub.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                                    feedback: sub.feedback || sub.teacherComment || sub.aiFeedback || '',
                                    vietnameseTranslation: sub.vietnameseTranslation || ''
                                });
                                setShowAddOffline(true);
                            }} className="text-slate-400 hover:text-blue-600 p-1">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                      </div>`;
if(code.includes(gridTitleSearch)) {
    code = code.replace(gridTitleSearch, gridTitleReplace);
    console.log("Replaced grid title with edit button");
}

fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
console.log("Dashboard patching done.");
