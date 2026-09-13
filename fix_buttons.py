with open('src/pages/Homework1WritingTest.tsx', 'r') as f:
    content = f.read()

content = content.replace('''                    <div className="flex items-center space-x-1">
                        <span className="text-sm font-bold text-gray-800 mr-2">Part 1</span>
                        <button onClick={() => setCurrentPart(1)} className={`tab-btn w-6 h-6 flex items-center justify-center rounded text-sm font-bold cursor-pointer transition-colors ${currentPart === 1 ? 'active' : 'bg-gray-800 text-white'}`}>1</button>
                        <span className="text-sm font-bold text-gray-800 mx-2 ml-4">Part 2</span>
                        <button onClick={() => setCurrentPart(2)} className={`tab-btn w-6 h-6 flex items-center justify-center rounded text-sm font-bold cursor-pointer transition-colors ${currentPart === 2 ? 'active' : 'bg-gray-800 text-white'}`}>2</button>
                    </div>''', '''                    <div className="flex items-center space-x-1">
                        {(!publishConfig || publishConfig.part1) && (
                            <>
                                <span className="text-sm font-bold text-gray-800 mr-2">Part 1</span>
                                <button onClick={() => setCurrentPart(1)} className={`tab-btn w-6 h-6 flex items-center justify-center rounded text-sm font-bold cursor-pointer transition-colors ${currentPart === 1 ? 'active' : 'bg-gray-800 text-white'}`}>1</button>
                            </>
                        )}
                        {(!publishConfig || publishConfig.part2) && (
                            <>
                                <span className="text-sm font-bold text-gray-800 mx-2 ml-4">Part 2</span>
                                <button onClick={() => setCurrentPart(2)} className={`tab-btn w-6 h-6 flex items-center justify-center rounded text-sm font-bold cursor-pointer transition-colors ${currentPart === 2 ? 'active' : 'bg-gray-800 text-white'}`}>2</button>
                            </>
                        )}
                    </div>''')

with open('src/pages/Homework1WritingTest.tsx', 'w') as f:
    f.write(content)
