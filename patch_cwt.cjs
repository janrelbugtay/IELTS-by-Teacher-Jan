const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerWritingTest.tsx', 'utf8');

const target1 = `<h3 className="text-2xl font-bold text-slate-800">ERA AI Examiner Report</h3>`;
const replacement1 = `<h3 className="text-2xl font-bold text-slate-800">Teacher Jan will check your writing. Please wait!</h3>`;

const target2 = `<p className="text-slate-600 mb-2 font-medium">Your essay has been saved successfully.</p>
                                        <p className="text-slate-500 text-sm mb-6">Detailed feedback is currently unavailable. Please check the dashboard later.</p>`;
const replacement2 = `<p className="text-slate-600 mb-2 font-medium">Your essay has been saved successfully.</p>`;

code = code.replace(target1, replacement1);
code = code.replace(target2, replacement2);
fs.writeFileSync('src/pages/ComputerWritingTest.tsx', code);
console.log("Updated ComputerWritingTest.tsx");
