const fs = require('fs');

// Patch LiveSpeakingTestScreen
let code1 = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');
code1 = code1.replace(
  "const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });",
  "const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';\n            const blob = new Blob(audioChunksRef.current, { type: mimeType });"
);
fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code1);

// Patch ComputerSpeakingTest
let code2 = fs.readFileSync('src/pages/ComputerSpeakingTest.tsx', 'utf8');
code2 = code2.replace(
  "const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });",
  "const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';\n        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });"
);

// Also add error catching for playAudio in ComputerSpeakingTest
const oldPlayAudio = `      audioRef.current.play();
      setIsPlaying(true);`;
const newPlayAudio = `      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio play error:", err);
        setIsPlaying(false);
      });`;
code2 = code2.replace(oldPlayAudio, newPlayAudio);

fs.writeFileSync('src/pages/ComputerSpeakingTest.tsx', code2);

// Patch SpeakingRecordingsReview
let code3 = fs.readFileSync('src/components/SpeakingRecordingsReview.tsx', 'utf8');
const oldPlay = `        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);`;
const newPlay = `        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => {
          console.error("Playback failed", e);
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(!isPlaying);
      }`;
code3 = code3.replace(oldPlay, newPlay);

// Add error listener to new Audio
const oldAudio = `      const audio = new Audio(src);
      audioRef.current = audio;`;
const newAudio = `      const audio = new Audio(src);
      audioRef.current = audio;
      audio.onerror = (e) => console.error("Audio error", e);`;
code3 = code3.replace(oldAudio, newAudio);

fs.writeFileSync('src/components/SpeakingRecordingsReview.tsx', code3);

