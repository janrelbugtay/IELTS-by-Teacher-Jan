const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingRecordingsReview.tsx', 'utf8');

const search = `{isOffline && audioUrl && audioUrl.startsWith('http') ? (`;
const replace = `{(audioUrl && (audioUrl.includes('drive.google.com') || audioUrl.includes('youtube.com') || audioUrl.includes('youtu.be') || (isOffline && audioUrl.startsWith('http')))) ? (`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/components/SpeakingRecordingsReview.tsx', code);
    console.log("Patched SpeakingRecordingsReview.tsx iframe logic");
} else {
    console.log("Could not find search string in SpeakingRecordingsReview.tsx");
}
