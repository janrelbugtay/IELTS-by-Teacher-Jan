const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

// Container
code = code.replace(
  'className="bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-[2.5rem] px-8 py-6 flex items-center justify-between w-full mx-auto"',
  'className="bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)] rounded-[2.5rem] px-8 py-6 flex items-center justify-between w-full mx-auto"'
);

// Recording Tag
code = code.replace(
  'bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full',
  'bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-full'
);

// Standby Tag
code = code.replace(
  '<div className="w-2 h-2 rounded-full bg-slate-700" /> Standby',
  '<div className="w-2 h-2 rounded-full bg-slate-300" /> Standby'
);

// Timer Text
code = code.replace(
  'text-white mb-2 drop-shadow-lg tracking-wider text-2xl',
  'text-slate-800 mb-2 drop-shadow-sm tracking-wider text-2xl'
);

// Rotate Button
code = code.replace(
  'text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors',
  'text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors'
);

// Done Button
code = code.replace(
  'bg-white text-slate-900 px-6 py-2 h-12 rounded-full font-bold hover:bg-slate-100 transition-all hover:pr-4 group shadow-[0_0_20px_rgba(255,255,255,0.1)]',
  'bg-slate-900 text-white px-6 py-2 h-12 rounded-full font-bold hover:bg-slate-800 transition-all hover:pr-4 group shadow-md'
);

// Waveform Component
code = code.replace(
  /const Waveform = \(\{\s*isRecording[\s\S]*?<\/div>\n\);\n/m,
  `const Waveform = ({ isRecording }: { isRecording: boolean }) => (
  <div className="flex items-center justify-center h-12 gap-1.5 overflow-hidden">
    {[...Array(32)].map((_, i) => (
      <div
        key={i}
        className={\`w-1.5 rounded-full transition-all duration-75 \${
          isRecording 
            ? 'bg-[#4F7DFF] shadow-[0_0_10px_rgba(79,125,255,0.4)] animate-pulse' 
            : 'bg-slate-200'
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

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
