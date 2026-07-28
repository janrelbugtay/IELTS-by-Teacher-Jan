const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

// Replace Waveform
code = code.replace(
  /const Waveform = \(\{\s*isRecording[\s\S]*?<\/div>\n\);\n/m,
  `const Waveform = ({ isRecording }: { isRecording: boolean }) => (
  <div className="flex items-center justify-center h-12 gap-1.5 overflow-hidden">
    {[...Array(32)].map((_, i) => (
      <div
        key={i}
        className={\`w-1.5 rounded-full transition-all duration-75 \${
          isRecording 
            ? 'bg-[#4F7DFF] shadow-[0_0_12px_rgba(79,125,255,0.6)] animate-pulse' 
            : 'bg-slate-800'
        }\`}
        style={{
          height: isRecording ? \`\${Math.max(20, Math.random() * 100)}%\` : '20%',
          animationDelay: \`\${i * 0.03}s\`,
          animationDuration: \`\${Math.random() * 0.3 + 0.4}s\`
        }}
      />
    ))}
  </div>
);
`
);

// Container
code = code.replace(
  'className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.1)] rounded-full px-8 py-4 flex items-center justify-between"',
  'className="bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-[2.5rem] px-8 py-6 flex items-center justify-between w-full mx-auto"'
);

code = code.replace(
  'bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-full',
  'bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full'
);
code = code.replace('text-[#4F7DFF] px-4 py-2', 'text-[#4F7DFF] px-4 py-2');
code = code.replace('bg-slate-300', 'bg-slate-700');
code = code.replace('text-slate-800 mb-1 drop-shadow-sm', 'text-white mb-2 drop-shadow-lg tracking-wider text-2xl');
code = code.replace('text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors', 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors');
code = code.replace('bg-[#1A1A1A] text-white px-4 md:px-6 py-2 h-10 md:h-12 rounded-full font-bold hover:bg-slate-800 transition-all hover:pr-3 group shadow-md', 'bg-white text-slate-900 px-6 py-2 h-12 rounded-full font-bold hover:bg-slate-100 transition-all hover:pr-4 group shadow-[0_0_20px_rgba(255,255,255,0.1)]');
code = code.replace('w-full max-w-[120px]', 'w-full max-w-[180px]');

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
