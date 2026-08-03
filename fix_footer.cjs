const fs = require('fs');
let content = fs.readFileSync('src/pages/SeptemberListeningTest.tsx', 'utf8');

// Replace everything from the first "          <div className=\"mr-4 shrink-0 flex gap-2\">" to the end with the correct footer.
const target = `          <div className="mr-4 shrink-0 flex gap-2">
              {currentPartIndex === 4 ? (
                <button onClick={submitTest} className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-bold shadow hover:bg-green-700 transition">
                    Submit Test
                </button>
              ) : (
                <button className="w-8 h-8 rounded-full bg-gradient-to-b from-white to-gray-200 border border-gray-400 shadow flex items-center justify-center hover:from-gray-100 hover:to-gray-300 transition text-lg font-bold pb-1 text-gray-700" onClick={() => setCurrentPartIndex(prev => Math.min(4, prev + 1))}>
                    &rarr;
                </button>
              )}
          </div>
      </div>
    </div>
  );
}`;

const replacement = `      <div className="bg-[#e1e5eb] border-t border-gray-300 p-2 flex justify-between items-center shrink-0 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-20 overflow-x-auto">
          <div className="flex items-center text-[12px] font-bold text-gray-800 ml-4 cursor-pointer shrink-0">
               <input type="checkbox" className="mr-2 w-4 h-4 cursor-pointer" id="review-checkbox" /> <label htmlFor="review-checkbox" className="cursor-pointer">Review</label>
          </div>
          
          <div className="flex items-center gap-6 mx-auto shrink-0 min-w-max px-4">
              {[1, 2, 3, 4].map(partNum => (
                <div key={partNum} className="flex items-center cursor-pointer part-nav-header" onClick={() => setCurrentPartIndex(partNum)}>
                    <span className="mr-2 text-[13px] font-bold text-black hover:text-blue-600 transition-colors">Part {partNum}</span>
                    <div className="flex gap-0.5">
                        {Array.from({length: 10}, (_, i) => i + 1 + (partNum - 1) * 10).map(qNum => (
                            <div 
                                key={qNum} 
                                className={\`nav-btn \${answers[qNum] ? 'answered' : ''} \${currentPartIndex === partNum && qNum % 10 === 1 ? 'active' : ''}\`}
                                onClick={(e) => { e.stopPropagation(); setCurrentPartIndex(partNum); }}
                            >
                                {qNum}
                            </div>
                        ))}
                    </div>
                </div>
              ))}
          </div>
          <div className="mr-4 shrink-0 flex gap-2">
              {currentPartIndex === 4 ? (
                <button onClick={submitTest} className="bg-green-600 text-white px-4 py-1.5 rounded text-sm font-bold shadow hover:bg-green-700 transition">
                    Submit Test
                </button>
              ) : (
                <button className="w-8 h-8 rounded-full bg-gradient-to-b from-white to-gray-200 border border-gray-400 shadow flex items-center justify-center hover:from-gray-100 hover:to-gray-300 transition text-lg font-bold pb-1 text-gray-700" onClick={() => setCurrentPartIndex(prev => Math.min(4, prev + 1))}>
                    &rarr;
                </button>
              )}
          </div>
      </div>
    </div>
  );
}`;

content = content.replace(target, replacement);

// Oh wait, SeptemberListeningTest.tsx has:
// </div>
//           </div>
//           <div className="mr-4 shrink-0 flex gap-2">
// Is there a missing closing div? Let's check!

fs.writeFileSync('src/pages/SeptemberListeningTest.tsx', content);
