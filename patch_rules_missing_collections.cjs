const fs = require('fs');
let file = fs.readFileSync('firestore.rules', 'utf8');

file = file.replace(
`    match /activity_logs/{logId} {`,
`    match /test/{docId} {
      allow read, write: if true;
    }
    match /speaking_tests/{testId} {
      allow read, write: if true;
    }
    match /activity_logs/{logId} {`
);

fs.writeFileSync('firestore.rules', file);
console.log('patched rules with missing collections');
