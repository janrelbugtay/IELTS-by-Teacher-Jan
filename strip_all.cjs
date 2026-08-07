const fs = require('fs');

let content = fs.readFileSync('src/pages/OctoberListeningTest.tsx', 'utf8');

// Replace September with October
content = content.replace(/SeptemberListeningTest/g, 'OctoberListeningTest');
content = content.replace(/September IELTS Listening Test/g, 'October IELTS Listening Test');
content = content.replace(/IELTS Listening Test 9/g, 'IELTS Listening Test 10');
content = content.replace(/SEPTEMBER_LISTENING_ANSWER_KEY/g, 'OCTOBER_LISTENING_ANSWER_KEY');

// Empty answers
content = content.replace(/export const OCTOBER_LISTENING_ANSWER_KEY: Record<number, string> = \{[\s\S]*?\};/, 'export const OCTOBER_LISTENING_ANSWER_KEY: Record<number, string> = {\n};');
content = content.replace(/const testAnswers: Record<string, string> = \{[\s\S]*?\};/, 'const testAnswers: Record<string, string> = {};');
content = content.replace(/const allQuestions = \[[\s\S]*?\];/, 'const allQuestions = Array.from({ length: 40 }, (_, i) => i + 1);');

// Replace all parts with placeholders
const part1Regex = /<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 1 \? 'block' : 'hidden'\}`\}>[\s\S]*?<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 2 \? 'block' : 'hidden'\}`\}>/m;
content = content.replace(part1Regex, `<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 1 ? 'block' : 'hidden'}\`}>
    <h2 className="text-xl font-bold mb-4">Part 1 Placeholder</h2>
</div>
<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 2 ? 'block' : 'hidden'}\`}>`);

const part2Regex = /<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 2 \? 'block' : 'hidden'\}`\}>[\s\S]*?<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 3 \? 'block' : 'hidden'\}`\}>/m;
content = content.replace(part2Regex, `<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 2 ? 'block' : 'hidden'}\`}>
    <h2 className="text-xl font-bold mb-4">Part 2 Placeholder</h2>
</div>
<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 3 ? 'block' : 'hidden'}\`}>`);

const part3Regex = /<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 3 \? 'block' : 'hidden'\}`\}>[\s\S]*?<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 4 \? 'block' : 'hidden'\}`\}>/m;
content = content.replace(part3Regex, `<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 3 ? 'block' : 'hidden'}\`}>
    <h2 className="text-xl font-bold mb-4">Part 3 Placeholder</h2>
</div>
<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 4 ? 'block' : 'hidden'}\`}>`);

// Part 4 replacement
const p4Start = "currentPartIndex === 4 ? 'block' : 'hidden'}`}>\n";
const p4Index = content.indexOf(p4Start);
if (p4Index !== -1) {
    const endStr = '              {/* Bottom Nav */}';
    const endIndex = content.indexOf(endStr, p4Index);
    if (endIndex !== -1) {
        const replacement = p4Start + `    <h2 className="text-xl font-bold mb-4">Part 4 Placeholder</h2>
</div>
            </div>
          </div>
`;
        content = content.substring(0, p4Index) + replacement + content.substring(endIndex);
    }
}

fs.writeFileSync('src/pages/OctoberListeningTest.tsx', content);
