const fs = require('fs');
let file = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

file = file.replace(
`                                onComplete(responsesRef.current).finally(() => setIsSubmitting(false));`,
`                                onComplete(responsesRef.current).then(() => navigate('/ielts/dashboard?tab=speaking')).finally(() => setIsSubmitting(false));`
);

// Fallback replacement
file = file.replace(
`                      onComplete(responsesRef.current).finally(() => setIsSubmitting(false));`,
`                      onComplete(responsesRef.current).then(() => navigate('/ielts/dashboard?tab=speaking')).finally(() => setIsSubmitting(false));`
);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', file);
console.log('Patched auto-navigate');
