const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace("outputAudioTranscription: {}, inputAudioTranscription: {}, speechConfig: {\n            voiceConfig: { prebuiltVoiceConfig: { voiceName: \"Zephyr\" } }\n          }", "speechConfig: {\n            voiceConfig: { prebuiltVoiceConfig: { voiceName: \"Zephyr\" } }\n          }");

fs.writeFileSync('server.ts', content, 'utf8');
console.log('Fixed generateContent config');
