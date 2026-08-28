const fs = require('fs');
let file = fs.readFileSync('firestore.rules', 'utf8');

file = file.replace(
`    function isValidAssignment(data) {
      return data.keys().hasAll(['title', 'type', 'createdBy', 'createdAt']) &&
             data.title is string &&
             data.type is string && 
             data.createdBy is string && data.createdBy == request.auth.uid &&
             data.createdAt is timestamp;
    }`,
`    function isValidAssignment(data) {
      return data.keys().hasAll(['title', 'type', 'createdBy', 'createdAt']) &&
             data.title is string &&
             data.type is string && 
             data.createdBy is string &&
             data.createdAt is timestamp;
    }`
);

fs.writeFileSync('firestore.rules', file);
console.log('patched rules again');
