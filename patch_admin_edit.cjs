const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/AprilListeningTest.tsx',
  'src/pages/AprilReadingTest.tsx',
  'src/pages/AugustListeningTest.tsx',
  'src/pages/AugustReadingTest.tsx',
  'src/pages/ComputerListeningTest.tsx',
  'src/pages/ComputerReadingTest.tsx',
  'src/pages/FebruaryListeningTest.tsx',
  'src/pages/FebruaryReadingTest.tsx',
  'src/pages/JanuaryListeningTest.tsx',
  'src/pages/JulyListeningTest.tsx',
  'src/pages/JuneListeningTest.tsx',
  'src/pages/MarchListeningTest.tsx',
  'src/pages/MarchReadingTest.tsx',
  'src/pages/MayListeningTest.tsx',
  'src/pages/MayReadingTest.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add states
  if (!content.includes('const [adminEditingMode')) {
    content = content.replace(
      /const \[answers, setAnswers\] = useState<Record<number, string>>\(\{\}\);/,
      `const [answers, setAnswers] = useState<Record<number, string>>({});
  const [adminEditingMode, setAdminEditingMode] = useState(false);
  const [manualScore, setManualScore] = useState<number | null>(null);
  const [manualBandScore, setManualBandScore] = useState<number | null>(null);`
    );
  }

  // 2. Load manual score
  if (!content.includes('setManualScore(data.score)')) {
    content = content.replace(
      /setAnswers\(parsedAnswers\);/,
      `setAnswers(parsedAnswers);
            if (data.score !== undefined) setManualScore(data.score);
            if (data.bandScore !== undefined) setManualBandScore(data.bandScore);`
    );
  }

  // 3. Update score overrides
  if (!content.includes('const finalScore = manualScore')) {
    content = content.replace(
      /else if \(score >= 1\) bandScore = 1\.0;\n/g,
      `else if (score >= 1) bandScore = 1.0;

    const finalScore = manualScore !== null ? manualScore : score;
    const finalBandScore = manualBandScore !== null ? manualBandScore : bandScore;
\n`
    );
    // Replace `{score}` with `{finalScore}` and `{bandScore.toFixed(1)}` with `{finalBandScore.toFixed(1)}` in the result display.
    // Actually, maybe it's safer to just change the display variables.
    // In listening/reading test, it is `bandScore.toFixed(1)` and `{score}`.
    // Let's replace `{bandScore.toFixed(1)}` with `{finalBandScore.toFixed(1)}` and `{score}<span` with `{finalScore}<span`.
    content = content.replace(/\{bandScore\.toFixed\(1\)\}/g, '{finalBandScore.toFixed(1)}');
    content = content.replace(/\{score\}<span/g, '{finalScore}<span');
  }

  // 4. Update renderGradedRow to have input
  if (!content.includes('adminEditingMode ?')) {
    // The structure is `<span className={isCorrect ? '' : (userAns ? ...)}> ... </span>`
    // We want to replace `<div className={\`flex-1 flex flex-col justify-center px-4 py-2 font-medium text-[1em] \${isCorrect ? 'bg-white text-green-900' : 'bg-white'}\`}>`
    // and its children until the `</div>` that closes it.
    
    // It's easier to find:
    const regex = /<span className=\{isCorrect \? '' : \(userAns \? 'text-red-600 line-through opacity-80' : 'text-gray-500 italic text-\[0\.875em\]'\)\}>\s*\{userAns \|\| 'No Answer'\}\s*<\/span>\s*\{\!isCorrect && \(\s*<span className=\{\`text-\[0\.875em\] font-bold block mt-1 flex items-center gap-1 text-green-600\`\}>\s*<CheckCircle2 size=\{14\} \/> \{(LISTENING_ANSWER_KEY|READING_ANSWER_KEY)\[qNum\]\}\s*<\/span>\s*\)\}/g;
    
    content = content.replace(regex, (match, keyType) => {
      return `{isAdmin && adminEditingMode ? (
              <input type="text" className="w-full border rounded px-2 py-1 text-sm font-bold bg-white text-black outline-none focus:ring-2 focus:ring-blue-500" value={answers[qNum] || ''} onChange={(e) => setAnswers(prev => ({ ...prev, [qNum]: e.target.value }))} placeholder="Edit answer..." onClick={e => e.stopPropagation()} />
            ) : (
              <>
                ${match}
              </>
            )}`;
    });
  }

  // 5. Add Admin Panel before "IELTS * Results" header
  if (!content.includes('Admin Controls: Edit Results')) {
    // Search for the header
    const headerRegex = /<h1 className=\{\`text-\[2\.25em\] font-bold text-center mb-10 font-serif\`\}>IELTS (Listening|Reading) Results<\/h1>/g;
    content = content.replace(headerRegex, (match) => {
      return `${match}
            
            {isAdmin && submissionId && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between shadow-sm gap-4">
                <div className="text-yellow-800 font-bold">Admin Controls: Edit Results</div>
                <div className="flex flex-wrap items-center gap-4">
                   {adminEditingMode ? (
                     <>
                        <div className="flex items-center gap-2">
                           <label className="text-xs font-bold text-yellow-800 uppercase">Raw Score Override:</label>
                           <input type="number" min="0" max="40" className="w-16 px-2 py-1 border rounded bg-white text-black" value={manualScore !== null ? manualScore : ''} onChange={e => setManualScore(e.target.value ? parseInt(e.target.value) : null)} placeholder="Auto" />
                        </div>
                        <div className="flex items-center gap-2">
                           <label className="text-xs font-bold text-yellow-800 uppercase">Band Score Override:</label>
                           <input type="number" step="0.5" min="0" max="9" className="w-16 px-2 py-1 border rounded bg-white text-black" value={manualBandScore !== null ? manualBandScore : ''} onChange={e => setManualBandScore(e.target.value ? parseFloat(e.target.value) : null)} placeholder="Auto" />
                        </div>
                        <button onClick={async () => {
                           try {
                             const { updateDoc, doc } = require('firebase/firestore');
                             const { db } = require('../lib/firebase');
                             const scoreVal = manualScore !== null ? manualScore : score;
                             const bandScoreVal = manualBandScore !== null ? manualBandScore : bandScore;
                             await updateDoc(doc(db, 'submissions', submissionId), { answers: JSON.stringify(answers), score: scoreVal, bandScore: bandScoreVal });
                             setAdminEditingMode(false);
                             alert("Saved successfully!");
                           } catch(err) { alert("Failed to save"); console.error(err); }
                        }} className="bg-green-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-green-700">Save Changes</button>
                        <button onClick={() => setAdminEditingMode(false)} className="text-gray-600 hover:text-gray-800 font-bold px-2">Cancel</button>
                     </>
                   ) : (
                     <button onClick={() => setAdminEditingMode(true)} className="bg-yellow-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-yellow-700">Edit Answers & Score</button>
                   )}
                </div>
              </div>
            )}`;
    });
  }

  fs.writeFileSync(file, content, 'utf8');
}
console.log('Patch complete.');
