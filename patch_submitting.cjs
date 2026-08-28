const fs = require('fs');
let file = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

file = file.replace(
  'onComplete: (responses: Record<string, Blob>) => void',
  'onComplete: (responses: Record<string, Blob>) => Promise<void>'
);

if (!file.includes('const [isSubmitting, setIsSubmitting]')) {
  file = file.replace(
    'const [isPlaying, setIsPlaying] = useState(false);',
    'const [isPlaying, setIsPlaying] = useState(false);\n  const [isSubmitting, setIsSubmitting] = useState(false);'
  );
}

// In startRec
file = file.replace(
`                                hasSubmittedRef.current = true;
                                onComplete(responsesRef.current);`,
`                                hasSubmittedRef.current = true;
                                setIsSubmitting(true);
                                onComplete(responsesRef.current).finally(() => setIsSubmitting(false));`
);

// In fallback timeout
file = file.replace(
`                      hasSubmittedRef.current = true;
                      onComplete(responsesRef.current);`,
`                      hasSubmittedRef.current = true;
                      setIsSubmitting(true);
                      onComplete(responsesRef.current).finally(() => setIsSubmitting(false));`
);

// In "Go back to dashboard" button
file = file.replace(
`{phase === 'completed' && qState !== 'ai_speaking' && (
                  <button `,
`{phase === 'completed' && qState !== 'ai_speaking' && (
                  <button 
                    disabled={isSubmitting}`
);

file = file.replace(
`Go back to dashboard
                  </button>`,
`{isSubmitting ? 'Saving Results...' : 'Go back to dashboard'}
                  </button>`
);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', file);
console.log('Patched isSubmitting');
