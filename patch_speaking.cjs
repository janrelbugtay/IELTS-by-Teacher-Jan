const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

// Change qState type
code = code.replace(
  "useState<'ai_speaking' | 'recording' | 'reviewing'>('ai_speaking')",
  "useState<'ai_speaking' | 'recording' | 'reviewing' | 'prep'>('ai_speaking')"
);

// Update useEffect logic
code = code.replace(
  "if (phase !== 'intro' && phase !== 'p2-prep') {",
  "if (phase !== 'intro' && phase !== 'completed') {"
);

// We need to inject the p2-prep read logic
// Find the block:
/*
        if (phase === 'p1') {
            textToRead = MOCK_QUESTIONS.part1[qIndex].text;
            if (qIndex === 0) {
                textToRead = `Part 1. Let's talk about ${MOCK_QUESTIONS.part1[qIndex].topic}. ${textToRead}`;
            }
        } else if (phase === 'p2') {
*/

const oldP2 = `        } else if (phase === 'p2') {
            textToRead = \`Now, I'd like you to talk about a topic for one to two minutes. \${MOCK_QUESTIONS.part2.topic}. Please start speaking now.\`;
        } else if (phase === 'p3') {
            textToRead = MOCK_QUESTIONS.part3[qIndex].text;
            if (qIndex === 0) {
                textToRead = \`Part 3. Let's discuss \${MOCK_QUESTIONS.part3[qIndex].topic}. \${textToRead}\`;
            }
            if (qIndex === MOCK_QUESTIONS.part3.length - 1) {
                textToRead += " That's all for the speaking test today.";
            }
        }`;

const newP2 = `        } else if (phase === 'p2-prep') {
            textToRead = "Now I'm going to give you a topic. I'd like you to talk about it for one to two minutes. Before you begin speaking, you'll have one minute to prepare. During that time, you may make notes if you wish. You can see the topic on your screen now.";
        } else if (phase === 'p2') {
            textToRead = \`Now, I'd like you to talk about a topic for one to two minutes. \${MOCK_QUESTIONS.part2.topic}. Please start speaking now.\`;
        } else if (phase === 'p3') {
            textToRead = MOCK_QUESTIONS.part3[qIndex].text;
            if (qIndex === 0) {
                textToRead = \`Part 3. Let's discuss \${MOCK_QUESTIONS.part3[qIndex].topic}. \${textToRead}\`;
            }
        } else if (phase === 'completed' && qState === 'ai_speaking') {
            textToRead = "Thank you. That is the end of the Speaking test. You may now leave the test room. Have a nice day.";
        }`;

code = code.replace(oldP2, newP2);

// Update what happens when `startRec()` is called inside `qState === 'ai_speaking'`
// In `p2-prep`, we don't start recording, we transition to `qState = 'prep'`
/*
                const startRec = () => {
                    if (!recordingStarted && qState === 'ai_speaking') {
                        recordingStarted = true;
                        startRecording();
                    }
                };
*/
const oldStartRec = `                const startRec = () => {
                    if (!recordingStarted && qState === 'ai_speaking') {
                        recordingStarted = true;
                        startRecording();
                    }
                };`;

const newStartRec = `                const startRec = () => {
                    if (!recordingStarted && qState === 'ai_speaking') {
                        recordingStarted = true;
                        if (phase === 'p2-prep') {
                            setQState('prep');
                        } else if (phase === 'completed') {
                            setQState('reviewing'); // or just leave it
                        } else {
                            startRecording();
                        }
                    }
                };`;

code = code.replace(oldStartRec, newStartRec);

// Fix the timer block:
/*
    } else if (phase === 'p2-prep') {
      timer = setInterval(() => {
        setPrepTime(prev => {
*/
const oldTimer = `    } else if (phase === 'p2-prep') {
      timer = setInterval(() => {
        setPrepTime(prev => {`;

const newTimer = `    } else if (phase === 'p2-prep' && qState === 'prep') {
      timer = setInterval(() => {
        setPrepTime(prev => {`;

code = code.replace(oldTimer, newTimer);

// In handleNext, make sure p2-prep is set correctly:
/*
      } else {
        setPhase('p2-prep');
        setQIndex(0);
      }
*/
const oldNext = `      } else {
        setPhase('p2-prep');
        setQIndex(0);
      }`;
const newNext = `      } else {
        setPhase('p2-prep');
        setQState('ai_speaking');
        setQIndex(0);
      }`;
code = code.replace(oldNext, newNext);

// And for phase === 'completed':
/*
      } else {
        setPhase('completed');
      }
*/
const oldComp = `      } else {
        setPhase('completed');
      }`;
const newComp = `      } else {
        setPhase('completed');
        setQState('ai_speaking');
      }`;
code = code.replace(oldComp, newComp);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
console.log("Done patching");
