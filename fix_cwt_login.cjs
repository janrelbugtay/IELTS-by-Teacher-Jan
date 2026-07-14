const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerWritingTest.tsx', 'utf8');

const targetLoginScreen = `const LoginScreen = ({ onStart, initialName }: { onStart: (name: string, number: string) => void, initialName: string }) => {
    const [name, setName] = useState(initialName || "");
    const [number, setNumber] = useState("");

    return (
        <div className="flex flex-col h-screen items-center justify-center bg-[#d2d6de] relative">
            <div className="absolute w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -top-10 -left-10"></div>
            <div className="absolute w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 bottom-10 right-10"></div>
            
            <div className="bg-white p-10 rounded-xl shadow-2xl border border-gray-200 w-[450px] max-w-[90%] z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">IELTS Writing Test</h1>
                <p className="text-gray-500 text-center mb-8 text-sm">Please verify your details to begin.</p>
                
                <div className="space-y-5 mb-8">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition-all"
                            placeholder="e.g. John Smith"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Candidate Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input 
                            type="text" 
                            className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 transition-all"
                            placeholder="e.g. 123456"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && name.trim() && onStart(name, number)}
                        />
                    </div>
                </div>
                
                <button 
                    className="w-full bg-blue-600 text-white font-bold p-3.5 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 disabled:hover:bg-blue-600"
                    onClick={() => onStart(name, number)}
                    disabled={!name.trim()}
                >
                    Start Test
                </button>
            </div>
        </div>
    );
};`;

const replacementLoginScreen = `const LoginScreen = ({ onStart, initialName }: { onStart: (name: string, number: string, testMode: 'practice' | 'mock') => void, initialName: string }) => {
    const [name, setName] = useState(initialName || "");
    const [number, setNumber] = useState("");
    const [testMode, setTestMode] = useState<'practice' | 'mock'>('practice');

    return (
        <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-br from-[#e0e7ff] via-[#d2d6de] to-[#fbcfe8] relative overflow-hidden">
            <div className="absolute w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -top-10 -left-10 animate-blob"></div>
            <div className="absolute w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 top-40 right-20 animate-blob animation-delay-2000"></div>
            <div className="absolute w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 bottom-10 left-20 animate-blob animation-delay-4000"></div>
            
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 w-[500px] max-w-[90%] z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
                    </div>
                </div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 mb-2 text-center">IELTS Writing Test</h1>
                <p className="text-gray-500 text-center mb-8 text-sm font-medium">Please select your mode and enter your details to begin.</p>
                
                <div className="space-y-4 mb-8">
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
                            className="w-full border-2 border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-800 transition-all bg-white/80"
                            placeholder="e.g. John Smith"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>
                
                <button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold p-4 rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                    onClick={() => onStart(name, number, testMode)}
                    disabled={!name.trim()}
                >
                    Start Writing Test
                </button>
            </div>
        </div>
    );
};`;

if(code.includes(targetLoginScreen)) {
    code = code.replace(targetLoginScreen, replacementLoginScreen);
    fs.writeFileSync('src/pages/ComputerWritingTest.tsx', code);
    console.log("Login screen fixed.");
} else {
    console.log("Login screen not found!");
}
