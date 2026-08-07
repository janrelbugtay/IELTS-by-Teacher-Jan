const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

code = code.replace(
  "const [qState, setQState] = useState<'ai_speaking' | 'recording' | 'reviewing' | 'prep'>('ai_speaking');",
  "const [qState, setQState] = useState<'ai_speaking' | 'recording' | 'reviewing' | 'prep' | 'waiting_to_record'>('ai_speaking');"
);

code = code.replace(
  `                        } else if (phase === 'completed') {
                            setQState('reviewing'); // or just leave it
                            if (!hasSubmittedRef.current) {
                                hasSubmittedRef.current = true;
                                onComplete(responses);
                            }
                        } else {
                            startRecording();
                        }`,
  `                        } else if (phase === 'completed') {
                            setQState('reviewing'); // or just leave it
                            if (!hasSubmittedRef.current) {
                                hasSubmittedRef.current = true;
                                onComplete(responses);
                            }
                        } else {
                            if (testNum === '3') {
                                setQState('waiting_to_record');
                            } else {
                                startRecording();
                            }
                        }`
);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
