const fs = require('fs');

const filePaths = ['src/pages/ComputerReadingTest.tsx'];

for (const filePath of filePaths) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Find the header block
  const headerStart = content.indexOf('<header className="bg-[#1a3673]');
  const headerEnd = content.indexOf('</header>') + '</header>'.length;

  if (headerStart === -1 || headerEnd === -1) {
    console.log('Header not found in', filePath);
    continue;
  }

  const newHeader = `      <div className="bg-gradient-to-b from-[#4a4a4a] to-[#1a1a1a] text-white flex justify-between items-center px-4 py-1.5 text-sm shadow-md z-20 shrink-0">
          <div className="text-xs text-gray-300 font-bold tracking-wide flex items-center gap-4">
            {reviewMode ? (
              <button 
                onClick={() => setReviewMode(false)}
                className="flex items-center gap-2 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer pointer-events-auto"
              >
                <ArrowLeft size={16} /> Back to Results
              </button>
            ) : (
              <>
                <Menu size={20} className="cursor-pointer hover:text-gray-100 transition-colors" />
                <span>CANDIDATE NAME - <span id="display-candidate-name">{studentName.toUpperCase()}</span></span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2 font-bold text-base tracking-wide absolute left-1/2 transform -translate-x-1/2">
            {!reviewMode ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className={timeLeft < 300 ? 'text-red-400' : ''}>{formatTime(timeLeft)}</span>
                {(testMode === 'study' || testMode === 'teaching') && (
                  <div className="flex items-center gap-1 border-l border-gray-500 pl-2 ml-1">
                      <button onClick={() => setIsPaused(!isPaused)} title={isPaused ? "Resume" : "Pause"} className="p-1 hover:bg-gray-700 rounded">
                          {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                      </button>
                      <button onClick={() => setTimeLeft(3600)} title="Restart Timer" className="p-1 hover:bg-gray-700 rounded">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                      </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-yellow-400 flex items-center gap-2">
                <Info size={16} />
                <span>Reviewing Explanations</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 relative z-30" ref={settingsRef}>
              <button 
                 onClick={(e) => { e.stopPropagation(); setShowSettings(prev => !prev); }}
                 className={\`p-1.5 rounded-full transition-all cursor-pointer pointer-events-auto \${showSettings ? 'bg-gray-200 text-gray-900 shadow-lg' : 'hover:bg-gray-700 text-gray-200'}\`}
                title="Settings"
              >
                <SettingsIcon size={18} />
              </button>
              {showSettings && (
                <div className="absolute top-full right-0 mt-3 bg-white text-black shadow-2xl rounded-xl border border-gray-200 py-3 px-0 w-64 flex flex-col font-sans animate-fade-in-down z-50">
                  <div className="px-5 py-2 border-b border-gray-100 mb-2 flex items-center gap-2">
                    <SettingsIcon size={16} className="text-gray-500" /> <span className="font-bold text-gray-800 text-[1.1em]">Options</span>
                  </div>
                  <div className="px-5 py-2">
                    <p className="text-[1.1em] font-bold text-gray-500 uppercase tracking-wider mb-3">Change Text Size</p>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="textSize" value="standard" checked={textSize === 'standard'} onChange={() => setTextSize('standard')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.1em] font-medium text-gray-800">Standard</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="textSize" value="large" checked={textSize === 'large'} onChange={() => setTextSize('large')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.1em] font-medium text-gray-800">Large</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="textSize" value="xlarge" checked={textSize === 'xlarge'} onChange={() => setTextSize('xlarge')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.1em] font-medium text-gray-800">Extra Large</span>
                    </label>
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100 mt-1 bg-gray-50 rounded-b-xl">
                    <p className="text-[1.1em] font-bold text-gray-500 uppercase tracking-wider mb-3">Change Screen Colors</p>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-100 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="colorTheme" value="standard" checked={colorTheme === 'standard'} onChange={() => setColorTheme('standard')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.1em] font-medium text-gray-800">Standard</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-100 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="colorTheme" value="white-on-black" checked={colorTheme === 'white-on-black'} onChange={() => setColorTheme('white-on-black')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.1em] font-medium text-gray-800">White on black</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-100 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="colorTheme" value="yellow-on-black" checked={colorTheme === 'yellow-on-black'} onChange={() => setColorTheme('yellow-on-black')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.1em] font-medium text-gray-800">Yellow on black</span>
                    </label>
                  </div>
                </div>
              )}
          </div>
      </div>`;

  content = content.substring(0, headerStart) + newHeader + content.substring(headerEnd);
  fs.writeFileSync(filePath, content);
  console.log('Updated', filePath);
}
