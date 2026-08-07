const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

code = code.replace(
  `        } else {
            timer = setTimeout(() => {
              startRecording();
            }, 3000);
        }`,
  `        } else {
            timer = setTimeout(() => {
              if (testNum === '3') {
                setQState('waiting_to_record');
              } else {
                startRecording();
              }
            }, 3000);
        }`
);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
