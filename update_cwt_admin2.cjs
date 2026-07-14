const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerWritingTest.tsx', 'utf8');

const target1 = `                        <div className="w-full max-w-4xl p-6 md:p-10 my-6 bg-white rounded-2xl shadow-md border border-slate-200">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                                <h3 className="text-2xl font-bold text-slate-800">Teacher Jan will check your writing. Please wait!</h3>`;

const replacement1 = `                        {isAdmin ? (
                        <div className="w-full max-w-4xl p-6 md:p-10 my-6 bg-white rounded-2xl shadow-md border border-slate-200">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                                <h3 className="text-2xl font-bold text-slate-800">Teacher Jan will check your writing. Please wait!</h3>`;

code = code.replace(target1, replacement1);

const target2 = `                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div className="px-8 py-5 bg-[#f8fafc] border-b border-gray-200 flex-none">`;

const replacement2 = `                                )}
                            </div>
                        </div>
                        ) : (
                            <div className="w-full max-w-4xl p-6 md:p-10 my-6 bg-white rounded-2xl shadow-md border border-slate-200 text-center">
                                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Test Submitted Successfully</h3>
                                <p className="text-slate-600 font-medium">Your essay has been saved. The teacher will review your writing soon.</p>
                            </div>
                        )}
                    </div>
                )}
                <div className="px-8 py-5 bg-[#f8fafc] border-b border-gray-200 flex-none">`;

code = code.replace(target2, replacement2);
fs.writeFileSync('src/pages/ComputerWritingTest.tsx', code);
console.log("Updated ComputerWritingTest.tsx", code.includes("CheckCircle2 className=\"w-16 h-16 text-green-500"));
