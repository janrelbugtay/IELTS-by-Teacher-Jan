const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

code = code.replace(
  `  const handleNext = async () => {
    stopPlayback();`,
  `  const handleNext = async () => {
    stopPlayback();
    setShowSampleAnswer(false);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }`
);

fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
