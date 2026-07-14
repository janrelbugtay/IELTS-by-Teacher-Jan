const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerWritingTest.tsx', 'utf8');

// First fix the duplicated {isAdmin ? (
code = code.replace('{isAdmin ? (\n                        {isAdmin ? (\n                        <div className="w-full max-w-4xl', '{isAdmin ? (\n                        <div className="w-full max-w-4xl');

// Now replace the end block
const targetEnd = `                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div className="px-8 py-5 bg-[#f8fafc] border-b border-gray-200 flex-none">`;

const replacementEnd = `                                        )}
                                    </div>
                                )}
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
                
code = code.replace(targetEnd, replacementEnd);
fs.writeFileSync('src/pages/ComputerWritingTest.tsx', code);
console.log("Fixed!");
