import re

filepath = 'src/pages/ComputerWritingTest.tsx'
with open(filepath, 'r') as f:
    content = f.read()

bad_footer = """            <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-between items-center text-xs text-gray-600 font-medium">
                <div className="flex gap-6">
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        {chars} Characters
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                        {paras} Paragraphs
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {typingTimeMin} min
                    </span>
                    <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                        Ln {cursorPos.line}, Col {cursorPos.col}
                    </span>
                </div>"""

good_footer = """            <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-between items-center text-xs text-gray-600 font-medium">
                <div className="flex gap-6">
                </div>"""

content = content.replace(bad_footer, good_footer)

bad_pause = """                {testMode === 'practice' && !isSubmitted && (
                    <button 
                        onClick={onTogglePause} 
                        className="ml-3 px-2 py-0.5 text-xs font-semibold bg-white/20 hover:bg-white/30 border border-white/30 rounded text-white transition-colors"
                    >
                        {isTimePaused ? 'Resume' : 'Pause'}
                    </button>
                )}"""

good_pause = """                {testMode === 'practice' && typeLabel !== 'Homework' && !isSubmitted && (
                    <button 
                        onClick={onTogglePause} 
                        className="ml-3 px-2 py-0.5 text-xs font-semibold bg-white/20 hover:bg-white/30 border border-white/30 rounded text-white transition-colors"
                    >
                        {isTimePaused ? 'Resume' : 'Pause'}
                    </button>
                )}"""

content = content.replace(bad_pause, good_pause)

with open(filepath, 'w') as f:
    f.write(content)

print("Updated footer and pause button")
