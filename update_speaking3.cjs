const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

code = code.replace(
  `                ) : qState === 'recording' && phase !== 'intro' && phase !== 'p2-prep' ? (`,
  `                ) : qState === 'waiting_to_record' && phase !== 'intro' && phase !== 'p2-prep' ? (
                  <div className="flex items-center gap-3 text-slate-600 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
                     <Mic size={20} />
                     <span className="font-bold text-sm uppercase tracking-wider">Ready to Record</span>
                  </div>
                ) : qState === 'recording' && phase !== 'intro' && phase !== 'p2-prep' ? (`
);

code = code.replace(
  `                {phase !== 'intro' && phase !== 'p2-prep' && phase !== 'completed' && qState === 'recording' && (
                  <button 
                    onClick={stopRecording}`,
  `                {phase !== 'intro' && phase !== 'p2-prep' && phase !== 'completed' && qState === 'waiting_to_record' && (
                  <button 
                    onClick={startRecording}
                    className="flex items-center gap-2 bg-[#4F7DFF] text-white px-8 py-3 h-12 rounded-full font-bold hover:bg-[#3D63CC] transition-all shadow-md text-sm tracking-wide"
                  >
                    <Mic size={16} /> Start Recording
                  </button>
                )}
                {phase !== 'intro' && phase !== 'p2-prep' && phase !== 'completed' && qState === 'recording' && (
                  <button 
                    onClick={stopRecording}`
);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
