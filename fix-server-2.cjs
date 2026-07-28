const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace("outputAudioTranscription: {}, inputAudioTranscription: {}, speechConfig: {", "speechConfig: {");

fs.writeFileSync('server.ts', content, 'utf8');
console.log('Fixed live connect config');
