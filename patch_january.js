const fs = require('fs');

const file = 'src/pages/JanuaryListeningTest.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';",
  "import { collection, addDoc, serverTimestamp, getDoc, doc, setDoc } from 'firebase/firestore';"
);

content = content.replace(
  /const \[candidateNumber, setCandidateNumber[^]+?\}, \[isAdmin\]\);/g,
  `const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    async function checkPublished() {
      try {
        const docRef = doc(db, 'test_settings', \`listening_\${id}\`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsPublished(docSnap.data().isPublished !== false);
        }
      } catch (err) {
        console.error("Failed to fetch test settings", err);
      }
    }
    checkPublished();
  }, [id]);

  const handleTogglePublish = async () => {
    const newVal = !isPublished;
    setIsPublished(newVal);
    try {
      await setDoc(doc(db, 'test_settings', \`listening_\${id}\`), { isPublished: newVal }, { merge: true });
    } catch (err) {
      console.error("Failed to update test settings", err);
    }
  };`
);

content = content.replace(
  /e\.preventDefault\(\);\s+if \(candidateNumber\.trim\(\)\.toUpperCase\(\) !== expectedCandidateNumber\) \{\s+setCandidateError\('Invalid Candidate Number\. Please check with your administrator\.'\);\s+return;\s+\}\s+setCandidateError\(''\);/g,
  `e.preventDefault();`
);

content = content.replace(
  /<div>\s*<label className="block text-sm font-bold mb-2 text-gray-800">Candidate Number<\/label>[^]+?\{candidateError[^]+?<\/div>/g,
  `{isAdmin && (
                  <div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <div>
                        <div className="font-bold text-gray-800 text-sm">Test Visibility (Admin Only)</div>
                        <div className="text-xs text-gray-500 mt-1">Control whether students can take this test.</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isPublished} onChange={handleTogglePublish} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                )}`
);

content = content.replace(
  /<button type="submit" disabled=\{!studentName\.trim\(\)\} className="mt-4 w-full bg-blue-600 text-white font-bold py-3\.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0\.5 active:translate-y-0 transition-all text-\[15px\] disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed">\s*Start Test Now\s*<\/button>/g,
  `{!isAdmin && !isPublished ? (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800 text-center font-medium text-sm">
                     Test is currently unpublished. Please ask your administrator for permission to access this test.
                  </div>
                ) : (
                  <button type="submit" disabled={!studentName.trim()} className="mt-4 w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all text-[15px] disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed">
                      Start Test Now
                  </button>
                )}`
);

fs.writeFileSync(file, content);
console.log('Patched');
