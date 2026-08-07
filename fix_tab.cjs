const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingPerformanceReport.tsx', 'utf8');

const target = `      audioRef.current.play().then(() => setPlayingId(qId)).catch(e => {
        console.warn("Playback failed", e);
        setPlayingId(null);
        if (!url?.startsWith('data:audio/')) {
          window.open(url, '_blank');
        } else {
          alert("Could not play the recording in this browser.");
        }
      });`;

const replacement = `      audioRef.current.play().then(() => setPlayingId(qId)).catch(e => {
        console.warn("Playback failed", e);
        setPlayingId(null);
        alert("Could not play the recording in this browser. The audio format may not be supported or it might be blocked.");
      });`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/SpeakingPerformanceReport.tsx', code);
    console.log("Replaced");
} else {
    console.log("Target not found");
}
