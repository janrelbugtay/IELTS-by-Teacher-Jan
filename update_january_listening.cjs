const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/JanuaryListeningTest.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// Replace ANSWER KEY
code = code.replace(/export const LISTENING_ANSWER_KEY: Record<number, string> = {[\s\S]*?};/, `export const LISTENING_ANSWER_KEY: Record<number, string> = {
    1: '10 / ten', 2: 'weather', 3: 'safety', 4: 'discount', 5: 'dictionary', 6: 'certificate', 7: 'towel', 8: 'café / cafe', 9: 'videos', 10: 'lockers',
    11: 'A', 12: 'B', 13: 'A', 14: 'A', 15: 'A', 16: 'C', 17: 'C', 18: 'A', 19: 'B', 20: 'C',
    21: 'B / D', 22: 'B / D', 23: 'C / E', 24: 'C / E', 25: 'G', 26: 'B', 27: 'F', 28: 'H', 29: 'A', 30: 'E',
    31: 'metal / metals', 32: 'slow', 33: 'demand', 34: 'equator', 35: 'recycle', 36: 'fungus', 37: 'weather', 38: 'strong', 39: 'roots', 40: 'soil'
};`);

// Replace Part 1
code = code.replace(/\{\/\* Part 1 \*\/\}[\s\S]*?\{\/\* Part 2 \*\/\}/, `{/* Part 1 */}
              <div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 1 ? 'block' : 'hidden'}\`}>
                
                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 1-6</div>
                <div className="mb-4 italic text-[15px] text-gray-700">Complete the table below.</div>
                <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD AND/OR A NUMBER for each answer.</div>

                <div className="border border-[#333] p-6 bg-white mb-6 overflow-x-auto">
                    <h2 className="font-bold text-[22px] mb-6 text-center text-black">Oyster Bay Sailing Club Courses</h2>
                    
                    <table className="w-full border-collapse border border-gray-400 text-left mb-8">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-400 p-3">Name of course</th>
                                <th className="border border-gray-400 p-3">What you learn</th>
                                <th className="border border-gray-400 p-3">Cost</th>
                                <th className="border border-gray-400 p-3">Other information</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-gray-400 p-3 align-top">Taster day</td>
                                <td className="border border-gray-400 p-3 align-top">introduction to sailing</td>
                                <td className="border border-gray-400 p-3 align-top">£120 if booking one place</td>
                                <td className="border border-gray-400 p-3 align-top">small groups (max <span className="font-bold mx-1">1</span><input type="text" placeholder="1" className={\`ielts-input \${answers[1] ? 'active-state' : ''}\`} value={answers[1] || ''} onChange={(e) => handleAnswerChange(1, e.target.value)} /> people)</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 p-3 align-top">Level 1</td>
                                <td className="border border-gray-400 p-3 align-top">
                                    basic theory e.g. understanding the <span className="font-bold mx-1">2</span><input type="text" placeholder="2" className={\`ielts-input \${answers[2] ? 'active-state' : ''}\`} value={answers[2] || ''} onChange={(e) => handleAnswerChange(2, e.target.value)} /> and tides<br/><br/>
                                    basic sailing skills including <span className="font-bold mx-1">3</span><input type="text" placeholder="3" className={\`ielts-input \${answers[3] ? 'active-state' : ''}\`} value={answers[3] || ''} onChange={(e) => handleAnswerChange(3, e.target.value)} /> information
                                </td>
                                <td className="border border-gray-400 p-3 align-top">£200</td>
                                <td className="border border-gray-400 p-3 align-top">
                                    <span className="font-bold mx-1">4</span><input type="text" placeholder="4" className={\`ielts-input \${answers[4] ? 'active-state' : ''}\`} value={answers[4] || ''} onChange={(e) => handleAnswerChange(4, e.target.value)} /> available for club members<br/><br/>
                                    all inclusive (plus a useful <span className="font-bold mx-1">5</span><input type="text" placeholder="5" className={\`ielts-input \${answers[5] ? 'active-state' : ''}\`} value={answers[5] || ''} onChange={(e) => handleAnswerChange(5, e.target.value)} />)<br/><br/>
                                    a <span className="font-bold mx-1">6</span><input type="text" placeholder="6" className={\`ielts-input \${answers[6] ? 'active-state' : ''}\`} value={answers[6] || ''} onChange={(e) => handleAnswerChange(6, e.target.value)} /> at the end of the course for all participants
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-gray-300 pt-8">
                    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 7-10</div>
                    <div className="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
                    <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>

                    <div className="border border-[#333] p-6 bg-white">
                        <div className="font-bold mb-4 text-[18px] text-blue-900 border-b border-gray-300 pb-2">General information</div>
                        <ul className="list-none space-y-4 mb-8 pl-2">
                            <li>&bull; Participants must be able to swim.</li>
                            <li>&bull; Bring suitable clothing, a <span className="font-bold mx-2">7</span><input type="text" placeholder="7" className={\`ielts-input \${answers[7] ? 'active-state' : ''}\`} value={answers[7] || ''} onChange={(e) => handleAnswerChange(7, e.target.value)} /> and toiletries (e.g. shampoo).</li>
                            <li>&bull; There is a <span className="font-bold mx-2">8</span><input type="text" placeholder="8" className={\`ielts-input \${answers[8] ? 'active-state' : ''}\`} value={answers[8] || ''} onChange={(e) => handleAnswerChange(8, e.target.value)} /> at the club.</li>
                            <li>&bull; Online training <span className="font-bold mx-2">9</span><input type="text" placeholder="9" className={\`ielts-input \${answers[9] ? 'active-state' : ''}\`} value={answers[9] || ''} onChange={(e) => handleAnswerChange(9, e.target.value)} /> are recommended.</li>
                            <li>&bull; <span className="font-bold mx-2">10</span><input type="text" placeholder="10" className={\`ielts-input \${answers[10] ? 'active-state' : ''}\`} value={answers[10] || ''} onChange={(e) => handleAnswerChange(10, e.target.value)} /> are available for course participants.</li>
                        </ul>
                    </div>
                </div>

              </div>

              {/* Part 2 */}`);

// Replace Part 2
code = code.replace(/\{\/\* Part 2 \*\/\}[\s\S]*?\{\/\* Part 3 \*\/\}/, `{/* Part 2 */}
              <div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 2 ? 'block' : 'hidden'}\`}>
                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 11-16</div>
                <div className="mb-6 italic text-[15px] text-gray-700">Choose the correct letter, <span className="font-bold">A, B</span> or <span className="font-bold">C</span>.</div>

                <div className="border border-[#333] p-6 bg-white mb-8">
                    <h2 className="font-bold text-[22px] mb-6 text-center text-black">Working as a makeup trainee</h2>
                    
                    <div className="space-y-8">
                        {[
                          {q: 11, text: "What should trainees always expect to get when working on low budget short films?", opts: ["travel expenses", "a minimum wage", "meals"]},
                          {q: 12, text: "According to the speaker, on big budget films trainees may get experience of", opts: ["makeup for special effects.", "working with different ethnicities.", "creating a variety of hair styles."]},
                          {q: 13, text: "The speaker says a problem for makeup artists is", opts: ["dealing with difficult directors.", "being shouted at by their supervisor.", "waiting around for hours doing nothing."]},
                          {q: 14, text: "How did the speaker feel when she met famous actors for the first time?", opts: ["very shy", "very proud", "very disappointed"]},
                          {q: 15, text: "What advice does the speaker give about makeup kits?", opts: ["Always carry a basic kit with you.", "Only buy the best products for a makeup kit.", "Ask other makeup artists to check your kit."]},
                          {q: 16, text: "What advice does the speaker give about creating a portfolio?", opts: ["Keep print and digital photos.", "Only include a small selection of photos.", "Get permission to use photos."]}
                        ].map((item) => (
                            <div key={item.q}>
                                <div className="font-bold mb-3 flex"><span className="w-8 shrink-0">{item.q}</span><span>{item.text}</span></div>
                                <div className="pl-8 space-y-1">
                                    {['A', 'B', 'C'].map((val, idx) => (
                                        <label key={val} className={\`mcq-label \${answers[item.q] === val ? 'bg-blue-50 border-blue-200' : ''}\`}>
                                            <input type="radio" name={\`q\${item.q}\`} value={val} checked={answers[item.q] === val} onChange={(e) => handleAnswerChange(item.q, e.target.value)} className="w-5 h-5 mr-4 text-[#1E4DB7] mt-1 shrink-0" />
                                            <span className="font-bold mr-3">{val}</span> {item.opts[idx]}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-300 pt-8">
                    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 17-20</div>
                    <div className="mb-4 italic text-[15px] text-gray-700">What ability is required for each of the following duties?</div>
                    <div className="mb-6 font-bold text-[15px] uppercase">Write the correct letter, A, B, or C, next to Questions 17-20.</div>

                    <div className="border border-[#333] p-6 bg-white">
                        <div className="bg-gray-100 p-6 border border-gray-300 mb-8 max-w-[600px] mx-auto">
                            <div className="grid grid-cols-1 gap-y-3 pl-4">
                                <div><span className="font-bold mr-3">A</span> being well-organised</div>
                                <div><span className="font-bold mr-3">B</span> being flexible</div>
                                <div><span className="font-bold mr-3">C</span> working quickly</div>
                            </div>
                        </div>

                        <div className="font-bold mb-4 text-[18px] border-b pb-2 text-center">Duties</div>
                        <div className="space-y-4 max-w-[450px] mx-auto">
                            {[
                                {q: 17, text: "Prepping an actor"},
                                {q: 18, text: "Continuity"},
                                {q: 19, text: "General"},
                                {q: 20, text: "Applying makeup"}
                            ].map(item => (
                                <div key={item.q} className="flex items-center justify-between">
                                    <span className="font-bold w-8">{item.q}</span>
                                    <span className="flex-1">{item.text}</span>
                                    <input type="text" placeholder={item.q.toString()} className={\`ielts-input ielts-input-short uppercase \${answers[item.q] ? 'active-state' : ''}\`} maxLength={1} value={answers[item.q] || ''} onChange={(e) => handleAnswerChange(item.q, e.target.value.toUpperCase())} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              </div>

              {/* Part 3 */}`);

// Replace Part 3
code = code.replace(/\{\/\* Part 3 \*\/\}[\s\S]*?\{\/\* Part 4 \*\/\}/, `{/* Part 3 */}
              <div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 3 ? 'block' : 'hidden'}\`}>
                
                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 21 and 22</div>
                <div className="mb-6 italic text-[15px] text-gray-700">Choose <span className="font-bold">TWO</span> letters, A-E.</div>

                <div className="border border-[#333] p-6 bg-white mb-8">
                    <div className="space-y-4">
                        <div className="font-bold mb-3">Which TWO features of the lecture on ocean biodiversity had the greatest impact on the students?</div>
                        <div className="pl-4 space-y-1 pb-4">
                            {[
                                {val: 'A', text: "the references to local problems"},
                                {val: 'B', text: "the broad focus of the examples"},
                                {val: 'C', text: "the practical suggestions for solutions"},
                                {val: 'D', text: "the type of issues discussed"},
                                {val: 'E', text: "the implications for government policy"}
                            ].map(opt => {
                                const isChecked = answers[21] === opt.val || answers[22] === opt.val;
                                return (
                                    <label key={opt.val} className={\`mcq-label \${isChecked ? 'bg-blue-50 border-blue-200' : ''}\`}>
                                        <input type="checkbox" name="q21_22" value={opt.val} checked={isChecked} onChange={(e) => {
                                            if (e.target.checked) {
                                                if (!answers[21]) handleAnswerChange(21, opt.val);
                                                else if (!answers[22]) handleAnswerChange(22, opt.val);
                                            } else {
                                                if (answers[21] === opt.val) handleAnswerChange(21, '');
                                                else if (answers[22] === opt.val) handleAnswerChange(22, '');
                                            }
                                        }} className="w-5 h-5 mr-4 text-[#1E4DB7] mt-1 shrink-0" />
                                        <span className="font-bold mr-3">{opt.val}</span> {opt.text}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 23 and 24</div>
                <div className="mb-6 italic text-[15px] text-gray-700">Choose <span className="font-bold">TWO</span> letters, A-E.</div>

                <div className="border border-[#333] p-6 bg-white mb-8">
                    <div className="space-y-4">
                        <div className="font-bold mb-3">Which TWO details about the research project particularly impressed the students?</div>
                        <div className="pl-4 space-y-1 pb-4">
                            {[
                                {val: 'A', text: "the team's previous successes"},
                                {val: 'B', text: "its wide geographical scale"},
                                {val: 'C', text: "the use of new technology"},
                                {val: 'D', text: "the extensive statistical evidence"},
                                {val: 'E', text: "the large range of specialists involved"}
                            ].map(opt => {
                                const isChecked = answers[23] === opt.val || answers[24] === opt.val;
                                return (
                                    <label key={opt.val} className={\`mcq-label \${isChecked ? 'bg-blue-50 border-blue-200' : ''}\`}>
                                        <input type="checkbox" name="q23_24" value={opt.val} checked={isChecked} onChange={(e) => {
                                            if (e.target.checked) {
                                                if (!answers[23]) handleAnswerChange(23, opt.val);
                                                else if (!answers[24]) handleAnswerChange(24, opt.val);
                                            } else {
                                                if (answers[23] === opt.val) handleAnswerChange(23, '');
                                                else if (answers[24] === opt.val) handleAnswerChange(24, '');
                                            }
                                        }} className="w-5 h-5 mr-4 text-[#1E4DB7] mt-1 shrink-0" />
                                        <span className="font-bold mr-3">{opt.val}</span> {opt.text}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-300 pt-8">
                    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 25-30</div>
                    <div className="mb-4 italic text-[15px] text-gray-700">What is the students' opinion of each of the following resources related to ocean biodiversity?</div>
                    <div className="mb-6 font-bold text-[15px] uppercase">Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25-30.</div>

                    <div className="border border-[#333] p-6 bg-white">
                        <div className="bg-gray-100 p-6 border border-gray-300 mb-8 max-w-[600px] mx-auto">
                            <div className="font-bold mb-4 text-center border-b border-gray-300 pb-2 text-[18px]">Opinions</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 pl-4">
                                <div><span className="font-bold mr-3">A</span> This is aimed at a very specialist audience.</div>
                                <div><span className="font-bold mr-3">B</span> This is now rather outdated.</div>
                                <div><span className="font-bold mr-3">C</span> This was an effective description of a new danger.</div>
                                <div><span className="font-bold mr-3">D</span> This suggests possible ways to improve the situation.</div>
                                <div><span className="font-bold mr-3">E</span> This does not give a balanced account.</div>
                                <div><span className="font-bold mr-3">F</span> This is too predictable to be useful.</div>
                                <div><span className="font-bold mr-3">G</span> This gives insufficient evidence for its claims.</div>
                                <div><span className="font-bold mr-3">H</span> This gives a clear explanation of the problems.</div>
                            </div>
                        </div>

                        <div className="font-bold mb-4 text-[18px] border-b pb-2 text-center">Resources</div>
                        <div className="space-y-4 max-w-[500px] mx-auto">
                            {[
                                {q: 25, text: "Article on invasive lionfish"},
                                {q: 26, text: "Documentary on microplastics"},
                                {q: 27, text: "Podcast on ocean pollution"},
                                {q: 28, text: "Book on coastal ecosystems"},
                                {q: 29, text: "Article on metal toxicity"},
                                {q: 30, text: "Podcast on floating marine cities"}
                            ].map(item => (
                                <div key={item.q} className="flex items-center justify-between">
                                    <span className="font-bold w-8">{item.q}</span>
                                    <span className="flex-1">{item.text}</span>
                                    <input type="text" placeholder={item.q.toString()} className={\`ielts-input ielts-input-short uppercase \${answers[item.q] ? 'active-state' : ''}\`} maxLength={1} value={answers[item.q] || ''} onChange={(e) => handleAnswerChange(item.q, e.target.value.toUpperCase())} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              </div>

              {/* Part 4 */}`);

// Replace Part 4
code = code.replace(/\{\/\* Part 4 \*\/\}[\s\S]*?\{\/\* Navigation Footer \*\/\}/, `{/* Part 4 */}
              <div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 4 ? 'block' : 'hidden'}\`}>
                <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 31-40</div>
                <div className="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
                <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>

                <div className="border border-[#333] p-6 bg-white mb-8">
                    <h2 className="font-bold text-[22px] mb-6 text-center text-black tracking-wide">Sources of rubber</h2>
                    
                    <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2 mt-4">Three resources which are essential for industrial civilisation</div>
                    <ul className="list-none space-y-4 mb-8 pl-4">
                        <li>&bull; <span className="font-bold mx-2">31</span><input type="text" placeholder="31" className={\`ielts-input \${answers[31] ? 'active-state' : ''}\`} value={answers[31] || ''} onChange={(e) => handleAnswerChange(31, e.target.value)} /></li>
                        <li>&bull; fossil fuels</li>
                        <li>&bull; rubber</li>
                    </ul>

                    <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2">Natural rubber</div>
                    <p className="mb-4 pl-4">This mainly comes from the Pará rubber tree, now cultivated in South-East Asia.</p>
                    <p className="mb-2 pl-4">The supply is limited because</p>
                    <ul className="list-none space-y-4 mb-8 pl-8">
                        <li>&bull; the growth of the tree is <span className="font-bold mx-2">32</span><input type="text" placeholder="32" className={\`ielts-input \${answers[32] ? 'active-state' : ''}\`} value={answers[32] || ''} onChange={(e) => handleAnswerChange(32, e.target.value)} /></li>
                        <li>&bull; production cannot easily be adjusted because of increasing or decreasing <span className="font-bold mx-2">33</span><input type="text" placeholder="33" className={\`ielts-input \${answers[33] ? 'active-state' : ''}\`} value={answers[33] || ''} onChange={(e) => handleAnswerChange(33, e.target.value)} /></li>
                        <li>&bull; the tree only grows near the <span className="font-bold mx-2">34</span><input type="text" placeholder="34" className={\`ielts-input \${answers[34] ? 'active-state' : ''}\`} value={answers[34] || ''} onChange={(e) => handleAnswerChange(34, e.target.value)} /></li>
                        <li>&bull; extracting the latex (rubber) is labour-intensive</li>
                        <li>&bull; it is very difficult to <span className="font-bold mx-2">35</span><input type="text" placeholder="35" className={\`ielts-input \${answers[35] ? 'active-state' : ''}\`} value={answers[35] || ''} onChange={(e) => handleAnswerChange(35, e.target.value)} /> rubber after production.</li>
                    </ul>
                    
                    <p className="mb-2 pl-4">New threats include</p>
                    <ul className="list-none space-y-4 mb-8 pl-8">
                        <li>&bull; lack of genetic diversity, leading to danger of disease caused by a <span className="font-bold mx-2">36</span><input type="text" placeholder="36" className={\`ielts-input \${answers[36] ? 'active-state' : ''}\`} value={answers[36] || ''} onChange={(e) => handleAnswerChange(36, e.target.value)} /></li>
                        <li>&bull; a shift to the cultivation of palm oil</li>
                        <li>&bull; extreme <span className="font-bold mx-2">37</span><input type="text" placeholder="37" className={\`ielts-input \${answers[37] ? 'active-state' : ''}\`} value={answers[37] || ''} onChange={(e) => handleAnswerChange(37, e.target.value)} /> events.</li>
                    </ul>

                    <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2">Synthetic rubber</div>
                    <ul className="list-none space-y-4 mb-8 pl-4">
                        <li>&bull; may be used for engine parts and cooking utensils</li>
                        <li>&bull; is less <span className="font-bold mx-2">38</span><input type="text" placeholder="38" className={\`ielts-input \${answers[38] ? 'active-state' : ''}\`} value={answers[38] || ''} onChange={(e) => handleAnswerChange(38, e.target.value)} /> than natural rubber</li>
                        <li>&bull; is unsuitable for many purposes e.g. the tyres of aircraft.</li>
                    </ul>

                    <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2">An alternative source of natural rubber</div>
                    <ul className="list-none space-y-4 pl-4">
                        <li>&bull; A wild flower (a type of dandelion) has rubber in its <span className="font-bold mx-2">39</span><input type="text" placeholder="39" className={\`ielts-input \${answers[39] ? 'active-state' : ''}\`} value={answers[39] || ''} onChange={(e) => handleAnswerChange(39, e.target.value)} /> .</li>
                        <li>&bull; It can be grown in many locations and does not require good <span className="font-bold mx-2">40</span><input type="text" placeholder="40" className={\`ielts-input \${answers[40] ? 'active-state' : ''}\`} value={answers[40] || ''} onChange={(e) => handleAnswerChange(40, e.target.value)} /> .</li>
                    </ul>
                </div>
              </div>

          </div>

          {/* Navigation Footer */}`);

fs.writeFileSync(filePath, code);
