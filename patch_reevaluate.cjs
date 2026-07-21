const fs = require('fs');

const filesToPatch = [
    'src/pages/JanuaryWritingTest.tsx',
    'src/pages/FebruaryWritingTest.tsx',
    'src/pages/MarchWritingTest.tsx',
    'src/pages/AprilWritingTest.tsx',
    'src/pages/MayWritingTest.tsx'
];

const searchStr = `{isAdmin && (
                                <button 
                                    onClick={() => {
                                        if (taskNum === 1) {
                                            setEditedReport1(JSON.parse(JSON.stringify(data)));
                                            setIsEditingReport1(true);
                                        } else {
                                            setEditedReport2(JSON.parse(JSON.stringify(data)));
                                            setIsEditingReport2(true);
                                        }
                                    }}
                                    className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded"
                                >
                                    Edit Report
                                </button>
                            )}`;

const replaceStr = `{isAdmin && (
                                <>
                                    <button 
                                        onClick={() => {
                                            if (taskNum === 1) {
                                                setEditedReport1(JSON.parse(JSON.stringify(data)));
                                                setIsEditingReport1(true);
                                            } else {
                                                setEditedReport2(JSON.parse(JSON.stringify(data)));
                                                setIsEditingReport2(true);
                                            }
                                        }}
                                        className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded"
                                    >
                                        Edit Report
                                    </button>
                                    <button 
                                        onClick={() => getAIFeedback(taskNum)}
                                        className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-indigo-900 text-xs font-bold rounded ml-2 flex items-center justify-center cursor-pointer"
                                    >
                                        Re-evaluate
                                    </button>
                                </>
                            )}`;

for (const file of filesToPatch) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(searchStr, replaceStr);
        fs.writeFileSync(file, content);
        console.log('Patched ' + file + ' successfully');
    } else {
        console.log('File not found: ' + file);
    }
}
