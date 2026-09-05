import re

filepath = 'src/pages/ComputerWritingTest.tsx'
with open(filepath, 'r') as f:
    content = f.read()

bad_mode_selector = """                <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                        <button 
                            type="button"
                            onClick={() => setTestMode('practice')}
                            className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${testMode === 'practice' ? 'border-purple-500 bg-purple-50/80 shadow-md' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 bg-white/50'}`}
                        >
                            {testMode === 'practice' && <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>}
                            <div className="flex justify-between items-start mb-1">
                                <div className={`font-bold text-[15px] ${testMode === 'practice' ? 'text-purple-700' : 'text-gray-700'}`}>Study Mode</div>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${testMode === 'practice' ? 'border-purple-500' : 'border-gray-300'}`}>
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
                            className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${testMode === 'mock' ? 'border-blue-500 bg-blue-50/80 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 bg-white/50'}`}
                        >
                            {testMode === 'mock' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                            <div className="flex justify-between items-start mb-1">
                                <div className={`font-bold text-[15px] ${testMode === 'mock' ? 'text-blue-700' : 'text-gray-700'}`}>Mock Test Mode</div>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${testMode === 'mock' ? 'border-blue-500' : 'border-gray-300'}`}>
                                    {testMode === 'mock' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                </div>
                            </div>
                            <div className="text-[11px] text-gray-500 leading-snug pr-2">
                                Strict timed conditions. Timer cannot be paused.
                            </div>
                        </button>
                    </div>"""

good_mode_selector = """                <div className="space-y-4 mb-8">
                    {typeLabel !== 'Homework' && (
                        <div className="grid grid-cols-2 gap-4 mb-2">
                            <button 
                                type="button"
                                onClick={() => setTestMode('practice')}
                                className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${testMode === 'practice' ? 'border-purple-500 bg-purple-50/80 shadow-md' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50 bg-white/50'}`}
                            >
                                {testMode === 'practice' && <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>}
                                <div className="flex justify-between items-start mb-1">
                                    <div className={`font-bold text-[15px] ${testMode === 'practice' ? 'text-purple-700' : 'text-gray-700'}`}>Study Mode</div>
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${testMode === 'practice' ? 'border-purple-500' : 'border-gray-300'}`}>
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
                                className={`p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden ${testMode === 'mock' ? 'border-blue-500 bg-blue-50/80 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 bg-white/50'}`}
                            >
                                {testMode === 'mock' && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                                <div className="flex justify-between items-start mb-1">
                                    <div className={`font-bold text-[15px] ${testMode === 'mock' ? 'text-blue-700' : 'text-gray-700'}`}>Mock Test Mode</div>
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${testMode === 'mock' ? 'border-blue-500' : 'border-gray-300'}`}>
                                        {testMode === 'mock' && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                    </div>
                                </div>
                                <div className="text-[11px] text-gray-500 leading-snug pr-2">
                                    Strict timed conditions. Timer cannot be paused.
                                </div>
                            </button>
                        </div>
                    )}"""

content = content.replace(bad_mode_selector, good_mode_selector)

bad_subtitle = """<p className="text-gray-500 text-center mb-8 text-sm font-medium">Please select your mode and enter your details to begin.</p>"""
good_subtitle = """<p className="text-gray-500 text-center mb-8 text-sm font-medium">{typeLabel === 'Homework' ? "Please enter your details to begin." : "Please select your mode and enter your details to begin."}</p>"""

content = content.replace(bad_subtitle, good_subtitle)

with open(filepath, 'w') as f:
    f.write(content)
print("Updated mode selector visibility")
