const fs = require('fs');
let content = fs.readFileSync('src/pages/SeptemberListeningTest.tsx', 'utf8');

const settingsMenu = `
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
`;

content = content.replace(
  '<div className="text-xs text-gray-300 font-bold tracking-wide">CANDIDATE NAME - <span id="display-candidate-name">{studentName.toUpperCase()}</span></div>',
  '<div className="text-xs text-gray-300 font-bold tracking-wide flex items-center gap-4">' + settingsMenu + '\nCANDIDATE NAME - <span id="display-candidate-name">{studentName.toUpperCase()}</span></div>'
);

content = content.replace(
  '<div className="h-screen flex flex-col overflow-hidden text-[#333] bg-[#e1e5eb]">',
  '<div className={`h-screen flex flex-col overflow-hidden ${theme.text} ${theme.bg}`}>'
);

content = content.replace(
  '<div className="bg-white px-6 py-3 shrink-0 flex justify-between items-center shadow-sm z-10">',
  '<div className={`${theme.headerBg} px-6 py-3 shrink-0 flex justify-between items-center shadow-sm z-10 border-b ${theme.border}`}>'
);

content = content.replace(
  '<div className="flex-1 overflow-y-auto bg-[#e6eaf2] p-6 flex justify-center items-start shadow-inner relative">',
  '<div className={`flex-1 overflow-y-auto ${theme.bg} p-6 flex justify-center items-start shadow-inner relative ${textSizeClass}`} ref={mainContainerRef} onMouseUp={handleTextSelect}>'
);

content = content.replace(
  '<div className="w-full max-w-[1000px] min-h-full">',
  `
          <div className="w-full max-w-[1000px] min-h-full">
          {popover && !isSubmitted && (
            <div 
              ref={popoverRef}
              className="absolute z-50 bg-white rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-200 px-1 py-1 transform -translate-x-1/2 -translate-y-full animate-fade-in"
              style={{ top: popover.y - 12, left: popover.x }}
            >
              <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3.5 h-3.5 bg-white border-b border-r border-gray-200 rotate-45"></div>
              
              <div className="relative z-10 flex flex-col font-sans">
                {popover.type === 'new' && (
                  <div className="flex items-center h-9">
                    <button 
                      onClick={() => addHighlight('')}
                      className="flex items-center justify-center gap-2 px-3 h-full hover:bg-gray-50 rounded text-[15px] font-semibold text-gray-700 transition-colors whitespace-nowrap"
                    >
                      <Highlighter size={16} strokeWidth={2.5} className="text-yellow-500" />
                      Highlight
                    </button>
                    <div className="w-px h-5 bg-gray-200 mx-1"></div>
                    <button 
                      onClick={() => { setPopover({...popover, type: 'note-input'}); setNoteInput(''); }}
                      className="flex items-center justify-center gap-2 px-3 h-full hover:bg-gray-50 rounded text-[15px] font-semibold text-gray-700 transition-colors whitespace-nowrap"
                    >
                      <Edit3 size={16} strokeWidth={2.5} className="text-blue-500" />
                      Add Note
                    </button>
                    <div className="w-px h-5 bg-gray-200 mx-1"></div>
                    <button 
                      onClick={handleCopyText}
                      className={\`flex items-center justify-center gap-2 px-3 h-full hover:bg-gray-50 rounded text-[15px] font-semibold transition-colors whitespace-nowrap \${isCopied ? 'text-green-600' : 'text-gray-700'}\`}
                    >
                      {isCopied ? <CheckCircle2 size={16} strokeWidth={2.5} className="text-green-600" /> : <Copy size={16} strokeWidth={2.5} className="text-gray-500" />}
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
                {popover.type === 'note-input' && (
                  <div className="w-64 p-2">
                    <textarea
                      autoFocus
                      className="w-full border border-gray-300 rounded p-3 text-[15px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none shadow-inner bg-white text-black"
                      rows={3}
                      placeholder="Type your note here..."
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button 
                        className="px-4 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-[15px] font-bold transition-colors"
                        onClick={() => setPopover(null)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[15px] font-bold shadow-sm transition-colors"
                        onClick={() => addHighlight(noteInput)}
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
`
);

content = content.replace(
  /<div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-gray-200">/g,
  '<div className={`${theme.container} p-6 md:p-10 rounded-2xl shadow-sm border`}>'
);

content = content.replace(
  /className="ielts-input/g,
  'className={`ielts-input ${theme.inputBg}'
);
content = content.replace(
  /className={`ielts-input \${answers\[/g,
  'className={`ielts-input ${theme.inputBg} ${answers['
);

fs.writeFileSync('src/pages/SeptemberListeningTest.tsx', content);
