const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerWritingTest.tsx', 'utf8');

const targetHeaderComponent = `const Header = ({ studentName, candidateNumber, timeLeft, saveStatus, onOpenSettings, onOpenSubmit, isSubmitted }: any) => {`;
const replacementHeaderComponent = `const Header = ({ studentName, candidateNumber, timeLeft, saveStatus, onOpenSettings, onOpenSubmit, isSubmitted, testMode, isTimePaused, onTogglePause }: any) => {`;

const targetHeaderUsage = `            <Header 
                studentName={state.studentName}
                candidateNumber={state.candidateNumber}
                timeLeft={timeLeft}
                saveStatus={saveStatus}
                onOpenSettings={() => setShowSettings(true)}
                onOpenSubmit={() => setShowSubmitModal(true)}
                isSubmitted={state.isSubmitted}
            />`;

const replacementHeaderUsage = `            <Header 
                studentName={state.studentName}
                candidateNumber={state.candidateNumber}
                timeLeft={timeLeft}
                saveStatus={saveStatus}
                onOpenSettings={() => setShowSettings(true)}
                onOpenSubmit={() => setShowSubmitModal(true)}
                isSubmitted={state.isSubmitted}
                testMode={state.testMode}
                isTimePaused={isTimePaused}
                onTogglePause={() => setIsTimePaused(!isTimePaused)}
            />`;

const targetHeaderTimer = `            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center bg-black/20 px-4 py-1.5 rounded-full border border-white/10">
                <svg className={\`w-4 h-4 mr-2 \${timeLeft <= 300 ? 'text-red-400 animate-pulse' : 'text-gray-300'}\`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className={\`font-bold tracking-wide \${timeLeft <= 300 ? 'text-red-400' : 'text-white'}\`}>
                    {isSubmitted ? "Test Completed" : formatTime(timeLeft)}
                </span>
            </div>`;

const replacementHeaderTimer = `            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center bg-black/20 px-4 py-1.5 rounded-full border border-white/10">
                <svg className={\`w-4 h-4 mr-2 \${timeLeft <= 300 ? 'text-red-400 animate-pulse' : 'text-gray-300'}\`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span className={\`font-bold tracking-wide \${timeLeft <= 300 ? 'text-red-400' : 'text-white'}\`}>
                    {isSubmitted ? "Test Completed" : formatTime(timeLeft)}
                </span>
                {testMode === 'practice' && !isSubmitted && (
                    <button 
                        onClick={onTogglePause} 
                        className="ml-3 px-2 py-0.5 text-xs font-semibold bg-white/20 hover:bg-white/30 border border-white/30 rounded text-white transition-colors"
                    >
                        {isTimePaused ? 'Resume' : 'Pause'}
                    </button>
                )}
            </div>`;

if(code.includes(targetHeaderComponent) && code.includes(targetHeaderUsage) && code.includes(targetHeaderTimer)) {
    code = code.replace(targetHeaderComponent, replacementHeaderComponent);
    code = code.replace(targetHeaderUsage, replacementHeaderUsage);
    code = code.replace(targetHeaderTimer, replacementHeaderTimer);
    fs.writeFileSync('src/pages/ComputerWritingTest.tsx', code);
    console.log("Header updated.");
} else {
    console.log("Header targets not found.");
}
