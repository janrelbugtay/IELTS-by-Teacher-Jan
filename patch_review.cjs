const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingRecordingsReview.tsx', 'utf8');

code = code.replace(
  'isRealAudio={i === 0 && !!audioUrl}',
  'isRealAudio={!!audioUrl}'
);

code = code.replace(
  '<SimpleAudioPlayer src={audioUrl} defaultDurationStr={MOCK_QUESTIONS.part2.duration} />',
  '<SimpleAudioPlayer src={audioUrl} defaultDurationStr={MOCK_QUESTIONS.part2.duration} isRealAudio={!!audioUrl} />'
);

code = code.replace(
  '<SimpleAudioPlayer src={audioUrl} defaultDurationStr={q.duration} />',
  '<SimpleAudioPlayer src={audioUrl} defaultDurationStr={q.duration} isRealAudio={!!audioUrl} />'
);
// replace multiple occurrences if needed
code = code.replace(
  '<SimpleAudioPlayer src={audioUrl} defaultDurationStr={q.duration} />',
  '<SimpleAudioPlayer src={audioUrl} defaultDurationStr={q.duration} isRealAudio={!!audioUrl} />'
);

fs.writeFileSync('src/components/SpeakingRecordingsReview.tsx', code);
