const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

const search = `                            <div className="flex items-center justify-end gap-2">
                              {isAdmin && (
                                editingLinkId === sub.id ? (
                                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <input autoFocus value={editLinkValue} onChange={(e) => setEditLinkValue(e.target.value)} className="w-32 px-2 py-1 text-sm border rounded" placeholder="URL..." />
                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateSubLink(sub.id); }} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><CheckCircle2 className="w-4 h-4" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingLinkId(null); }} className="text-slate-400 hover:bg-slate-100 p-1 rounded"><X className="w-4 h-4" /></button>
                                  </div>
                                ) : (
                                  <button onClick={(e) => { e.stopPropagation(); setEditingLinkId(sub.id); setEditLinkValue(sub.audioUrl || ''); }} className="text-slate-400 hover:text-blue-600 p-1" title="Edit Link">
                                    <LinkIcon className="w-3.5 h-3.5" />
                                  </button>
                                )
                              )}
                              {isAdmin && (
                                <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>`;

const replace = `                            <div className="flex items-center justify-end gap-2">
                              {isAdmin && (
                                editingLinkId === sub.id ? (
                                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <input autoFocus value={editLinkValue} onChange={(e) => setEditLinkValue(e.target.value)} className="w-32 px-2 py-1 text-sm border rounded" placeholder="URL..." />
                                    <button onClick={(e) => { e.stopPropagation(); handleUpdateSubLink(sub.id); }} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><CheckCircle2 className="w-4 h-4" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingLinkId(null); }} className="text-slate-400 hover:bg-slate-100 p-1 rounded"><X className="w-4 h-4" /></button>
                                  </div>
                                ) : (
                                  <button onClick={(e) => { e.stopPropagation(); setEditingLinkId(sub.id); setEditLinkValue(sub.audioUrl || ''); }} className="text-slate-400 hover:text-blue-600 p-1" title="Edit Link">
                                    <LinkIcon className="w-3.5 h-3.5" />
                                  </button>
                                )
                              )}
                              {isAdmin && sub.assignmentId === 'offline_speaking' && (
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
                                }} className="text-slate-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors" title="Edit Offline Entry">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                              {isAdmin && (
                                <button onClick={(e) => handleDeleteTest(sub.id, e)} className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Test">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>`;

if(code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
    console.log("Patched list action buttons.");
} else {
    console.log("Not found in Dashboard.tsx list view action");
}
