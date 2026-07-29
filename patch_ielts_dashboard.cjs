const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

const speakingRecordingsSection = `{/* Speaking Recordings */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Mic className="w-6 h-6 text-purple-600" /> Speaking Recordings
            </h2>
            <button onClick={() => navigate(isShared ? \`/shared/dashboard/\${targetUserId}?tab=speaking\` : '/ielts/dashboard?tab=speaking')} className="text-sm font-bold text-[#1E4DB7] hover:text-blue-800 transition-colors uppercase tracking-widest flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getSubmissionsByType('speaking').slice(0, 4).map(sub => {`;

const newSpeakingRecordingsSection = `{/* Speaking Recordings */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Mic className="w-6 h-6 text-purple-600" /> Speaking Practice Tests
            </h2>
            <button onClick={() => navigate(isShared ? \`/shared/dashboard/\${targetUserId}?tab=speaking\` : '/ielts/dashboard?tab=speaking')} className="text-sm font-bold text-[#1E4DB7] hover:text-blue-800 transition-colors uppercase tracking-widest flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {getSubmissionsByType('speaking').filter(s => s.assignmentId !== 'offline_speaking').slice(0, 4).map(sub => {`;

code = code.replace(speakingRecordingsSection, newSpeakingRecordingsSection);

const speakingEmptyCheck = `            {getSubmissionsByType('speaking').length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-[1.5rem] border border-slate-200 border-dashed">
                No speaking recordings yet.
              </div>
            )}`;

const newSpeakingEmptyCheck = `            {getSubmissionsByType('speaking').filter(s => s.assignmentId !== 'offline_speaking').length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-[1.5rem] border border-slate-200 border-dashed">
                No speaking practice tests yet.
              </div>
            )}
          </div>
        </section>

        {/* Offline Speaking Assignments */}
        {getSubmissionsByType('speaking').filter(s => s.assignmentId === 'offline_speaking').length > 0 && (
          <section className="space-y-6 mt-12">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Mic className="w-6 h-6 text-emerald-600" /> Offline Speaking Assignments
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getSubmissionsByType('speaking').filter(s => s.assignmentId === 'offline_speaking').slice(0, 4).map(sub => {
                const title = sub.assignmentTitle || 'Offline Speaking Assignment';
                return (
                  <div key={sub.id} className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow">
                    <div className="sm:w-[45%] relative bg-slate-800 group flex items-center justify-center min-h-[160px]">
                      <Mic className="w-12 h-12 text-emerald-400 opacity-50" />
                    </div>
                    <div className="p-5 sm:w-[55%] flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-slate-900 line-clamp-1">{title}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3 mt-1">
                        {sub.bandScore !== undefined && sub.bandScore !== null ? (
                          <span className="text-sm font-bold text-slate-900">Band {sub.bandScore.toFixed(1)}</span>
                        ) : (
                          <span className="text-sm font-bold text-slate-900">Pending</span>
                        )}
                        <span className="text-slate-300">•</span>
                        <span className="text-sm text-slate-500">{sub.timeSpent ? \`\${Math.floor(sub.timeSpent / 60)}m \${sub.timeSpent % 60}s\` : 'N/A'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-sm text-slate-500">{sub.createdAt ? format(sub.createdAt, 'MMM d') : 'N/A'}</span>
                      </div>
                      
                      <div className="mt-auto flex gap-2 flex-wrap sm:flex-nowrap">
                        <button onClick={() => { navigate(isShared ? \`/shared/results/\${sub.id}\` : \`/results/\${sub.id}\`); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors text-center whitespace-nowrap">
                          Feedback
                        </button>
                        {sub.audioUrl && (
                          <a href={sub.audioUrl} target="_blank" rel="noopener noreferrer" className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center" title="Download">
                            <Upload className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {isAdmin && (
                          <button onClick={(e) => handleDeleteTest(sub.id, e)} className="bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center" title="Delete Test">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}`;

code = code.replace(speakingEmptyCheck, newSpeakingEmptyCheck);

fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
