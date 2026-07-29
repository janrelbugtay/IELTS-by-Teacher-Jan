const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingRecordingsReview.tsx', 'utf8');

const brokenCode = `      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => {
          console.error("Playback failed", e);
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(!isPlaying);
      }`;

const fixedCode = `      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => {
          console.error("Playback failed", e);
          setIsPlaying(false);
        });
      }`;

code = code.replace(brokenCode, fixedCode);
fs.writeFileSync('src/components/SpeakingRecordingsReview.tsx', code);
