const fs = require('fs');
let file = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

file = file.replace(
`} else {
            timer = setTimeout(() => {
              if (true) {
                setQState('waiting_to_record');
              } else {
                startRecording();
              }
            }, 3000);
        }`,
`} else {
            timer = setTimeout(() => {
              if (phase === 'completed') {
                  setQState('reviewing');
                  if (!hasSubmittedRef.current) {
                      hasSubmittedRef.current = true;
                      onComplete(responsesRef.current);
                  }
              } else if (phase === 'p2-prep') {
                  setQState('prep');
              } else {
                  setQState('waiting_to_record');
              }
            }, 3000);
        }`
);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', file);
console.log('Patched fallback');
