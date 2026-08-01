const fs = require('fs');

let template = fs.readFileSync('src/pages/JulyListeningTest.tsx', 'utf8');
template = template.replace(/JulyListeningTest/g, 'AugustListeningTest');

const partsHTML = [
  // Part 1
  `
    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 1-10</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Questions 1-7</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>

    <div className="border border-black p-6 mb-8">
        <h3 className="text-center font-bold text-[20px] mb-4">Opportunities for voluntary work in Southoe village</h3>
        
        <p className="font-bold mb-2">Library</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Help with <span className="font-bold mx-2">1</span><input type="text" placeholder="1" className={\`ielts-input \${answers[1] ? 'active-state' : ''}\`} value={answers[1] || ''} onChange={(e) => handleAnswerChange(1, e.target.value)} disabled={isSubmitted} /> books (times to be arranged)</li>
            <li>Help needed to keep <span className="font-bold mx-2">2</span><input type="text" placeholder="2" className={\`ielts-input \${answers[2] ? 'active-state' : ''}\`} value={answers[2] || ''} onChange={(e) => handleAnswerChange(2, e.target.value)} disabled={isSubmitted} /> of books up to date</li>
            <li>Library is in the <span className="font-bold mx-2">3</span><input type="text" placeholder="3" className={\`ielts-input \${answers[3] ? 'active-state' : ''}\`} value={answers[3] || ''} onChange={(e) => handleAnswerChange(3, e.target.value)} disabled={isSubmitted} /> Room in the village hall</li>
        </ul>

        <p className="font-bold mb-2">Lunch club</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Help by providing <span className="font-bold mx-2">4</span><input type="text" placeholder="4" className={\`ielts-input \${answers[4] ? 'active-state' : ''}\`} value={answers[4] || ''} onChange={(e) => handleAnswerChange(4, e.target.value)} disabled={isSubmitted} /> </li>
            <li>Help with hobbies such as <span className="font-bold mx-2">5</span><input type="text" placeholder="5" className={\`ielts-input \${answers[5] ? 'active-state' : ''}\`} value={answers[5] || ''} onChange={(e) => handleAnswerChange(5, e.target.value)} disabled={isSubmitted} /> </li>
        </ul>

        <p className="font-bold mb-2">Help for individuals needed next week</p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Taking Mrs Carroll to <span className="font-bold mx-2">6</span><input type="text" placeholder="6" className={\`ielts-input \${answers[6] ? 'active-state' : ''}\`} value={answers[6] || ''} onChange={(e) => handleAnswerChange(6, e.target.value)} disabled={isSubmitted} /> </li>
            <li>Work in the <span className="font-bold mx-2">7</span><input type="text" placeholder="7" className={\`ielts-input \${answers[7] ? 'active-state' : ''}\`} value={answers[7] || ''} onChange={(e) => handleAnswerChange(7, e.target.value)} disabled={isSubmitted} /> at Mr Selsbury's house</li>
        </ul>
    </div>

    <div className="mb-4 italic text-[15px] text-gray-700">Questions 8-10</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Complete the table below.</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD ONLY for each answer.</div>

    <table className="w-full border-collapse border border-black mb-8">
        <thead>
            <tr>
                <th colSpan={4} className="border border-black bg-gray-100 p-2 text-center font-bold">Village social events</th>
            </tr>
            <tr>
                <th className="border border-black bg-gray-100 p-2 text-left">Date</th>
                <th className="border border-black bg-gray-100 p-2 text-left">Event</th>
                <th className="border border-black bg-gray-100 p-2 text-left">Location</th>
                <th className="border border-black bg-gray-100 p-2 text-left">Help needed</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td className="border border-black p-2">19 Oct</td>
                <td className="border border-black p-2"><span className="font-bold mx-2">8</span><input type="text" placeholder="8" className={\`ielts-input \${answers[8] ? 'active-state' : ''}\`} value={answers[8] || ''} onChange={(e) => handleAnswerChange(8, e.target.value)} disabled={isSubmitted} /></td>
                <td className="border border-black p-2">Village hall</td>
                <td className="border border-black p-2">providing refreshments</td>
            </tr>
            <tr>
                <td className="border border-black p-2">18 Nov</td>
                <td className="border border-black p-2">dance</td>
                <td className="border border-black p-2">Village hall</td>
                <td className="border border-black p-2">checking <span className="font-bold mx-2">9</span><input type="text" placeholder="9" className={\`ielts-input \${answers[9] ? 'active-state' : ''}\`} value={answers[9] || ''} onChange={(e) => handleAnswerChange(9, e.target.value)} disabled={isSubmitted} /></td>
            </tr>
            <tr>
                <td className="border border-black p-2">31 Dec</td>
                <td className="border border-black p-2">New Year's Eve party</td>
                <td className="border border-black p-2">Mountfort Hotel</td>
                <td className="border border-black p-2">designing the <span className="font-bold mx-2">10</span><input type="text" placeholder="10" className={\`ielts-input \${answers[10] ? 'active-state' : ''}\`} value={answers[10] || ''} onChange={(e) => handleAnswerChange(10, e.target.value)} disabled={isSubmitted} /></td>
            </tr>
        </tbody>
    </table>
  `,
  // Part 2
  `
    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 11-20</div>
    
    <div className="mb-4 italic text-[15px] text-gray-700">Questions 11-14</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Choose the correct letter, A, B or C.</div>

    <h3 className="text-right font-bold text-[20px] mb-6 mr-12">Oniton Hall</h3>

    {[
        { num: 11, q: "Many past owners made changes to", options: ["the gardens.", "the house.", "the farm."] },
        { num: 12, q: "Sir Edward Downes built Oniton Hall because he wanted", options: ["a place for discussing politics.", "a place to display his wealth.", "a place for artists and writers."] },
        { num: 13, q: "Visitors can learn about the work of servants in the past from", options: ["audio guides.", "photographs.", "people in costume."] },
        { num: 14, q: "What is new for children at Oniton Hall?", options: ["clothes for dressing up", "mini tractors", "the adventure playground"] }
    ].map(q => (
        <div key={q.num} className="mb-8">
            <div className="flex gap-4 mb-4">
                <span className="font-bold">{q.num}</span>
                <span>{q.q}</span>
            </div>
            <div className="pl-8 space-y-3">
                {q.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    return (
                        <label key={i} className={\`mcq-label \${answers[q.num] === letter ? 'selected' : ''}\`}>
                            <input 
                                type="radio" 
                                name={\`q\${q.num}\`} 
                                className="mcq-radio"
                                checked={answers[q.num] === letter}
                                onChange={() => handleAnswerChange(q.num, letter)}
                                disabled={isSubmitted}
                            />
                            <span className="font-bold mr-2">{letter}</span>
                            <span>{opt}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    ))}

    <div className="mb-4 italic text-[15px] text-gray-700 mt-8">Questions 15-20</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Which activity is offered at each of the following locations on the farm?</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Choose SIX answers from the box and write the correct letter, A-H, next to Questions 15-20.</div>

    <div className="border border-black p-6 w-3/4 mx-auto mb-8">
        <h4 className="text-center font-bold mb-4">Activities</h4>
        <ul className="list-none space-y-2">
            {[
                "shopping", "watching cows being milked", "seeing old farming equipment",
                "eating and drinking", "starting a trip", "seeing rare breeds of animals",
                "helping to look after animals", "using farming tools"
            ].map((activity, idx) => (
                <li key={idx}><span className="font-bold mr-4">{String.fromCharCode(65 + idx)}</span> {activity}</li>
            ))}
        </ul>
    </div>

    <div className="ml-[10%] mb-10">
        <p className="font-bold mb-6">Locations on the farm</p>
        <div className="space-y-4">
            {[
                { num: 15, text: "dairy" },
                { num: 16, text: "large barn" },
                { num: 17, text: "small barn" },
                { num: 18, text: "stables" },
                { num: 19, text: "shed" },
                { num: 20, text: "parkland" }
            ].map(q => (
                <div key={q.num} className="flex items-center gap-4">
                    <span className="font-bold w-6">{q.num}</span>
                    <span className="w-40">{q.text}</span>
                    <input type="text" placeholder={q.num.toString()} className={\`ielts-input w-12 \${answers[q.num] ? 'active-state' : ''}\`} value={answers[q.num] || ''} onChange={(e) => handleAnswerChange(q.num, e.target.value)} disabled={isSubmitted} />
                </div>
            ))}
        </div>
    </div>
  `,
  // Part 3
  `
    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 21-30</div>
    
    <div className="mb-4 italic text-[15px] text-gray-700">Questions 21 and 22</div>
    <div className="mb-4 font-bold text-[15px] uppercase">Choose TWO letters, A-E.</div>
    <div className="mb-6">Which TWO things do the students agree they need to include in their reviews of <i className="font-normal">Romeo and Juliet</i>?</div>

    <div className="pl-8 space-y-3 mb-10">
        {[
            "analysis of the text", 
            "a summary of the plot", 
            "a description of the theatre", 
            "a personal reaction", 
            "a reference to particular scenes"
        ].map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isSelected = [answers[21], answers[22]].includes(letter);
            return (
                <label key={i} className={\`mcq-label \${isSelected ? 'selected' : ''}\`}>
                    <input 
                        type="checkbox" 
                        className="mcq-radio"
                        checked={isSelected}
                        onChange={(e) => {
                            if (e.target.checked) {
                                if (!answers[21]) handleAnswerChange(21, letter);
                                else if (!answers[22]) handleAnswerChange(22, letter);
                            } else {
                                if (answers[21] === letter) handleAnswerChange(21, '');
                                else if (answers[22] === letter) handleAnswerChange(22, '');
                            }
                        }}
                        disabled={isSubmitted}
                    />
                    <span className="font-bold mr-2">{letter}</span>
                    <span>{opt}</span>
                </label>
            );
        })}
    </div>

    <div className="mb-4 italic text-[15px] text-gray-700">Questions 23-27</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Which opinion do the speakers give about each of the following aspects of The Emporium's production of <i>Romeo and Juliet</i>?</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Choose FIVE answers from the box and write the correct letter, A-G, next to Questions 23-27.</div>

    <div className="border border-black p-6 w-4/5 mx-auto mb-8">
        <h4 className="text-center font-bold mb-4">Opinions</h4>
        <ul className="list-none space-y-2">
            {[
                "They both expected this to be more traditional.",
                "They both thought this was original.",
                "They agree this created the right atmosphere.",
                "They agree this was a major strength.",
                "They were both disappointed by this.",
                "They disagree about why this was an issue.",
                "They disagree about how this could be improved."
            ].map((opinion, idx) => (
                <li key={idx}><span className="font-bold mr-4">{String.fromCharCode(65 + idx)}</span> {opinion}</li>
            ))}
        </ul>
    </div>

    <div className="ml-[10%] mb-10">
        <p className="font-bold mb-6">Aspects of the production</p>
        <div className="space-y-4">
            {[
                { num: 23, text: "the set" },
                { num: 24, text: "the lighting" },
                { num: 25, text: "the costume design" },
                { num: 26, text: "the music" },
                { num: 27, text: "the actors' delivery" }
            ].map(q => (
                <div key={q.num} className="flex items-center gap-4">
                    <span className="font-bold w-6">{q.num}</span>
                    <span className="w-48">{q.text}</span>
                    <input type="text" placeholder={q.num.toString()} className={\`ielts-input w-12 \${answers[q.num] ? 'active-state' : ''}\`} value={answers[q.num] || ''} onChange={(e) => handleAnswerChange(q.num, e.target.value)} disabled={isSubmitted} />
                </div>
            ))}
        </div>
    </div>

    <div className="mb-4 italic text-[15px] text-gray-700 mt-8">Questions 28-30</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Choose the correct letter, A, B or C.</div>

    {[
        { num: 28, q: "The students think the story of Romeo and Juliet is still relevant for young people today because", options: ["it illustrates how easily conflict can start.", "it deals with problems that families experience.", "it teaches them about relationships."] },
        { num: 29, q: "The students found watching Romeo and Juliet in another language", options: ["frustrating.", "demanding.", "moving."] },
        { num: 30, q: "Why do the students think Shakespeare's plays have such international appeal?", options: ["The stories are exciting.", "There are recognisable characters.", "They can be interpreted in many ways."] }
    ].map(q => (
        <div key={q.num} className="mb-8">
            <div className="flex gap-4 mb-4">
                <span className="font-bold">{q.num}</span>
                <span>{q.q}</span>
            </div>
            <div className="pl-8 space-y-3">
                {q.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    return (
                        <label key={i} className={\`mcq-label \${answers[q.num] === letter ? 'selected' : ''}\`}>
                            <input 
                                type="radio" 
                                name={\`q\${q.num}\`} 
                                className="mcq-radio"
                                checked={answers[q.num] === letter}
                                onChange={() => handleAnswerChange(q.num, letter)}
                                disabled={isSubmitted}
                            />
                            <span className="font-bold mr-2">{letter}</span>
                            <span>{opt}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    ))}
  `,
  // Part 4
  `
    <div className="mb-4 font-bold text-[18px] text-gray-800 italic">Questions 31-40</div>
    <div className="mb-4 italic text-[15px] text-gray-700">Complete the notes below.</div>
    <div className="mb-6 font-bold text-[15px] uppercase">Write ONE WORD AND/OR A NUMBER for each answer.</div>
    
    <div className="border border-black p-6 mb-8">
        <h3 className="text-left font-bold text-[20px] mb-6">The impact of digital technology on the Icelandic language</h3>
        
        <p className="font-bold mb-2">The Icelandic language</p>
        <ul className="list-disc pl-6 mb-6 space-y-3">
            <li>has approximately <span className="font-bold mx-2">31</span><input type="text" placeholder="31" className={\`ielts-input \${answers[31] ? 'active-state' : ''}\`} value={answers[31] || ''} onChange={(e) => handleAnswerChange(31, e.target.value)} disabled={isSubmitted} /> speakers</li>
            <li>has a <span className="font-bold mx-2">32</span><input type="text" placeholder="32" className={\`ielts-input \${answers[32] ? 'active-state' : ''}\`} value={answers[32] || ''} onChange={(e) => handleAnswerChange(32, e.target.value)} disabled={isSubmitted} /> that is still growing</li>
            <li>has not changed a lot over the last thousand years</li>
            <li>has its own words for computer-based concepts, such as web browser and <span className="font-bold mx-2">33</span><input type="text" placeholder="33" className={\`ielts-input \${answers[33] ? 'active-state' : ''}\`} value={answers[33] || ''} onChange={(e) => handleAnswerChange(33, e.target.value)} disabled={isSubmitted} /> </li>
        </ul>

        <p className="font-bold mb-2">Young speakers</p>
        <ul className="list-disc pl-6 mb-6 space-y-3">
            <li>are big users of digital technology, such as <span className="font-bold mx-2">34</span><input type="text" placeholder="34" className={\`ielts-input \${answers[34] ? 'active-state' : ''}\`} value={answers[34] || ''} onChange={(e) => handleAnswerChange(34, e.target.value)} disabled={isSubmitted} /> </li>
            <li>are becoming <span className="font-bold mx-2">35</span><input type="text" placeholder="35" className={\`ielts-input \${answers[35] ? 'active-state' : ''}\`} value={answers[35] || ''} onChange={(e) => handleAnswerChange(35, e.target.value)} disabled={isSubmitted} /> very quickly</li>
            <li>are having discussions using only English while they are in the <span className="font-bold mx-2">36</span><input type="text" placeholder="36" className={\`ielts-input \${answers[36] ? 'active-state' : ''}\`} value={answers[36] || ''} onChange={(e) => handleAnswerChange(36, e.target.value)} disabled={isSubmitted} /> at school</li>
            <li>are better able to identify the content of a <span className="font-bold mx-2">37</span><input type="text" placeholder="37" className={\`ielts-input \${answers[37] ? 'active-state' : ''}\`} value={answers[37] || ''} onChange={(e) => handleAnswerChange(37, e.target.value)} disabled={isSubmitted} /> in English than Icelandic</li>
        </ul>

        <p className="font-bold mb-2">Technology and internet companies</p>
        <ul className="list-disc pl-6 mb-6 space-y-3">
            <li>write very little in Icelandic because of the small number of speakers and because of how complicated its <span className="font-bold mx-2">38</span><input type="text" placeholder="38" className={\`ielts-input \${answers[38] ? 'active-state' : ''}\`} value={answers[38] || ''} onChange={(e) => handleAnswerChange(38, e.target.value)} disabled={isSubmitted} /> is</li>
        </ul>

        <p className="font-bold mb-2">The Icelandic government</p>
        <ul className="list-disc pl-6 mb-6 space-y-3">
            <li>has set up a fund to support the production of more digital content in the language</li>
            <li>believes that Icelandic has a secure future</li>
            <li>is worried that young Icelanders may lose their <span className="font-bold mx-2">39</span><input type="text" placeholder="39" className={\`ielts-input \${answers[39] ? 'active-state' : ''}\`} value={answers[39] || ''} onChange={(e) => handleAnswerChange(39, e.target.value)} disabled={isSubmitted} /> as Icelanders</li>
            <li>is worried about the consequences of children not being <span className="font-bold mx-2">40</span><input type="text" placeholder="40" className={\`ielts-input \${answers[40] ? 'active-state' : ''}\`} value={answers[40] || ''} onChange={(e) => handleAnswerChange(40, e.target.value)} disabled={isSubmitted} /> in either Icelandic or English</li>
        </ul>
    </div>
  `
];

for (let i = 1; i <= 4; i++) {
  const startMarker = `className={\`bg-white p-10 border border-gray-300 shadow-sm text-[16px] leading-[1.8] \${currentPartIndex === ${i} ? 'block' : 'hidden'}\`}>`;
  
  const startIndex = template.indexOf(startMarker);
  
  if (startIndex === -1) {
    console.log("Could not find start marker for part", i);
    continue;
  }
  
  // Find the closing div corresponding to the startMarker div
  let depth = 0;
  let endIndex = -1;
  let inJSX = true;
  for (let j = startIndex; j < template.length; j++) {
    if (template.substring(j, j + 4) === '<div') depth++;
    if (template.substring(j, j + 5) === '</div') {
      depth--;
      if (depth === 0) {
        endIndex = j;
        break;
      }
    }
  }

  if (endIndex !== -1) {
    template = template.substring(0, startIndex + startMarker.length) + '\n' + partsHTML[i - 1] + '\n' + template.substring(endIndex);
  }
}

fs.writeFileSync('src/pages/AugustListeningTest.tsx', template);
console.log("Done fixed");
