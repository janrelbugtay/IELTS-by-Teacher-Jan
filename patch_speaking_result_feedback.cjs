const fs = require('fs');
let code = fs.readFileSync('src/pages/SpeakingTestResult.tsx', 'utf8');

// Change the condition for the Feedback section to show whenever there is feedback or it's an offline test
const search = `{(submissionData.assignmentId === 'offline_speaking' || submissionData.assignmentTitle?.toLowerCase().includes('offline')) && (
        <div className="max-w-4xl mx-auto w-full px-8 pb-12">`;
const replace = `{(submissionData.assignmentId === 'offline_speaking' || submissionData.assignmentTitle?.toLowerCase().includes('offline') || submissionData.teacherComment || submissionData.aiFeedback || submissionData.feedback || submissionData.answers?.feedback || submissionData.answers?.teacherComment) && (
        <div className="max-w-4xl mx-auto w-full px-8 pb-12">`;

if (code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/pages/SpeakingTestResult.tsx', code);
    console.log("Patched SpeakingTestResult.tsx to show feedback for all tests if present");
} else {
    console.log("Could not find search string in SpeakingTestResult.tsx");
}
