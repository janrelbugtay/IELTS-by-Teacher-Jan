const fs = require('fs');

let content = fs.readFileSync('src/pages/OctoberListeningTest.tsx', 'utf8');

// Replace SeptemberListeningTest with OctoberListeningTest
content = content.replace(/SeptemberListeningTest/g, 'OctoberListeningTest');

// We need to replace the content of Part 1, 2, 3, 4 with placeholders.
// The structure is: <div className={`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] ${currentPartIndex === X ? 'block' : 'hidden'}`}> ... </div>
// for X = 1, 2, 3, 4.

const regex1 = /<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 1 \? 'block' : 'hidden'\}`\}>[\s\S]*?<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 2 \? 'block' : 'hidden'\}`\}>/m;

const replacement1 = `<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 1 ? 'block' : 'hidden'}\`}>
    <h2 className="text-xl font-bold mb-4">Part 1 Placeholder</h2>
    {/* Part 1 content will go here */}
</div>
<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 2 ? 'block' : 'hidden'}\`}>`;

content = content.replace(regex1, replacement1);

const regex2 = /<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 2 \? 'block' : 'hidden'\}`\}>[\s\S]*?<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 3 \? 'block' : 'hidden'\}`\}>/m;

const replacement2 = `<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 2 ? 'block' : 'hidden'}\`}>
    <h2 className="text-xl font-bold mb-4">Part 2 Placeholder</h2>
    {/* Part 2 content will go here */}
</div>
<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 3 ? 'block' : 'hidden'}\`}>`;

content = content.replace(regex2, replacement2);

const regex3 = /<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 3 \? 'block' : 'hidden'\}`\}>[\s\S]*?<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 4 \? 'block' : 'hidden'\}`\}>/m;

const replacement3 = `<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 3 ? 'block' : 'hidden'}\`}>
    <h2 className="text-xl font-bold mb-4">Part 3 Placeholder</h2>
    {/* Part 3 content will go here */}
</div>
<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 4 ? 'block' : 'hidden'}\`}>`;

content = content.replace(regex3, replacement3);

const regex4 = /<div className=\{`bg-white p-10 border border-gray-300 shadow-sm text-\[16px\] leading-\[1\.8\] \$\{currentPartIndex === 4 \? 'block' : 'hidden'\}`\}>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<div className="w-64 bg-\[#f0f0f0\] border-l border-gray-300 flex flex-col hidden lg:flex">/m;

const replacement4 = `<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 4 ? 'block' : 'hidden'}\`}>
    <h2 className="text-xl font-bold mb-4">Part 4 Placeholder</h2>
    {/* Part 4 content will go here */}
</div>

            </div>
          </div>
        </div>
      </div>
      <div className="w-64 bg-[#f0f0f0] border-l border-gray-300 flex flex-col hidden lg:flex">`;

content = content.replace(regex4, replacement4);

// Remove the answers data
const answersRegex = /const testAnswers: Record<string, string> = \{[\s\S]*?\};/;
const emptyAnswers = `const testAnswers: Record<string, string> = {
  // Add answers here
};`;

content = content.replace(answersRegex, emptyAnswers);

// Clear question mappings
const qRegex = /const allQuestions = \[[\s\S]*?\];/;
const emptyQ = `const allQuestions = Array.from({ length: 40 }, (_, i) => i + 1);`;

content = content.replace(qRegex, emptyQ);

// Make sure answer inputs aren't mapped wrongly if not using them right now... wait, let's just strip everything.
fs.writeFileSync('src/pages/OctoberListeningTest.tsx', content);

