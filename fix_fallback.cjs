const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingPerformanceReport.tsx', 'utf8');

const target = `  const getAudioUrl = (qId: string) => {
    if (Object.keys(responseUrls).length > 0) {
      return responseUrls[qId] || null;
    }
    return audioUrl;
  };`;

const replacement = `  const getAudioUrl = (qId: string) => {
    if (Object.keys(responseUrls).length > 0 && responseUrls[qId]) {
      return responseUrls[qId];
    }
    return audioUrl || null;
  };`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/SpeakingPerformanceReport.tsx', code);
    console.log("Fixed getAudioUrl fallback");
} else {
    console.log("Target not found!");
}
