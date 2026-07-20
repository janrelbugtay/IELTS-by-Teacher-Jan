const fs = require('fs');
let file = fs.readFileSync('src/pages/JulyListeningTest.tsx', 'utf8');

const regex = /(<div className="w-full max-w-\[1000px\] min-h-full">)[\s\S]*?(<\/div>\s*<\/div>\s*<div className="bg-\[#e1e5eb\] border-t border-gray-300 p-2 flex justify-between)/;

const match = file.match(regex);
if (match) {
    const replacement = `$1
<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 1 ? 'block' : 'hidden'}\`}>
    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 1-10</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Complete the form below.</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>
    <div className="content-box">
        <h2 className="font-bold text-[22px] mb-6 text-black tracking-wide text-center">Survey about shopping in Broadbeach</h2>
        <p className="mb-4"><strong>Name:</strong> Martyn <span className="font-bold mx-2">1</span><input type="text" placeholder="1" className={\`ielts-input \${answers[1] ? 'active-state' : ''}\`} value={answers[1] || ''} onChange={(e) => handleAnswerChange(1, e.target.value)} disabled={isSubmitted} /></p>
        
        <p className="mb-4"><strong>Today's journey to Broadbeach town centre:</strong><br/>
        used his <span className="font-bold mx-2">2</span><input type="text" placeholder="2" className={\`ielts-input \${answers[2] ? 'active-state' : ''}\`} value={answers[2] || ''} onChange={(e) => handleAnswerChange(2, e.target.value)} disabled={isSubmitted} /></p>

        <p className="mb-2"><strong>Purpose of today's trip:</strong></p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>has visited the <span className="font-bold mx-2">3</span><input type="text" placeholder="3" className={\`ielts-input \${answers[3] ? 'active-state' : ''}\`} value={answers[3] || ''} onChange={(e) => handleAnswerChange(3, e.target.value)} disabled={isSubmitted} /></li>
            <li>looking for a new <span className="font-bold mx-2">4</span><input type="text" placeholder="4" className={\`ielts-input \${answers[4] ? 'active-state' : ''}\`} value={answers[4] || ''} onChange={(e) => handleAnswerChange(4, e.target.value)} disabled={isSubmitted} /></li>
            <li>collecting <span className="font-bold mx-2">5</span><input type="text" placeholder="5" className={\`ielts-input \${answers[5] ? 'active-state' : ''}\`} value={answers[5] || ''} onChange={(e) => handleAnswerChange(5, e.target.value)} disabled={isSubmitted} /> (after repair)</li>
        </ul>

        <p className="mb-6"><strong>Preferred day for shopping:</strong> <span className="font-bold mx-2">6</span><input type="text" placeholder="6" className={\`ielts-input \${answers[6] ? 'active-state' : ''}\`} value={answers[6] || ''} onChange={(e) => handleAnswerChange(6, e.target.value)} disabled={isSubmitted} /></p>

        <p className="mb-2 font-bold text-[18px]">Opinions about shopping in the town centre</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Finds the service in shops is excellent</li>
            <li>Thinks there are too many places selling <span className="font-bold mx-2">7</span><input type="text" placeholder="7" className={\`ielts-input \${answers[7] ? 'active-state' : ''}\`} value={answers[7] || ''} onChange={(e) => handleAnswerChange(7, e.target.value)} disabled={isSubmitted} /></li>
            <li>Would like more places to buy <span className="font-bold mx-2">8</span><input type="text" placeholder="8" className={\`ielts-input \${answers[8] ? 'active-state' : ''}\`} value={answers[8] || ''} onChange={(e) => handleAnswerChange(8, e.target.value)} disabled={isSubmitted} /></li>
        </ul>

        <p className="mb-2 font-bold text-[18px]">Opinions about new out-of-town Shopping Centre</p>
        <ul className="list-disc pl-6 space-y-2">
            <li>Likes the <span className="font-bold mx-2">9</span><input type="text" placeholder="9" className={\`ielts-input \${answers[9] ? 'active-state' : ''}\`} value={answers[9] || ''} onChange={(e) => handleAnswerChange(9, e.target.value)} disabled={isSubmitted} /> best</li>
            <li>Believes the <span className="font-bold mx-2">10</span><input type="text" placeholder="10" className={\`ielts-input \${answers[10] ? 'active-state' : ''}\`} value={answers[10] || ''} onChange={(e) => handleAnswerChange(10, e.target.value)} disabled={isSubmitted} /> is unnecessary</li>
        </ul>
    </div>
</div>

<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 2 ? 'block' : 'hidden'}\`}>
    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 11 and 12</div>
    <div className="mb-6 italic text-[15px] text-gray-700">Choose <span className="font-bold">TWO</span> letters, A-E.</div>
    <div className="content-box mb-8">
        <p className="mb-4">In which TWO areas of the business exhibition did James Craig promote his company last year?</p>
        <div className="space-y-2 mb-4">
            {['A', 'B', 'C', 'D', 'E'].map(opt => (
                <div key={opt} className="flex items-start">
                    <span className="font-bold mr-3">{opt}</span> {opt === 'A' ? 'the Digital Marketing Centre' : opt === 'B' ? 'the TalkCon Zone' : opt === 'C' ? 'the Breakout area' : opt === 'D' ? 'the Business Village' : 'the Business Connections Zone'}
                </div>
            ))}
        </div>
        <div className="flex gap-4 items-center">
            <div className="flex items-center">
                <span className="font-bold mr-2">11</span>
                <input type="text" placeholder="11" className={\`ielts-input w-12 \${answers[11] ? 'active-state' : ''}\`} value={answers[11] || ''} onChange={(e) => handleAnswerChange(11, e.target.value)} disabled={isSubmitted} />
            </div>
            <div className="flex items-center">
                <span className="font-bold mr-2">12</span>
                <input type="text" placeholder="12" className={\`ielts-input w-12 \${answers[12] ? 'active-state' : ''}\`} value={answers[12] || ''} onChange={(e) => handleAnswerChange(12, e.target.value)} disabled={isSubmitted} />
            </div>
        </div>
    </div>

    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 13 and 14</div>
    <div className="mb-6 italic text-[15px] text-gray-700">Choose <span className="font-bold">TWO</span> letters, A-E.</div>
    <div className="content-box mb-8">
        <p className="mb-4">Which TWO facts are given about discounts on popular brands available to exhibitors?</p>
        <div className="space-y-2 mb-4">
            {['A', 'B', 'C', 'D', 'E'].map(opt => (
                <div key={opt} className="flex items-start">
                    <span className="font-bold mr-3">{opt}</span> {opt === 'A' ? 'They are available to all members of exhibiting companies.' : opt === 'B' ? 'They can be used for both food and clothing.' : opt === 'C' ? 'They only apply if people spend at least £400.' : opt === 'D' ? 'They can be used by family members.' : 'The percentage saved is always the same.'}
                </div>
            ))}
        </div>
        <div className="flex gap-4 items-center">
            <div className="flex items-center">
                <span className="font-bold mr-2">13</span>
                <input type="text" placeholder="13" className={\`ielts-input w-12 \${answers[13] ? 'active-state' : ''}\`} value={answers[13] || ''} onChange={(e) => handleAnswerChange(13, e.target.value)} disabled={isSubmitted} />
            </div>
            <div className="flex items-center">
                <span className="font-bold mr-2">14</span>
                <input type="text" placeholder="14" className={\`ielts-input w-12 \${answers[14] ? 'active-state' : ''}\`} value={answers[14] || ''} onChange={(e) => handleAnswerChange(14, e.target.value)} disabled={isSubmitted} />
            </div>
        </div>
    </div>

    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 15-20</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Which topic will each of the following speakers focus on?</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Choose SIX answers from the box and write the correct letter, A-G, next to Questions 15-20.</div>
    
    <div className="content-box mb-8">
        <div className="mb-6 p-4 border border-gray-300 bg-gray-50 rounded">
            <div className="font-bold mb-2">Topics</div>
            <div className="space-y-2">
                <div><span className="font-bold mr-2">A</span>Supporting job seekers</div>
                <div><span className="font-bold mr-2">B</span>Dealing with personal problems</div>
                <div><span className="font-bold mr-2">C</span>Effects of an unexpectedly rapid expansion</div>
                <div><span className="font-bold mr-2">D</span>A global range of business experiences</div>
                <div><span className="font-bold mr-2">E</span>Coping with financial set-backs</div>
                <div><span className="font-bold mr-2">F</span>Developing a company in response to changing markets</div>
                <div><span className="font-bold mr-2">G</span>Combining business success with contributions to charities</div>
            </div>
        </div>
        
        <div className="space-y-4">
            {[
                { num: 15, text: "Jim Clowrie" },
                { num: 16, text: "David France" },
                { num: 17, text: "Oliver Stanton" },
                { num: 18, text: "Francesca Heptonstall" },
                { num: 19, text: "Salman Khan" },
                { num: 20, text: "Annie Craven" }
            ].map(q => (
                <div key={q.num} className="flex items-center gap-4">
                    <span className="font-bold w-6">{q.num}</span>
                    <span className="w-48">{q.text}</span>
                    <input type="text" placeholder={q.num.toString()} className={\`ielts-input w-12 \${answers[q.num] ? 'active-state' : ''}\`} value={answers[q.num] || ''} onChange={(e) => handleAnswerChange(q.num, e.target.value)} disabled={isSubmitted} />
                </div>
            ))}
        </div>
    </div>
</div>

<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 3 ? 'block' : 'hidden'}\`}>
    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 21-23</div>
    <div className="mb-6 italic text-[15px] text-gray-700">Choose the correct letter, <span className="font-bold">A, B or C</span>.</div>
    <div className="content-box mb-8">
        <div className="space-y-6">
            <div>
                <p className="mb-2"><span className="font-bold mr-2">21</span>Which aspect of their presentation are Mia and Leo both concerned about?</p>
                <div className="pl-6 space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q21" value="A" checked={answers[21] === 'A'} onChange={() => handleAnswerChange(21, 'A')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>A</strong> meeting the deadline</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q21" value="B" checked={answers[21] === 'B'} onChange={() => handleAnswerChange(21, 'B')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>B</strong> finding suitable examples</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q21" value="C" checked={answers[21] === 'C'} onChange={() => handleAnswerChange(21, 'C')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>C</strong> including original ideas</span>
                    </label>
                </div>
            </div>

            <div>
                <p className="mb-2"><span className="font-bold mr-2">22</span>The students decide to focus their assignment on housing for</p>
                <div className="pl-6 space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q22" value="A" checked={answers[22] === 'A'} onChange={() => handleAnswerChange(22, 'A')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>A</strong> family groups.</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q22" value="B" checked={answers[22] === 'B'} onChange={() => handleAnswerChange(22, 'B')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>B</strong> old people.</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q22" value="C" checked={answers[22] === 'C'} onChange={() => handleAnswerChange(22, 'C')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>C</strong> single people.</span>
                    </label>
                </div>
            </div>

            <div>
                <p className="mb-2"><span className="font-bold mr-2">23</span>The students agree that demand for accommodation in urban areas should be met by</p>
                <div className="pl-6 space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q23" value="A" checked={answers[23] === 'A'} onChange={() => handleAnswerChange(23, 'A')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>A</strong> repurposing offices and factories.</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q23" value="B" checked={answers[23] === 'B'} onChange={() => handleAnswerChange(23, 'B')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>B</strong> constructing tall buildings.</span>
                    </label>
                    <label className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input type="radio" name="q23" value="C" checked={answers[23] === 'C'} onChange={() => handleAnswerChange(23, 'C')} disabled={isSubmitted} className="mt-1.5" />
                        <span><strong>C</strong> developing creative ideas for smaller homes.</span>
                    </label>
                </div>
            </div>
        </div>
    </div>

    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 24-30</div>
    <div className="mb-4 italic text-[15px] text-gray-700">What opinion do the students express about each of the following housing ideas?</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Choose SEVEN answers from the box and write the correct letter, A-I, next to Questions 24-30.</div>
    
    <div className="content-box mb-8">
        <div className="mb-6 p-4 border border-gray-300 bg-gray-50 rounded">
            <div className="font-bold mb-2">Opinions</div>
            <div className="space-y-2">
                <div><span className="font-bold mr-2">A</span>This could cause unnecessary anxiety.</div>
                <div><span className="font-bold mr-2">B</span>This would be especially beneficial for city residents.</div>
                <div><span className="font-bold mr-2">C</span>This would be challenging for young people.</div>
                <div><span className="font-bold mr-2">D</span>This would have environmental benefits.</div>
                <div><span className="font-bold mr-2">E</span>This could encourage creativity.</div>
                <div><span className="font-bold mr-2">F</span>This could lead to social problems.</div>
                <div><span className="font-bold mr-2">G</span>This could enable retired people to share a project.</div>
                <div><span className="font-bold mr-2">H</span>This would help some people but cause problems for others.</div>
                <div><span className="font-bold mr-2">I</span>This would suit both existing and new members of a household.</div>
            </div>
        </div>
        
        <div className="space-y-4">
            {[
                { num: 24, text: "use of roof space for gardens" },
                { num: 25, text: "shared working spaces" },
                { num: 26, text: "moveable internal walls" },
                { num: 27, text: "smart mirrors in bathrooms" },
                { num: 28, text: "bike sheds with charging points" },
                { num: 29, text: "restriction of cars to certain areas" },
                { num: 30, text: "communal vegetable plots" }
            ].map(q => (
                <div key={q.num} className="flex items-center gap-4">
                    <span className="font-bold w-6">{q.num}</span>
                    <span className="w-64">{q.text}</span>
                    <input type="text" placeholder={q.num.toString()} className={\`ielts-input w-12 \${answers[q.num] ? 'active-state' : ''}\`} value={answers[q.num] || ''} onChange={(e) => handleAnswerChange(q.num, e.target.value)} disabled={isSubmitted} />
                </div>
            ))}
        </div>
    </div>
</div>

<div className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === 4 ? 'block' : 'hidden'}\`}>
    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 31-40</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>
    <div className="content-box mb-8">
        <h2 className="font-bold text-[22px] mb-6 text-black tracking-wide text-center">Music therapy for surgical patients</h2>
        
        <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2 mt-4">Background</div>
        <ul className="list-disc space-y-4 mb-8 pl-6">
            <li>Surgery impacts patients because they may experience discomfort or unwelcome changes to their <span className="font-bold mx-2">31</span><input type="text" placeholder="31" className={\`ielts-input \${answers[31] ? 'active-state' : ''}\`} value={answers[31] || ''} onChange={(e) => handleAnswerChange(31, e.target.value)} disabled={isSubmitted} /> .</li>
            <li>Current post-surgical strategies focus mainly on pain relief.</li>
        </ul>

        <div className="font-bold mb-2 text-[18px] text-blue-900 border-b border-gray-300 pb-2">Recent research</div>
        <ul className="list-disc space-y-4 mb-8 pl-6">
            <li>A study reviewed data from about 100 <span className="font-bold mx-2">32</span><input type="text" placeholder="32" className={\`ielts-input \${answers[32] ? 'active-state' : ''}\`} value={answers[32] || ''} onChange={(e) => handleAnswerChange(32, e.target.value)} disabled={isSubmitted} /> and found that listening to music:
                <ul className="list-none space-y-2 mt-2 pl-6">
                    <li className="flex items-start">&ndash; <span className="ml-2 flex-1">improved hospital patients' sense of wellbeing.</span></li>
                    <li className="flex items-start">&ndash; <span className="ml-2 flex-1">reduced the length of their stay.</span></li>
                </ul>
            </li>
            <li>The patients in the study all listened to music with a <span className="font-bold mx-2">33</span><input type="text" placeholder="33" className={\`ielts-input \${answers[33] ? 'active-state' : ''}\`} value={answers[33] || ''} onChange={(e) => handleAnswerChange(33, e.target.value)} disabled={isSubmitted} /> effect.</li>
            <li>The music was mostly played through music <span className="font-bold mx-2">34</span><input type="text" placeholder="34" className={\`ielts-input \${answers[34] ? 'active-state' : ''}\`} value={answers[34] || ''} onChange={(e) => handleAnswerChange(34, e.target.value)} disabled={isSubmitted} /> .</li>
            <li>Patients reported an absence or low levels of <span className="font-bold mx-2">35</span><input type="text" placeholder="35" className={\`ielts-input \${answers[35] ? 'active-state' : ''}\`} value={answers[35] || ''} onChange={(e) => handleAnswerChange(35, e.target.value)} disabled={isSubmitted} /> .</li>
            <li>Medical records confirmed that patients who were played music in hospital needed less <span className="font-bold mx-2">36</span><input type="text" placeholder="36" className={\`ielts-input \${answers[36] ? 'active-state' : ''}\`} value={answers[36] || ''} onChange={(e) => handleAnswerChange(36, e.target.value)} disabled={isSubmitted} /> than those who weren't played music.</li>
            <li>The best results were achieved when patients were played music while they were <span className="font-bold mx-2">37</span><input type="text" placeholder="37" className={\`ielts-input \${answers[37] ? 'active-state' : ''}\`} value={answers[37] || ''} onChange={(e) => handleAnswerChange(37, e.target.value)} disabled={isSubmitted} /> .</li>
            <li>The study concluded that playing music was effective because it served as a <span className="font-bold mx-2">38</span><input type="text" placeholder="38" className={\`ielts-input \${answers[38] ? 'active-state' : ''}\`} value={answers[38] || ''} onChange={(e) => handleAnswerChange(38, e.target.value)} disabled={isSubmitted} /> .</li>
            <li>The researchers recommend playing either music or sounds from <span className="font-bold mx-2">39</span><input type="text" placeholder="39" className={\`ielts-input \${answers[39] ? 'active-state' : ''}\`} value={answers[39] || ''} onChange={(e) => handleAnswerChange(39, e.target.value)} disabled={isSubmitted} /> to all surgical patients.</li>
            <li>A future study will investigate the best <span className="font-bold mx-2">40</span><input type="text" placeholder="40" className={\`ielts-input \${answers[40] ? 'active-state' : ''}\`} value={answers[40] || ''} onChange={(e) => handleAnswerChange(40, e.target.value)} disabled={isSubmitted} /> for the music.</li>
        </ul>
    </div>
</div>
$2`;
    const newFile = file.replace(regex, replacement);
    fs.writeFileSync('src/pages/JulyListeningTest.tsx', newFile);
    console.log('Replaced JSX successfully.');
} else {
    console.log('Regex did not match.');
}
