const fs = require('fs');

const htmlCode = fs.readFileSync('update_jan_listening.cjs', 'utf8');

let part1 = "";
let part2 = "";
let part3 = "";
let part4 = "";

const p1idx = htmlCode.indexOf('<div id="part-1"');
const p2idx = htmlCode.indexOf('<div id="part-2"');
const p3idx = htmlCode.indexOf('<div id="part-3"');
const p4idx = htmlCode.indexOf('<div id="part-4"');
const endidx = htmlCode.indexOf('<div class="bg-[#e1e5eb]');

part1 = htmlCode.substring(p1idx, p2idx);
part2 = htmlCode.substring(p2idx, p3idx);
part3 = htmlCode.substring(p3idx, p4idx);
part4 = htmlCode.substring(p4idx, endidx);

// Fix up the ending of part4 (it should just close its divs)
part4 = part4.replace(/<\/div>\s*<\/div>\s*<\/div>\s*$/, '</div></div>');

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

// Now read FebruaryListeningTest.tsx and replace its parts
let testCode = fs.readFileSync('src/pages/FebruaryListeningTest.tsx', 'utf8');

// Replace February title
testCode = testCode.replace(/FebruaryListeningTest/g, 'JanuaryListeningTest');
testCode = testCode.replace(/'February Listening Practice'/g, "'January Listening Practice'");

// Set the Audio ID
testCode = testCode.replace(/src="\/api\/audio\?id=[^"]*"/g, 'src="/api/audio?id=10kSpYtnGZN_gU3JsdiA-hnt_BkEtc2dH"');

// We need to replace the content inside the parts container
// In the React code, there's a big div `<div className="w-full max-w-[1000px] min-h-full">` which contains `{/* Part 1 */}` etc.
const partsStart = testCode.indexOf('<div className="w-full max-w-[1000px] min-h-full">') + '<div className="w-full max-w-[1000px] min-h-full">'.length;
const partsEnd = testCode.indexOf('</div>\n      </div>\n<div className="bg-[#e1e5eb]'); // The closing of w-full max-w-1000px and flex-1

if (partsStart > 100 && partsEnd > partsStart) {
    const newPartsContent = '\n' + part1 + '\n' + part2 + '\n' + part3 + '\n' + part4 + '\n              ';
    testCode = testCode.substring(0, partsStart) + newPartsContent + testCode.substring(partsEnd);
    fs.writeFileSync('src/pages/JanuaryListeningTest.tsx', testCode);
    console.log("Successfully generated JanuaryListeningTest.tsx");
} else {
    console.log("Could not find boundaries in React component.");
}
