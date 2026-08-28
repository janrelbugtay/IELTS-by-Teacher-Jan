const fs = require('fs');
let file = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

// Replace setResponses and use a ref for latest values
file = file.replace(
  'const [responses, setResponses] = useState<Record<string, Blob>>({});',
  `const [responses, setResponses] = useState<Record<string, Blob>>({});\n  const responsesRef = useRef<Record<string, Blob>>({});`
);

// Update both state and ref when stopping recording
file = file.replace(
  'setResponses(prev => ({ ...prev, [qId]: blob }));',
  `setResponses(prev => { const next = { ...prev, [qId]: blob }; responsesRef.current = next; return next; });`
);

// Use responsesRef.current in onComplete
file = file.replace(
  'onComplete(responses);',
  'onComplete(responsesRef.current);'
);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', file);
console.log("Patched LiveSpeakingTestScreen responses");
