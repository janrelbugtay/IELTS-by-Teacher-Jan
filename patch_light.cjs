const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

// Replace Waveform
code = code.replace(
  /const Waveform = \(\{\s*isRecording[\s\S]*?<\/div>\n\);\n/m,
  `const Waveform = ({ isRecording }: { isRecording: boolean }) => (
  <div className="flex items-center justify-center h-16 gap-1.5 overflow-hidden">
    {[...Array(24)].map((_, i) => (
      <div
        key={i}
        className={\`w-1.5 rounded-full transition-all duration-75 \${
          isRecording 
            ? 'bg-[#4F7DFF] shadow-[0_0_8px_rgba(79,125,255,0.4)] animate-pulse' 
            : 'bg-slate-200'
        }\`}
        style={{
          height: isRecording ? \`\${Math.max(15, Math.random() * 100)}%\` : '15%',
          animationDelay: \`\${i * 0.03}s\`,
          animationDuration: \`\${Math.random() * 0.3 + 0.4}s\`
        }}
      />
    ))}
  </div>
);
`
);

// Replace main container
code = code.replace(
  'className="flex flex-col bg-[#0a0f1c] text-white w-full overflow-hidden font-sans selection:bg-indigo-500/30 rounded-3xl relative h-[80vh] md:h-auto md:flex-1"',
  'className="flex flex-col bg-white text-slate-800 w-full overflow-hidden font-sans selection:bg-[#4F7DFF]/20 rounded-3xl relative h-[80vh] md:h-auto md:flex-1 shadow-sm border border-slate-200"'
);

// Blobs
code = code.replace('bg-indigo-900/20', 'bg-[#4F7DFF]/10');
code = code.replace('bg-purple-900/20', 'bg-[#6CCB5F]/10');

// Red tag
code = code.replace('bg-white/5 px-4 py-2 rounded-full border border-white/10', 'bg-red-50 px-4 py-2 rounded-full border border-red-100');
code = code.replace('text-slate-300', 'text-red-600');
code = code.replace('rgba(239,68,68,0.6)', 'rgba(239,68,68,0.4)');

// Phase tag
code = code.replace('text-indigo-300 bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-500/30', 'text-[#4F7DFF] bg-[#4F7DFF]/10 px-4 py-1.5 rounded-full border border-[#4F7DFF]/20 font-bold');

// Intro
code = code.replace('bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.2)] border border-indigo-500/30', 'bg-blue-50 text-[#4F7DFF] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(79,125,255,0.2)] border border-[#4F7DFF]/20');
code = code.replace('text-white tracking-tight', 'text-slate-900 tracking-tight');
code = code.replace('text-slate-300 leading-relaxed font-light', 'text-slate-600 leading-relaxed font-light');
code = code.replace('bg-indigo-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]', 'bg-[#4F7DFF] text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-blue-600 transition-all shadow-[0_0_30px_rgba(79,125,255,0.3)] hover:shadow-[0_0_40px_rgba(79,125,255,0.5)]');

// P1
code = code.replace('bg-white/5 text-indigo-300 px-5 py-2 rounded-full text-sm font-medium mb-2 border border-white/10 backdrop-blur-sm', 'bg-[#4F7DFF]/10 text-[#4F7DFF] px-5 py-2 rounded-full text-sm font-semibold mb-2 border border-[#4F7DFF]/20 backdrop-blur-sm');
code = code.replace('text-white leading-tight tracking-tight drop-shadow-lg', 'text-slate-900 leading-tight tracking-tight drop-shadow-sm');

// P2 Prep
code = code.replace('bg-white/5 text-purple-300 px-5 py-2 rounded-full text-sm font-medium border border-white/10 backdrop-blur-sm', 'bg-[#4F7DFF]/10 text-[#4F7DFF] px-5 py-2 rounded-full text-sm font-semibold border border-[#4F7DFF]/20 backdrop-blur-sm');
code = code.replace('text-white flex items-center gap-3 bg-black/30 px-6 py-2 rounded-full border border-white/5 shadow-inner', 'text-slate-800 flex items-center gap-3 bg-white px-6 py-2 rounded-full border border-slate-200 shadow-sm');
code = code.replace('text-orange-400 animate-pulse', 'text-[#F7B731] animate-pulse');
code = code.replace('bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-3xl', 'bg-white backdrop-blur-xl border border-slate-200 shadow-lg p-8 rounded-3xl');
code = code.replace('text-white mb-6 leading-tight', 'text-slate-900 mb-6 leading-tight');
code = code.replace('text-slate-300 mb-4 font-medium text-lg', 'text-slate-600 mb-4 font-medium text-lg');
code = code.replace('text-slate-200 text-lg font-light', 'text-slate-700 text-lg font-light');
code = code.replace('w-full h-32 p-5 rounded-2xl bg-white/5 border border-white/10 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-white font-sans text-lg placeholder-slate-600 transition-all backdrop-blur-sm', 'w-full h-32 p-5 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-[#4F7DFF] focus:border-transparent outline-none resize-none text-slate-800 font-sans text-lg placeholder-slate-400 transition-all shadow-sm');

// P2
code = code.replace('bg-[#1e2336] text-indigo-300 px-6 py-2.5 rounded-full text-sm font-semibold border border-indigo-500/20 shadow-lg shadow-indigo-900/20 mb-2', 'bg-[#4F7DFF]/10 text-[#4F7DFF] px-6 py-2.5 rounded-full text-sm font-bold border border-[#4F7DFF]/20 shadow-sm mb-2');
code = code.replace('bg-[#1e2336]/80 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl shadow-2xl', 'bg-white border border-slate-200 p-8 rounded-3xl shadow-lg');
code = code.replace('text-white leading-tight text-center mb-6', 'text-slate-900 leading-tight text-center mb-6');
code = code.replace('text-slate-400 mb-4 font-medium text-lg', 'text-slate-600 mb-4 font-medium text-lg');
code = code.replace('text-slate-300 text-lg font-light', 'text-slate-700 text-lg font-light');
code = code.replace('bg-[#1e2336]/60 p-6 rounded-2xl border border-indigo-500/20 text-indigo-200 whitespace-pre-wrap font-mono text-lg shadow-inner', 'bg-blue-50 p-6 rounded-2xl border border-blue-100 text-slate-700 whitespace-pre-wrap font-mono text-lg shadow-inner');
code = code.replace('text-indigo-400 mb-2 uppercase tracking-wider font-bold', 'text-[#4F7DFF] mb-2 uppercase tracking-wider font-bold');

// P3
code = code.replace('bg-white/5 text-emerald-300 px-5 py-2 rounded-full text-sm font-medium mb-2 border border-white/10 backdrop-blur-sm', 'bg-[#6CCB5F]/10 text-[#6CCB5F] px-5 py-2 rounded-full text-sm font-semibold mb-2 border border-[#6CCB5F]/20 backdrop-blur-sm');

// Bottom UI
code = code.replace('bg-slate-900/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-full px-8 py-4 flex items-center justify-between', 'bg-white/90 backdrop-blur-xl border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.1)] rounded-full px-8 py-4 flex items-center justify-between');
code = code.replace('bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full', 'bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-full');
code = code.replace('text-indigo-400 px-4 py-2', 'text-[#4F7DFF] px-4 py-2');
code = code.replace('bg-slate-600', 'bg-slate-300');
code = code.replace('text-white mb-1 drop-shadow-md', 'text-slate-800 mb-1 drop-shadow-sm');
code = code.replace('text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors', 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors');
code = code.replace('bg-white text-slate-900 px-4 md:px-6 py-2 h-10 md:h-12 rounded-full font-bold hover:bg-indigo-50 transition-all hover:pr-3 group shadow-lg', 'bg-[#1A1A1A] text-white px-4 md:px-6 py-2 h-10 md:h-12 rounded-full font-bold hover:bg-slate-800 transition-all hover:pr-3 group shadow-md');
code = code.replace('bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-4 md:px-6 py-2 h-10 md:h-12 rounded-full font-semibold hover:bg-indigo-500/40 hover:text-white transition-all text-sm', 'bg-slate-100 text-slate-600 border border-slate-200 px-4 md:px-6 py-2 h-10 md:h-12 rounded-full font-semibold hover:bg-slate-200 transition-all text-sm');

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
