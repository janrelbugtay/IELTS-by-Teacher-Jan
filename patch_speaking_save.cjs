const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');

// Remove isSaving logic and alert
code = code.replace(/setIsSaving\(true\);/g, '');
code = code.replace(/setIsSaving\(false\);/g, '');
code = code.replace(/navigate\('\/ielts\/dashboard\?tab=speaking'\);/g, '');
code = code.replace(/alert\("Failed to save the test. Please try again."\);/g, 'console.error("Failed to save");');
code = code.replace(/alert\("Test aborted or failed to record. Returning to dashboard."\);/g, '');
code = code.replace(/navigate\('\/ielts\/dashboard'\);/g, '');

// Don't show the saving overlay
const savingOverlay = `{isSaving && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#4F7DFF] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-lg font-bold text-slate-700 animate-pulse">Saving your performance...</p>
                  </div>
                </div>
              )}`;
code = code.replace(savingOverlay, '');

fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code);
console.log("Patched ComputerSpeakingTest.tsx");

let code2 = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

// Add hasSubmitted ref to prevent multiple submissions
code2 = code2.replace(`const [responses, setResponses] = useState<Record<string, Blob>>({});`, `const [responses, setResponses] = useState<Record<string, Blob>>({});\n  const hasSubmittedRef = useRef(false);`);

// Modify the completed state to auto-submit
const onEndBlock = `                        } else if (phase === 'completed') {
                            setQState('reviewing'); // or just leave it
                        } else {`;
const newOnEndBlock = `                        } else if (phase === 'completed') {
                            setQState('reviewing'); // or just leave it
                            if (!hasSubmittedRef.current) {
                                hasSubmittedRef.current = true;
                                onComplete(responses);
                            }
                        } else {`;
code2 = code2.replace(onEndBlock, newOnEndBlock);

// Change "Click Submit to save your performance and recordings." to "Your test is being saved in the background. You can go back to the dashboard now."
code2 = code2.replace(`You have completed all parts of the speaking test. Click Submit to save your performance and recordings.`, `You have completed all parts of the speaking test. Your test is being saved in the background. You can go back to the dashboard now.`);

// Change Submit Test button to Go back to dashboard
const submitButton = `{phase === 'completed' && qState !== 'ai_speaking' && (
                  <button 
                    onClick={() => {
                      onComplete(responses); 
                    }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 h-12 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-md text-base tracking-wide animate-in fade-in zoom-in duration-300"
                  >
                    Submit Test
                  </button>
                )}`;
const newSubmitButton = `{phase === 'completed' && qState !== 'ai_speaking' && (
                  <button 
                    onClick={() => {
                      window.location.href = '/ielts/dashboard?tab=speaking';
                    }}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 h-12 rounded-full font-bold hover:bg-emerald-700 transition-all shadow-md text-base tracking-wide animate-in fade-in zoom-in duration-300"
                  >
                    Go back to dashboard
                  </button>
                )}`;
code2 = code2.replace(submitButton, newSubmitButton);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code2);
console.log("Patched LiveSpeakingTestScreen.tsx");
