const fs = require('fs');
let file = fs.readFileSync('firestore.rules', 'utf8');

file = file.replace(
`    match /submissions/{submissionId} {
      allow read, write: if true;
      match /recordings/{recordingId} {
        allow read, write: if true;
      }
    }      
    }`,
`    match /submissions/{submissionId} {
      allow read, write: if true;
      match /recordings/{recordingId} {
        allow read, write: if true;
      }
    }`
);
fs.writeFileSync('firestore.rules', file);
