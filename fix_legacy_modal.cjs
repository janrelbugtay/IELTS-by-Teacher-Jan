const fs = require('fs');

const files = [
    'src/pages/JanuaryWritingTest.tsx',
    'src/pages/FebruaryWritingTest.tsx',
    'src/pages/MarchWritingTest.tsx',
    'src/pages/AprilWritingTest.tsx'
];

for(const file of files) {
    let code = fs.readFileSync(file, 'utf8');

    const targetModal = `            {!examStarted && !isSubmitted && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-sm shadow-xl p-6 w-[400px] max-w-full m-4">
                        <div className="flex items-center justify-between mb-4 border-b pb-2 border-gray-200">
                            <h2 className="text-lg font-bold text-gray-800">Candidate Details</h2>
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <p className="text-sm text-gray-600 mb-5">Please enter your details to begin the writing test.</p>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                            <input type="text" value={candidateName} onChange={e => setCandidateName(e.target.value.toUpperCase())} className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g., JOHN DOE" />
                        </div>
                        <div className="flex justify-end">
                            <button onClick={startTest} className="bg-[#3b82f6] text-white font-bold py-2 px-6 rounded-sm border border-[#2563eb] shadow-sm hover:bg-blue-600 focus:outline-none active:bg-blue-700 transition-colors cursor-pointer">Start Test</button>
                        </div>
                    </div>
                </div>
            )}`;

    const modalReplace = `            {!examStarted && !isSubmitted && (
                <div className="fixed inset-0 bg-gradient-to-br from-[#e0e7ff] via-[#d2d6de] to-[#fbcfe8] z-50 flex items-center justify-center overflow-hidden">
                    <div className="absolute w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -top-10 -left-10 animate-blob"></div>
                    <div className="absolute w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 top-40 right-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 bottom-10 left-20 animate-blob animation-delay-4000"></div>
                    
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-8 w-[500px] max-w-[90%] m-4 z-10 border border-white/40 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                            </div>
                        </div>
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-2 text-center">IELTS Writing Test</h2>
                        <p className="text-gray-500 text-center mb-8 text-sm font-medium">Please select your mode and enter your details to begin.</p>
                        
                        <div className="space-y-4 mb-8 text-left">
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <button 
                                    type="button"
                                    onClick={() => setTestMode('practice')}
                                    className={\`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden \${testMode === 'practice' ? 'border-purple-500 bg-purple-50/80 shadow-md' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 bg-white/50'}\`}
                                >
                                    {testMode === 'practice' && <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>}
                                    <div className="flex justify-between items-start mb-1">
                                        <div className={\`font-bold text-[15px] \${testMode === 'practice' ? 'text-purple-700' : 'text-gray-700'}\`}>Study Mode</div>
                                        <div className={\`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 \${testMode === 'practice' ? 'border-purple-500' : 'border-gray-300'}\`}>
                                            {testMode === 'practice' && <div className="w-2 h-2 rounded-full bg-purple-500"></div>}
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-gray-500 leading-snug pr-2">
                                        Timer can be paused. Ideal for learning and reviewing.
                                    </div>
                                </button>

                                <button 
                                    type="button"
                                    onClick={() => setTestMode('mock')}
                                    className={\`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden \${testMode === 'mock' ? 'border-blue-500 bg-blue-50/80 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 bg-white/50'}\`}
                                >
                                    {testMode === 'mock' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                                    <div className="flex justify-between items-start mb-1">
                                        <div className={\`font-bold text-[15px] \${testMode === 'mock' ? 'text-blue-700' : 'text-gray-700'}\`}>Mock Test Mode</div>
                                        <div className={\`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 \${testMode === 'mock' ? 'border-blue-500' : 'border-gray-300'}\`}>
                                            {testMode === 'mock' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-gray-500 leading-snug pr-2">
                                        Strict timed conditions. Timer cannot be paused.
                                    </div>
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    value={candidateName} 
                                    onChange={e => setCandidateName(e.target.value.toUpperCase())} 
                                    className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-800 transition-all bg-white/80" 
                                    placeholder="e.g. JOHN DOE" 
                                />
                            </div>
                        </div>
                        <button 
                            onClick={startTest} 
                            disabled={!candidateName.trim() && candidateName !== ""}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold p-4 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                        >
                            Start Writing Test
                        </button>
                    </div>
                </div>
            )}`;

    if(code.includes(targetModal)) {
        code = code.replace(targetModal, modalReplace);
        fs.writeFileSync(file, code);
        console.log("Updated modal in " + file);
    } else {
        console.log("Modal target not found in " + file);
    }
}
