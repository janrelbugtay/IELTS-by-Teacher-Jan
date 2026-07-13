const fs = require('fs');

const htmlCode = fs.readFileSync('may_html.html', 'utf8');

let part1 = "";
let part2 = "";
let part3 = "";
let part4 = "";

const p1idx = htmlCode.indexOf('<div id="part-1"');
const p2idx = htmlCode.indexOf('<div id="part-2"');
const p3idx = htmlCode.indexOf('<div id="part-3"');
const p4idx = htmlCode.indexOf('<div id="part-4"');
const endidx = htmlCode.indexOf('        </div>\n    </div>', p4idx);

part1 = htmlCode.substring(p1idx, p2idx);
part2 = htmlCode.substring(p2idx, p3idx);
part3 = htmlCode.substring(p3idx, p4idx);
part4 = htmlCode.substring(p4idx, endidx);

function htmlToReact(html, partNum) {
    let reactHtml = html;
    
    // Replace class= with className=
    reactHtml = reactHtml.replace(/class="/g, 'className="');
    reactHtml = reactHtml.replace(/for="/g, 'htmlFor="');
    reactHtml = reactHtml.replace(/<br>/g, '<br/>');
    
    // Replace text inputs
    reactHtml = reactHtml.replace(/<input type="text"[^>]*data-q="(\d+)"[^>]*>/g, (match, qNum) => {
        return `<input type="text" placeholder="${qNum}" className="ielts-input" value={answers[${qNum}] || ''} onChange={(e) => handleAnswerChange(${qNum}, e.target.value)} />`;
    });
    
    // Replace radio buttons
    reactHtml = reactHtml.replace(/<input type="radio"[^>]*name="q(\d+)"[^>]*value="([A-Z])"[^>]*>/g, (match, qNum, val) => {
        return `<input type="radio" name="q${qNum}" value="${val}" className="mcq-radio" checked={answers[${qNum}] === '${val}'} onChange={() => handleAnswerChange(${qNum}, '${val}')} />`;
    });
    
    // Replace checkboxes
    reactHtml = reactHtml.replace(/<input type="checkbox"[^>]*name="q(\d+)_(\d+)"[^>]*value="([A-Z])"[^>]*>/g, (match, qNum1, qNum2, val) => {
        return `<input type="checkbox" name="q${qNum1}_${qNum2}" value="${val}" className="mcq-checkbox" checked={answers[${qNum1}] === '${val}' || answers[${qNum2}] === '${val}'} onChange={(e) => handleMultiSelect(${qNum1}, ${qNum2}, '${val}', e.target.checked)} />`;
    });
    
    // Remove the `id="part-X"` and `active` from the outer div, and wrap with the React logic
    reactHtml = reactHtml.replace(/<div id="part-\d+" className="part-section[^"]*"/, 
        `{/* Part ${partNum} */}\n              <div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === ${partNum} ? 'block' : 'hidden'}\`}`);

    return reactHtml;
}

part1 = htmlToReact(part1, 1);
part2 = htmlToReact(part2, 2);
part3 = htmlToReact(part3, 3);
part4 = htmlToReact(part4, 4);

// Now read JanuaryListeningTest.tsx and replace its parts
let testCode = fs.readFileSync('src/pages/JanuaryListeningTest.tsx', 'utf8');

// Replace January title
testCode = testCode.replace(/JanuaryListeningTest/g, 'MayListeningTest');
testCode = testCode.replace(/'January Listening Practice'/g, "'May Listening Practice'");

// Set the Audio ID
testCode = testCode.replace(/src="\/api\/audio\?id=[^"]*"/g, 'src="/api/audio?id=1eYWQZIbPTbooFfQWEq6tfi1FAyjt-r9I"');

// Replace Answer Key
testCode = testCode.replace(/export const LISTENING_ANSWER_KEY: Record<number, string> = \{[\s\S]*?\};/, `export const LISTENING_ANSWER_KEY: Record<number, string> = {
    1: '13 JANUARY', 2: '48', 3: 'PIZZA', 4: 'INDIA', 5: 'MIRROR',
    6: '6 APRIL', 7: 'NATURAL', 8: '67.50', 9: 'SHIRT', 10: 'HAMMER',
    11: 'B/E', 12: 'B/E', 13: 'C/D', 14: 'C/D', 15: 'F',
    16: 'B', 17: 'D', 18: 'A', 19: 'H', 20: 'E',
    21: 'B/E', 22: 'B/E', 23: 'C/D', 24: 'C/D', 25: 'A/C',
    26: 'A/C', 27: 'C', 28: 'D', 29: 'F', 30: 'A',
    31: 'POLLUTION', 32: 'TAX', 33: 'CHOCOLATE', 34: 'TIMING', 35: 'COST',
    36: 'RULES', 37: 'DIVING', 38: 'VEGAN', 39: 'WIFI', 40: 'VIDEOS'
};`);

// We need to replace the content inside the parts container
const partsStart = testCode.indexOf('<div className="w-full max-w-[1000px] min-h-full">') + '<div className="w-full max-w-[1000px] min-h-full">'.length;
const partsEnd = testCode.indexOf('</div>\n      </div>\n<div className="bg-[#e1e5eb]'); 

if (partsStart > 100 && partsEnd > partsStart) {
    const newPartsContent = '\n' + part1 + '\n' + part2 + '\n' + part3 + '\n' + part4 + '\n              ';
    testCode = testCode.substring(0, partsStart) + newPartsContent + testCode.substring(partsEnd);
    fs.writeFileSync('src/pages/MayListeningTest.tsx', testCode);
    console.log("Successfully generated MayListeningTest.tsx");
} else {
    console.log("Could not find boundaries in React component.");
    console.log("partsStart:", partsStart, "partsEnd:", partsEnd);
}

