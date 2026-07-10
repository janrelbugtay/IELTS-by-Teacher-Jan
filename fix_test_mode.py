import re

with open("src/pages/ComputerReadingTest.tsx", "r") as f:
    content = f.read()

# Add the Teaching Mode button
old_buttons = """              <button
                disabled={!studentName.trim()}
                onClick={() => handleStartTest('mock')}
                className="group flex flex-col items-center justify-center gap-3 p-6 border-2 border-red-500 rounded-2xl bg-red-50 text-red-800 hover:bg-red-600 hover:text-white disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all text-left relative overflow-hidden"
              >
                <div className="font-extrabold text-xl flex items-center gap-2">
                   Start Mock Test
                </div>
                <ul className="text-[0.85em] space-y-1 font-medium opacity-80 text-center">
                   <li>• Official exam simulation</li>
                   <li>• Absolute 60-min timer</li>
                   <li>• Strict Auto-submit</li>
                </ul>
              </button>
            </div>"""

new_buttons = """              <button
                disabled={!studentName.trim()}
                onClick={() => handleStartTest('mock')}
                className="group flex flex-col items-center justify-center gap-3 p-6 border-2 border-red-500 rounded-2xl bg-red-50 text-red-800 hover:bg-red-600 hover:text-white disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all text-left relative overflow-hidden"
              >
                <div className="font-extrabold text-xl flex items-center gap-2">
                   Start Mock Test
                </div>
                <ul className="text-[0.85em] space-y-1 font-medium opacity-80 text-center">
                   <li>• Official exam simulation</li>
                   <li>• Absolute 60-min timer</li>
                   <li>• Strict Auto-submit</li>
                </ul>
              </button>

              <button
                disabled={!studentName.trim()}
                onClick={() => handleStartTest('teaching')}
                className="group flex flex-col items-center justify-center gap-3 p-6 border-2 border-purple-500 rounded-2xl bg-purple-50 text-purple-800 hover:bg-purple-600 hover:text-white disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all text-left relative overflow-hidden md:col-span-2"
              >
                <div className="font-extrabold text-xl flex items-center gap-2">
                   Start Teaching Mode
                </div>
                <ul className="text-[0.85em] space-y-1 font-medium opacity-80 text-center">
                   <li>• Detailed explanations</li>
                   <li>• Understand why other answers are wrong</li>
                   <li>• Learn at your own pace</li>
                </ul>
              </button>
            </div>"""
content = content.replace(old_buttons, new_buttons)

old_start = """  const handleStartTest = (selectedMode: string) => {
    if (!studentName.trim()) return;
    
    if (selectedMode === 'mock') {
      setModalConfig({
        title: "Start Mock Test?",
        message: "This mode follows official IELTS exam conditions.\\n\\n• The timer starts immediately.\\n• The timer cannot be paused.\\n• The test will automatically submit when time expires.",
        confirmText: "Start Test",
        cancelText: "Cancel",
        onConfirm: () => {
          setTestMode('mock');
          setEndTime(Date.now() + 3600 * 1000); // 60 minutes absolute
          setHasStarted(true);
          setModalConfig(null);
        }
      });
    } else {
      setTestMode('study');
      setTimeLeft(3600);
      setHasStarted(true);
    }
  };"""

new_start = """  const handleStartTest = (selectedMode: string) => {
    if (!studentName.trim()) return;
    
    if (selectedMode === 'mock') {
      setModalConfig({
        title: "Start Mock Test?",
        message: "This mode follows official IELTS exam conditions.\\n\\n• The timer starts immediately.\\n• The timer cannot be paused.\\n• The test will automatically submit when time expires.",
        confirmText: "Start Test",
        cancelText: "Cancel",
        onConfirm: () => {
          setTestMode('mock');
          setEndTime(Date.now() + 3600 * 1000); // 60 minutes absolute
          setHasStarted(true);
          setModalConfig(null);
        }
      });
    } else if (selectedMode === 'teaching') {
      setTestMode('teaching');
      setTimeLeft(3600);
      setHasStarted(true);
    } else {
      setTestMode('study');
      setTimeLeft(3600);
      setHasStarted(true);
    }
  };"""

content = content.replace(old_start, new_start)


# Update renderExplanationBox to show detailedExplanation if in teaching mode
old_exp = """        <div className={`whitespace-pre-wrap text-[0.95em] leading-relaxed p-5 rounded-xl border shadow-sm ${colorTheme !== 'standard' ? 'bg-[#332800] text-yellow-100 border-yellow-700' : 'bg-yellow-50 text-gray-800 border-yellow-200'}`}>
           {explanation}
        </div>
      </div>
    );"""

new_exp = """        <div className={`whitespace-pre-wrap text-[0.95em] leading-relaxed p-5 rounded-xl border shadow-sm ${colorTheme !== 'standard' ? 'bg-[#332800] text-yellow-100 border-yellow-700' : 'bg-yellow-50 text-gray-800 border-yellow-200'}`}>
           {explanation}
        </div>
        {testMode === 'teaching' && currentExplanations[qId]?.detailedExplanation && (
          <div className={`mt-3 whitespace-pre-wrap text-[0.95em] leading-relaxed p-5 rounded-xl border shadow-sm ${colorTheme !== 'standard' ? 'bg-[#3a1a3a] text-purple-100 border-purple-700' : 'bg-purple-50 text-gray-800 border-purple-200'}`}>
             <h4 className="font-bold mb-2 flex items-center gap-2"><Info size={16}/> Why other options are incorrect</h4>
             {currentExplanations[qId].detailedExplanation}
          </div>
        )}
      </div>
    );"""
content = content.replace(old_exp, new_exp)

# timer config: testMode === 'study' or 'teaching' should allow pause
content = content.replace("else if (testMode === 'study' && !isPaused) {", "else if ((testMode === 'study' || testMode === 'teaching') && !isPaused) {")
content = content.replace("{testMode === 'study' && (", "{(testMode === 'study' || testMode === 'teaching') && (")


with open("src/pages/ComputerReadingTest.tsx", "w") as f:
    f.write(content)
