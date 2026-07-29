const fs = require('fs');
let code = fs.readFileSync('src/pages/SpeakingTestResult.tsx', 'utf8');

const search = `  const isOffline = submissionData?.assignmentId === 'offline_speaking' || submissionData?.assignmentTitle?.toLowerCase().includes('offline');`;
const replace = `  const hasVideoLink = submissionData?.audioUrl && (
    submissionData.audioUrl.includes('drive.google.com') || 
    submissionData.audioUrl.includes('youtube.com') || 
    submissionData.audioUrl.includes('youtu.be')
  );
  const isOffline = submissionData?.assignmentId === 'offline_speaking' || submissionData?.assignmentTitle?.toLowerCase().includes('offline') || hasVideoLink;`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/pages/SpeakingTestResult.tsx', code);
    console.log("Patched isOffline logic in SpeakingTestResult.tsx");
} else {
    console.log("Could not find search string in SpeakingTestResult.tsx");
}
