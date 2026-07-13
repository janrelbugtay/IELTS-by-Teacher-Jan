const fs = require('fs');

let code = fs.readFileSync('src/pages/TestResult.tsx', 'utf8');

// Fix listening block
const listeningBlock = `  if (type === 'listening') {
      if (submission.assignmentTitle?.toLowerCase().includes('january')) {
          return <JanuaryListeningTest submissionId={id} />;
      }
      if (submission.assignmentTitle?.toLowerCase().includes('february')) {
          return <FebruaryListeningTest submissionId={id} />;
      }
      if (submission.assignmentTitle?.toLowerCase().includes('march')) {
          return <MarchListeningTest submissionId={id} />;
      }
      if (submission.assignmentTitle?.toLowerCase().includes('april')) {
          return <AprilListeningTest submissionId={id} />;
      }
      if (submission.assignmentTitle?.toLowerCase().includes('may')) {
          return <MayListeningTest submissionId={id} />;
      }
      return <ComputerListeningTest submissionId={id} />;
  }`;

// Fix writing block
const writingBlock = `  if (type === 'writing') {
      if (submission.assignmentTitle?.toLowerCase().includes('january')) {
          return <JanuaryWritingTest submissionId={id} />;
      }
      if (submission.assignmentTitle?.toLowerCase().includes('february')) {
          return <FebruaryWritingTest submissionId={id} />;
      }
      if (submission.assignmentTitle?.toLowerCase().includes('march')) {
          return <MarchWritingTest submissionId={id} />;
      }
      return <ComputerWritingTest submissionId={id} />;
  }`;

// Replace everything between "if (type === 'listening') {" and "if (type === 'writing') {"
const listeningStart = code.indexOf("  if (type === 'listening') {");
const writingStart = code.indexOf("  if (type === 'writing') {");
const speakingStart = code.indexOf("  if (type === 'speaking') {");

if (listeningStart !== -1 && writingStart !== -1 && speakingStart !== -1) {
    code = code.substring(0, listeningStart) + listeningBlock + '\n' + writingBlock + '\n' + code.substring(speakingStart);
    fs.writeFileSync('src/pages/TestResult.tsx', code);
    console.log("Fixed TestResult.tsx");
} else {
    console.log("Couldn't find blocks");
}

