const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/JanuaryListeningTest.tsx');
let content = fs.readFileSync(file, 'utf8');

const replacement = `              {/* Part 4 */}
              <div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 4 ? 'block' : 'hidden'}\`}>
                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 31-40</div>
                <div className="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
                <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>

                <div className="border border-[#333] p-6 bg-white mb-8">
                    <h2 className="font-bold text-[22px] mb-6 text-center text-black tracking-wide">Sources of rubber</h2>
                    
                    <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2 mt-4">Three resources which are essential for industrial civilisation</div>
                    <ul className="list-none space-y-4 mb-8 pl-4">
                        <li>&bull; <span className="font-bold mx-2">31</span><input type="text" placeholder="31" className="ielts-input" value={answers[31] || ''} onChange={(e) => handleAnswerChange(31, e.target.value)} /></li>
                        <li>&bull; fossil fuels</li>
                        <li>&bull; rubber</li>
                    </ul>

                    <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2">Natural rubber</div>
                    <p className="mb-4 pl-4">This mainly comes from the Pará rubber tree, now cultivated in South-East Asia.</p>
                    <p className="mb-2 pl-4">The supply is limited because</p>
                    <ul className="list-none space-y-4 mb-8 pl-8">
                        <li>&bull; the growth of the tree is <span className="font-bold mx-2">32</span><input type="text" placeholder="32" className="ielts-input" value={answers[32] || ''} onChange={(e) => handleAnswerChange(32, e.target.value)} /></li>
                        <li>&bull; production cannot easily be adjusted because of increasing or decreasing <span className="font-bold mx-2">33</span><input type="text" placeholder="33" className="ielts-input" value={answers[33] || ''} onChange={(e) => handleAnswerChange(33, e.target.value)} /></li>
                        <li>&bull; the tree only grows near the <span className="font-bold mx-2">34</span><input type="text" placeholder="34" className="ielts-input" value={answers[34] || ''} onChange={(e) => handleAnswerChange(34, e.target.value)} /></li>
                        <li>&bull; extracting the latex (rubber) is labour-intensive</li>
                        <li>&bull; it is very difficult to <span className="font-bold mx-2">35</span><input type="text" placeholder="35" className="ielts-input" value={answers[35] || ''} onChange={(e) => handleAnswerChange(35, e.target.value)} /> rubber after production.</li>
                    </ul>
                    
                    <p className="mb-2 pl-4">New threats include</p>
                    <ul className="list-none space-y-4 mb-8 pl-8">
                        <li>&bull; lack of genetic diversity, leading to danger of disease caused by a <span className="font-bold mx-2">36</span><input type="text" placeholder="36" className="ielts-input" value={answers[36] || ''} onChange={(e) => handleAnswerChange(36, e.target.value)} /></li>
                        <li>&bull; a shift to the cultivation of palm oil</li>
                        <li>&bull; extreme <span className="font-bold mx-2">37</span><input type="text" placeholder="37" className="ielts-input" value={answers[37] || ''} onChange={(e) => handleAnswerChange(37, e.target.value)} /> events.</li>
                    </ul>

                    <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2">Synthetic rubber</div>
                    <ul className="list-none space-y-4 mb-8 pl-4">
                        <li>&bull; may be used for engine parts and cooking utensils</li>
                        <li>&bull; is less <span className="font-bold mx-2">38</span><input type="text" placeholder="38" className="ielts-input" value={answers[38] || ''} onChange={(e) => handleAnswerChange(38, e.target.value)} /> than natural rubber</li>
                        <li>&bull; is unsuitable for many purposes e.g. the tyres of aircraft.</li>
                    </ul>

                    <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2">An alternative source of natural rubber</div>
                    <ul className="list-none space-y-4 pl-4">
                        <li>&bull; A wild flower (a type of dandelion) has rubber in its <span className="font-bold mx-2">39</span><input type="text" placeholder="39" className="ielts-input" value={answers[39] || ''} onChange={(e) => handleAnswerChange(39, e.target.value)} /> .</li>
                        <li>&bull; It can be grown in many locations and does not require good <span className="font-bold mx-2">40</span><input type="text" placeholder="40" className="ielts-input" value={answers[40] || ''} onChange={(e) => handleAnswerChange(40, e.target.value)} /> .</li>
                    </ul>
                </div>
              </div>`;

const startIdx = content.indexOf('{/* Part 4 */}');
const endIdx = content.indexOf('<div className="bg-[#e1e5eb] border-t border-gray-300 p-2 flex justify-between items-center shrink-0 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-20 overflow-x-auto">');

if (startIdx !== -1 && endIdx !== -1) {
    // Keep closing divs before the footer
    const partToReplace = content.substring(startIdx, endIdx);
    
    // There are some closing divs we need to retain from the original before the footer starts
    // In original:
    //               </div>
    //           </div>
    //       </div>
    // <div className="bg-[#e1e5eb]...
    
    const divEndsMatch = partToReplace.match(/(\s*<\/div>\s*<\/div>\s*<\/div>\s*)$/);
    const divEnds = divEndsMatch ? divEndsMatch[1] : '\n          </div>\n      </div>\n';

    content = content.substring(0, startIdx) + replacement + divEnds + content.substring(endIdx);
    fs.writeFileSync(file, content);
    console.log("Updated Part 4");
} else {
    console.log("Could not find boundaries");
}
