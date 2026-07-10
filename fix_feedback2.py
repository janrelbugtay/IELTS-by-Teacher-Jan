import re

with open("src/pages/pet/Dashboard.tsx", "r") as f:
    content = f.read()

# Add viewFeedback state
old_state = "    const [offlineForm, setOfflineForm] = useState<any>({});"
new_state = "    const [offlineForm, setOfflineForm] = useState<any>({});\n    const [viewFeedbackItem, setViewFeedbackItem] = useState<any>(null);"
content = content.replace(old_state, new_state)

# Add onViewFeedback prop to components
old_speaking_render = "<SpeakingActivity isAdmin={isAdmin} data={speakingData} onDelete={handleDeleteActivity} onAddOffline={handleAddOffline} />"
new_speaking_render = "<SpeakingActivity isAdmin={isAdmin} data={speakingData} onDelete={handleDeleteActivity} onAddOffline={handleAddOffline} onViewFeedback={setViewFeedbackItem} />"
content = content.replace(old_speaking_render, new_speaking_render)

old_writing_render = "<WritingActivity isAdmin={isAdmin} data={writingData} onDelete={handleDeleteActivity} onAddOffline={handleAddOffline} />"
new_writing_render = "<WritingActivity isAdmin={isAdmin} data={writingData} onDelete={handleDeleteActivity} onAddOffline={handleAddOffline} onViewFeedback={setViewFeedbackItem} />"
content = content.replace(old_writing_render, new_writing_render)

# Add Feedback Modal at the end of return statement
old_end = """                        </div>
                    </div>
                )}
            </main>
        </div>
    );"""
new_end = """                        </div>
                    </div>
                )}

                {/* Feedback Modal */}
                {viewFeedbackItem && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl relative animate-[slideUp_0.3s_ease-out_forwards]">
                            <button 
                                onClick={() => setViewFeedbackItem(null)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Feedback: {viewFeedbackItem.name}</h2>
                            <p className="text-sm text-slate-500 mb-6">Score: {viewFeedbackItem.score} • {viewFeedbackItem.date}</p>
                            
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-slate-700 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                                {viewFeedbackItem.feedback || viewFeedbackItem.aiFeedback || viewFeedbackItem.teacherComment || "No feedback provided for this activity."}
                            </div>
                            
                            <div className="mt-6 flex justify-end">
                                <button 
                                    onClick={() => setViewFeedbackItem(null)}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );"""
content = content.replace(old_end, new_end)

with open("src/pages/pet/Dashboard.tsx", "w") as f:
    f.write(content)
