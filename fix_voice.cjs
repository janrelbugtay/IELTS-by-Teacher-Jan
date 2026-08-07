const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

const target = `          const setVoiceAndSpeak = () => {
              const voices = window.speechSynthesis.getVoices();
              const preferredVoice = voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en-US'));
              if (preferredVoice) utterance.voice = preferredVoice;
              window.speechSynthesis.speak(utterance);
          };`;

const replacement = `          const setVoiceAndSpeak = () => {
              const voices = window.speechSynthesis.getVoices();
              const ukVoice = voices.find(v => (v.lang === 'en-GB' || v.lang === 'en-UK') && v.name.includes('Google')) || 
                              voices.find(v => v.lang === 'en-GB' || v.lang === 'en-UK');
              if (ukVoice) {
                  utterance.voice = ukVoice;
              } else {
                  const preferredVoice = voices.find(v => v.lang.startsWith('en-GB') || v.lang.startsWith('en-US'));
                  if (preferredVoice) utterance.voice = preferredVoice;
              }
              window.speechSynthesis.speak(utterance);
          };`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
  console.log("Replaced successfully");
} else {
  console.log("Target not found!");
}
