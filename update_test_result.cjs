const fs = require('fs');
let file = fs.readFileSync('src/pages/TestResult.tsx', 'utf8');

file = file.replace(/  if \(type === 'listening'\) \{\s*const aId = submission\.assignmentId;\s*if \(aId === '2'\) return <JanuaryListeningTest submissionId=\{id\} \/>;\s*if \(aId === '6'\) return <FebruaryListeningTest submissionId=\{id\} \/>;\s*if \(aId === '10'\) return <MarchListeningTest submissionId=\{id\} \/>;\s*if \(aId === '14'\) return <AprilListeningTest submissionId=\{id\} \/>;\s*if \(aId === '18'\) return <MayListeningTest submissionId=\{id\} \/>;\s*if \(aId === '22'\) return <JuneListeningTest submissionId=\{id\} \/>;\s*if \(aId === '26'\) return <JulyListeningTest submissionId=\{id\} \/>;\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('january'\)\) return <JanuaryListeningTest submissionId=\{id\} \/>;\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('february'\)\) return <FebruaryListeningTest submissionId=\{id\} \/>;\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('march'\)\) return <MarchListeningTest submissionId=\{id\} \/>;\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('april'\)\) return <AprilListeningTest submissionId=\{id\} \/>;\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('may'\)\) return <MayListeningTest submissionId=\{id\} \/>;\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('june'\)\) return <JuneListeningTest submissionId=\{id\} \/>;\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('july'\)\) return <JulyListeningTest submissionId=\{id\} \/>;/g, `  if (type === 'listening') {
      if (submission.assignmentTitle?.toLowerCase().includes('january')) return <JanuaryListeningTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('february')) return <FebruaryListeningTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('march')) return <MarchListeningTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('april')) return <AprilListeningTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('may')) return <MayListeningTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('june')) return <JuneListeningTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('july')) return <JulyListeningTest submissionId={id} />;

      const aId = submission.assignmentId;
      if (aId === '2') return <JanuaryListeningTest submissionId={id} />;
      if (aId === '6') return <FebruaryListeningTest submissionId={id} />;
      if (aId === '10') return <MarchListeningTest submissionId={id} />;
      if (aId === '14') return <AprilListeningTest submissionId={id} />;
      if (aId === '18') return <MayListeningTest submissionId={id} />;
      if (aId === '22') return <JuneListeningTest submissionId={id} />;
      if (aId === '26') return <JulyListeningTest submissionId={id} />;`);

file = file.replace(/  if \(type === 'writing'\) \{\s*const aId = submission\.assignmentId;\s*if \(aId === '3'\) return <JanuaryWritingTest submissionId=\{id\} \/>;\s*if \(aId === '7'\) return <FebruaryWritingTest submissionId=\{id\} \/>;\s*if \(aId === '11'\) return <MarchWritingTest submissionId=\{id\} \/>;\s*if \(aId === '15'\) return <AprilWritingTest submissionId=\{id\} \/>;\s*if \(aId === '19'\) return <MayWritingTest submissionId=\{id\} \/>;\s*if \(aId === '23'\) return <JuneWritingTest submissionId=\{id\} \/>;\s*if \(aId === '27'\) return <JulyWritingTest submissionId=\{id\} \/>;\s*\/\/ Fallback to title\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('january'\)\) return <JanuaryWritingTest submissionId=\{id\} \/>;\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('february'\)\) return <FebruaryWritingTest submissionId=\{id\} \/>;\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('march'\)\) return <MarchWritingTest submissionId=\{id\} \/>;\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('april'\)\) return <AprilWritingTest submissionId=\{id\} \/>;\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('may'\)\) return <MayWritingTest submissionId=\{id\} \/>;\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('june'\)\) return <JuneWritingTest submissionId=\{id\} \/>;\s*if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('july'\)\) return <JulyWritingTest submissionId=\{id\} \/>;/g, `  if (type === 'writing') {
      if (submission.assignmentTitle?.toLowerCase().includes('january')) return <JanuaryWritingTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('february')) return <FebruaryWritingTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('march')) return <MarchWritingTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('april')) return <AprilWritingTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('may')) return <MayWritingTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('june')) return <JuneWritingTest submissionId={id} />;
      if (submission.assignmentTitle?.toLowerCase().includes('july')) return <JulyWritingTest submissionId={id} />;

      const aId = submission.assignmentId;
      if (aId === '3') return <JanuaryWritingTest submissionId={id} />;
      if (aId === '7') return <FebruaryWritingTest submissionId={id} />;
      if (aId === '11') return <MarchWritingTest submissionId={id} />;
      if (aId === '15') return <AprilWritingTest submissionId={id} />;
      if (aId === '19') return <MayWritingTest submissionId={id} />;
      if (aId === '23') return <JuneWritingTest submissionId={id} />;
      if (aId === '27') return <JulyWritingTest submissionId={id} />;`);

fs.writeFileSync('src/pages/TestResult.tsx', file);
