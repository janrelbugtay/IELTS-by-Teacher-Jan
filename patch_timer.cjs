const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

const oldLogic = `      } else if (qState === 'recording') {
        timer = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      }
    } else if (phase === 'p2-prep' && qState === 'prep') {
      timer = setInterval(() => {
        setPrepTime(prev => {
          if (prev <= 1) {
            setPhase('p2');
            setQState('ai_speaking');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }`;

const newLogic = `      } else if (qState === 'recording') {
        timer = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else if (phase === 'p2-prep' && qState === 'prep') {
        timer = setInterval(() => {
          setPrepTime(prev => {
            if (prev <= 1) {
              setPhase('p2');
              setQState('ai_speaking');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }`;

code = code.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
console.log("Patched timer logic");
