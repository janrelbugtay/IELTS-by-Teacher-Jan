const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerWritingTest.tsx', 'utf8');

const lines = code.split('\n');

const newLines = [];
let i = 0;
while (i < lines.length) {
    if (lines[i].includes('</button>') && lines[i+1] && lines[i+1].includes(')}') && lines[i+2] && lines[i+2].includes('</div>') && lines[i+3] && lines[i+3].includes(')}') && lines[i+4] && lines[i+4].includes('</div>') && lines[i+5] && lines[i+5].includes('</div>') && lines[i+6] && lines[i+6].includes('</div>') && lines[i+7] && lines[i+7].includes(')}')) {
        newLines.push(lines[i]);
        newLines.push(lines[i+1]);
        newLines.push(lines[i+2]);
        newLines.push(lines[i+3]);
        newLines.push(lines[i+4]);
        newLines.push(lines[i+5]);
        newLines.push('                        ) : (');
        newLines.push('                            <div className="w-full max-w-4xl p-6 md:p-10 my-6 bg-white rounded-2xl shadow-md border border-slate-200 text-center">');
        newLines.push('                                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />');
        newLines.push('                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Test Submitted Successfully</h3>');
        newLines.push('                                <p className="text-slate-600 font-medium">Your essay has been saved. The teacher will review your writing soon.</p>');
        newLines.push('                            </div>');
        newLines.push('                        )}');
        newLines.push(lines[i+6]);
        newLines.push(lines[i+7]);
        i += 8;
    } else {
        newLines.push(lines[i]);
        i++;
    }
}

fs.writeFileSync('src/pages/ComputerWritingTest.tsx', newLines.join('\n'));
console.log("Done");
