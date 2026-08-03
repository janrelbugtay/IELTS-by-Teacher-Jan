const fs = require('fs');
let content = fs.readFileSync('src/pages/SeptemberListeningTest.tsx', 'utf8');

// Rename Component
content = content.replace(/AugustListeningTest/g, 'SeptemberListeningTest');
// Rename title
content = content.replace(/August IELTS Listening Test/g, 'September IELTS Listening Test');

// Rename Answer Key to avoid confusion
content = content.replace(/LISTENING_ANSWER_KEY/g, 'SEPTEMBER_LISTENING_ANSWER_KEY');

// Empty the answer key
content = content.replace(/export const SEPTEMBER_LISTENING_ANSWER_KEY: Record<number, string> = \{[\s\S]*?\};/, 'export const SEPTEMBER_LISTENING_ANSWER_KEY: Record<number, string> = {};');

// Remove questions from Part 1
content = content.replace(/<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 1 \? 'block' : 'hidden'\}`\}>[\s\S]*?(?=<\/div>\s*<div className=\{`bg-white p-10)/, `<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 1 ? 'block' : 'hidden'}\`}>\n    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Part 1 - Coming Soon</div>\n`);

// Remove questions from Part 2
content = content.replace(/<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 2 \? 'block' : 'hidden'\}`\}>[\s\S]*?(?=<\/div>\s*<div className=\{`bg-white p-10)/, `</div>\n<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 2 ? 'block' : 'hidden'}\`}>\n    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Part 2 - Coming Soon</div>\n`);

// Remove questions from Part 3
content = content.replace(/<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 3 \? 'block' : 'hidden'\}`\}>[\s\S]*?(?=<\/div>\s*<div className=\{`bg-white p-10)/, `</div>\n<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 3 ? 'block' : 'hidden'}\`}>\n    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Part 3 - Coming Soon</div>\n`);

// Remove questions from Part 4
content = content.replace(/<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 4 \? 'block' : 'hidden'\}`\}>[\s\S]*?(?=<\/div>\s*<\/div>\s*<div className="mr-4)/, `</div>\n<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 4 ? 'block' : 'hidden'}\`}>\n    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Part 4 - Coming Soon</div>\n`);

fs.writeFileSync('src/pages/SeptemberListeningTest.tsx', content);
