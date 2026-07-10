import re

with open("src/pages/pet/Dashboard.tsx", "r") as f:
    content = f.read()

# Add a feedback field to offline form
old_state = "        setOfflineForm({ name: '', link: '', score: '', correct: '', time: '', date: new Date().toISOString().split('T')[0] });"
new_state = "        setOfflineForm({ name: '', link: '', score: '', correct: '', time: '', date: new Date().toISOString().split('T')[0], feedback: '' });"
content = content.replace(old_state, new_state)

old_new_entry = """        const newEntry = {
            name: offlineForm.name || "Offline Entry",
            link: offlineForm.link || "",
            score: offlineForm.score || "0",
            correct: offlineForm.correct || "-",
            time: offlineForm.time || "-",
            date: entryDate,
            band: offlineForm.score,
            words: offlineForm.correct
        };"""
new_new_entry = """        const newEntry = {
            name: offlineForm.name || "Offline Entry",
            link: offlineForm.link || "",
            score: offlineForm.score || "0",
            correct: offlineForm.correct || "-",
            time: offlineForm.time || "-",
            date: entryDate,
            band: offlineForm.score,
            words: offlineForm.correct,
            feedback: offlineForm.feedback || ""
        };"""
content = content.replace(old_new_entry, new_new_entry)

# Add feedback textarea to modal
old_form = """                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                                    <input 
                                        type="date"
                                        value={offlineForm.date}
                                        onChange={(e) => setOfflineForm({...offlineForm, date: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>"""
new_form = """                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                                    <input 
                                        type="date"
                                        value={offlineForm.date}
                                        onChange={(e) => setOfflineForm({...offlineForm, date: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Feedback / Notes (Optional)</label>
                                    <textarea 
                                        value={offlineForm.feedback || ''}
                                        onChange={(e) => setOfflineForm({...offlineForm, feedback: e.target.value})}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                                        placeholder="Add any teacher feedback or personal notes here..."
                                    />
                                </div>
                            </div>"""
content = content.replace(old_form, new_form)

# Add onViewFeedback prop to SpeakingActivity
old_speaking = "const SpeakingActivity = ({ isAdmin, data, onDelete, onAddOffline }: any) => ("
new_speaking = "const SpeakingActivity = ({ isAdmin, data, onDelete, onAddOffline, onViewFeedback }: any) => ("
content = content.replace(old_speaking, new_speaking)

old_speaking_btn = """<button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-1.5 rounded-lg transition-colors border border-slate-200">Feedback</button>"""
new_speaking_btn = """<button onClick={() => onViewFeedback(item)} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-1.5 rounded-lg transition-colors border border-slate-200">Feedback</button>"""
content = content.replace(old_speaking_btn, new_speaking_btn)

# Same for WritingActivity
old_writing = "const WritingActivity = ({ isAdmin, data, onDelete, onAddOffline }: any) => ("
new_writing = "const WritingActivity = ({ isAdmin, data, onDelete, onAddOffline, onViewFeedback }: any) => ("
content = content.replace(old_writing, new_writing)

old_writing_btn = """<button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors border border-slate-200">Feedback</button>"""
new_writing_btn = """<button onClick={() => onViewFeedback(test)} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors border border-slate-200">Feedback</button>"""
content = content.replace(old_writing_btn, new_writing_btn)

with open("src/pages/pet/Dashboard.tsx", "w") as f:
    f.write(content)
