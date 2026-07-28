const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingRecordingsReview.tsx', 'utf8');

code = code.replace(
  "export const SpeakingRecordingsReview = ({ testId, recordedAudio }: { testId?: string, recordedAudio: Blob | null }) => {",
  "export const SpeakingRecordingsReview = ({ testId, recordedAudio, providedAudioUrl }: { testId?: string, recordedAudio?: Blob | null, providedAudioUrl?: string | null }) => {"
);

code = code.replace(
  "const [audioUrl, setAudioUrl] = useState<string | null>(null);",
  "const [audioUrl, setAudioUrl] = useState<string | null>(providedAudioUrl || null);"
);

code = code.replace(
  "useEffect(() => {\n    if (recordedAudio && recordedAudio.size > 0) {",
  "useEffect(() => {\n    if (providedAudioUrl) {\n      setAudioUrl(providedAudioUrl);\n    } else if (recordedAudio && recordedAudio.size > 0) {"
);

fs.writeFileSync('src/components/SpeakingRecordingsReview.tsx', code);
