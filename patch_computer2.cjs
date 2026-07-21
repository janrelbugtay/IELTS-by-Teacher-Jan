const fs = require('fs');

const file = 'src/pages/ComputerWritingTest.tsx';
const searchStr = `{isAdmin && state.aiFeedback && !state.aiFeedback.includes('pending') && !isEditingReport && (
                                        <button
                                            onClick={() => {
                                                setEditedFeedback(state.aiFeedback);
                                                setEditedBandScore(state.aiBandScore);
                                                setIsEditingReport(true);
                                            }}
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition border border-slate-200"
                                        >
                                            Edit Report
                                        </button>
                                    )}`;

const replaceStr = `{isAdmin && state.aiFeedback && !state.aiFeedback.includes('pending') && !isEditingReport && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditedFeedback(state.aiFeedback);
                                                    setEditedBandScore(state.aiBandScore);
                                                    setIsEditingReport(true);
                                                }}
                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition border border-slate-200"
                                            >
                                                Edit Report
                                            </button>
                                            <button
                                                onClick={handleGenerateReport}
                                                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm font-bold rounded-xl transition border border-blue-200 flex items-center justify-center cursor-pointer"
                                            >
                                                Re-evaluate
                                            </button>
                                        </>
                                    )}`;

if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(searchStr, replaceStr);
    fs.writeFileSync(file, content);
    console.log('Patched ' + file + ' successfully');
} else {
    console.log('File not found: ' + file);
}
