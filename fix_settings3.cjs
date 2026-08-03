const fs = require('fs');
let content = fs.readFileSync('src/pages/SeptemberListeningTest.tsx', 'utf8');

// I will find the whole header.
const headerStart = '<div className="bg-gradient-to-b from-[#4a4a4a] to-[#1a1a1a] text-white flex justify-between items-center px-4 py-1.5 text-sm shadow-md z-20 shrink-0">';
const headerEnd = '</div>\n      </div>\n\n      <div className="bg-white px-8 py-3 shadow-sm border-b border-gray-300 z-10 shrink-0 flex justify-between items-center">';

let idxStart = content.indexOf(headerStart);
if (idxStart !== -1) {
  let sub = content.substring(idxStart);
  let nextPartIdx = sub.indexOf('<div className="bg-white px-8 py-3 shadow-sm border-b border-gray-300 z-10 shrink-0 flex justify-between items-center">');
  if (nextPartIdx !== -1) {
    let headerStr = sub.substring(0, nextPartIdx);
    
    // Now replace the header with the one that has settings on the right.
    // The components to place:
    // Left: CANDIDATE NAME - <span id="display-candidate-name">{studentName.toUpperCase()}</span>
    // Center: Timer
    // Right: Settings block, then Volume control
    
    const newHeader = `
      <div className="bg-gradient-to-b from-[#4a4a4a] to-[#1a1a1a] text-white flex justify-between items-center px-4 py-1.5 text-sm shadow-md z-20 shrink-0">
          <div className="text-xs text-gray-300 font-bold tracking-wide flex items-center gap-4">
            CANDIDATE NAME - <span id="display-candidate-name">{studentName.toUpperCase()}</span>
          </div>
          
          <div className="flex items-center gap-2 font-bold text-base tracking-wide absolute left-1/2 transform -translate-x-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>{formatTime(timeLeft)}</span>
              {testMode === 'practice' && (
                <button 
                  onClick={() => setIsTimePaused(!isTimePaused)} 
                  className="ml-2 px-2 py-0.5 text-xs font-normal bg-white text-black border border-gray-400 rounded hover:bg-gray-100"
                >
                  {isTimePaused ? 'Resume' : 'Pause'}
                </button>
              )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-4 relative z-30" ref={settingsRef}>
              <button 
                 onClick={(e) => { e.stopPropagation(); setShowSettings(prev => !prev); }}
                 className={\`p-2 rounded-full transition-all cursor-pointer pointer-events-auto \${showSettings ? 'bg-blue-100 text-blue-900 shadow-lg' : 'hover:bg-blue-800 text-blue-100'}\`}
                title="Settings"
              >
                <SettingsIcon size={20} />
              </button>
              {showSettings && (
                <div className="absolute top-full right-0 mt-3 bg-white text-black shadow-2xl rounded-xl border border-gray-200 py-3 px-0 w-56 flex flex-col font-sans animate-fade-in-down z-50">
                  <div className="px-5 py-2 border-b border-gray-100 mb-2 flex items-center gap-2">
                    <SettingsIcon size={16} className="text-gray-500" /> <span className="font-bold text-gray-800 text-[1.25em]">Options</span>
                  </div>
                  <div className="px-5 py-2">
                    <p className="text-[1.25em] font-bold text-gray-500 uppercase tracking-wider mb-3">Change Text Size</p>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="textSize" value="standard" checked={textSize === 'standard'} onChange={() => setTextSize('standard')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.25em] font-medium text-gray-800">Standard</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="textSize" value="large" checked={textSize === 'large'} onChange={() => setTextSize('large')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.25em] font-medium text-gray-800">Large</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-50 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="textSize" value="extralarge" checked={textSize === 'extralarge'} onChange={() => setTextSize('extralarge')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.25em] font-medium text-gray-800">Extra Large</span>
                    </label>
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100 mt-1 bg-gray-50 rounded-b-xl">
                    <p className="text-[1.25em] font-bold text-gray-500 uppercase tracking-wider mb-3">Change Screen Colors</p>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-100 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="colorTheme" value="standard" checked={colorTheme === 'standard'} onChange={() => setColorTheme('standard')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.25em] font-medium text-gray-800">Standard</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-100 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="colorTheme" value="white-on-black" checked={colorTheme === 'white-on-black'} onChange={() => setColorTheme('white-on-black')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.25em] font-medium text-gray-800">White on black</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer py-1.5 hover:bg-gray-100 px-2 -mx-2 rounded transition-colors">
                      <input type="radio" name="colorTheme" value="yellow-on-black" checked={colorTheme === 'yellow-on-black'} onChange={() => setColorTheme('yellow-on-black')} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-[1.25em] font-medium text-gray-800">Yellow on black</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-2 bg-gradient-to-b from-gray-100 to-gray-300 px-2 py-0.5 rounded border border-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
                <input type="range" className="w-16 h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer" value={volume} onChange={handleVolumeChange} />
            </div>
          </div>
      </div>
`;
    
    content = content.replace(headerStr, newHeader.trim() + '\n      ');
    fs.writeFileSync('src/pages/SeptemberListeningTest.tsx', content);
    console.log('replaced successfully');
  } else {
    console.log('could not find next part');
  }
} else {
  console.log('could not find header start');
}
