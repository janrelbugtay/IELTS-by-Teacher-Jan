const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

const badLogic = `      } else if (phase === 'p2-prep' && qState === 'prep') {
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

const goodLogic = `      } else if (phase === 'p2-prep' && qState === 'prep') {
        timer = setInterval(() => {
          setPrepTime(prev => prev - 1);
        }, 1000);
      }`;

code = code.replace(badLogic, goodLogic);

// Add the useEffect for prepTime
const newEffect = `
  useEffect(() => {
    if (phase === 'p2-prep' && qState === 'prep' && prepTime <= 0) {
      setPhase('p2');
      setQState('ai_speaking');
    }
  }, [prepTime, phase, qState]);
`;

code = code.replace(`const audioChunksRef = useRef<Blob[]>([]);`, `const audioChunksRef = useRef<Blob[]>([]);${newEffect}`);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
console.log("Patched LiveSpeakingTestScreen.tsx timer");
