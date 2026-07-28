const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

// Remove top right tag
code = code.replace(
  /<div className="text-\[#4F7DFF\] bg-\[#4F7DFF\]\/10 px-4 py-1\.5 rounded-full border border-\[#4F7DFF\]\/20 font-bold">\s*\{phase\.toUpperCase\(\)\.replace\('-', ' '\)\}\s*<\/div>/g,
  ''
);

// Part 1
code = code.replace(
  '<div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-5 py-2 rounded-full text-sm font-semibold mb-2 border border-[#4F7DFF]/20 backdrop-blur-sm">',
  '<div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-6 py-2.5 rounded-full text-base font-bold mb-4 border border-[#4F7DFF]/20 backdrop-blur-sm tracking-wide">'
);
code = code.replace(
  'Part 1 • {MOCK_QUESTIONS.part1[qIndex].topic}',
  "Part 1: Let's talk about {MOCK_QUESTIONS.part1[qIndex].topic}"
);

// Part 2 Prep
code = code.replace(
  '<div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-5 py-2 rounded-full text-sm font-semibold border border-[#4F7DFF]/20 backdrop-blur-sm">',
  '<div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-6 py-2.5 rounded-full text-base font-bold border border-[#4F7DFF]/20 backdrop-blur-sm tracking-wide">'
);
code = code.replace(
  'Part 2 • Preparation',
  'Part 2: Preparation'
);

// Part 2 Speaking
code = code.replace(
  '<div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-6 py-2.5 rounded-full text-sm font-bold border border-[#4F7DFF]/20 shadow-sm mb-2">',
  '<div className="inline-block bg-[#4F7DFF]/10 text-[#4F7DFF] px-8 py-3 rounded-full text-base font-bold border border-[#4F7DFF]/20 shadow-sm mb-4 tracking-wide">'
);
code = code.replace(
  'Part 2 • Speaking',
  'Part 2: Long Turn'
);

// Part 3
code = code.replace(
  '<div className="inline-block bg-[#6CCB5F]/10 text-[#6CCB5F] px-5 py-2 rounded-full text-sm font-semibold mb-2 border border-[#6CCB5F]/20 backdrop-blur-sm">',
  '<div className="inline-block bg-[#6CCB5F]/10 text-[#6CCB5F] px-6 py-2.5 rounded-full text-base font-bold mb-4 border border-[#6CCB5F]/20 backdrop-blur-sm tracking-wide">'
);
code = code.replace(
  'Part 3 • Discussion',
  "Part 3: Let's discuss {MOCK_QUESTIONS.part3[qIndex].topic}"
);
code = code.replace(
  'text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight drop-shadow-lg',
  'text-3xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight drop-shadow-sm'
);

// Container immersive tweak
code = code.replace(
  'className="flex flex-col bg-white text-slate-800 w-full overflow-hidden font-sans selection:bg-[#4F7DFF]/20 rounded-3xl relative h-[80vh] md:h-auto md:flex-1 shadow-sm border border-slate-200"',
  'className="flex flex-col bg-transparent text-slate-800 w-full overflow-hidden font-sans selection:bg-[#4F7DFF]/20 relative h-[80vh] md:h-auto md:flex-1"'
);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
