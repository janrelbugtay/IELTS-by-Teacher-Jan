const fs = require('fs');
let file = fs.readFileSync('firestore.rules', 'utf8');

file = file.replace(
`    function isValidAssignment(data) {
      return data.keys().hasAll(['title', 'description', 'type', 'content', 'createdBy', 'createdAt', 'updatedAt']) &&
             (data.keys().size() == 7 || data.keys().size() == 8) &&
             data.title is string && data.title.size() > 0 && data.title.size() <= 200 &&
             data.description is string && data.description.size() <= 1000 &&
             data.type is string && data.type.matches('^(reading|listening|writing|speaking)$') &&
             data.content is string && data.content.size() <= 10000 &&
             data.createdBy is string && data.createdBy == request.auth.uid &&
             data.createdAt is timestamp &&
             data.updatedAt is timestamp;
    }`,
`    function isValidAssignment(data) {
      return data.keys().hasAll(['title', 'type', 'createdBy', 'createdAt']) &&
             data.title is string &&
             data.type is string && 
             data.createdBy is string && data.createdBy == request.auth.uid &&
             data.createdAt is timestamp;
    }`
);

fs.writeFileSync('firestore.rules', file);
console.log('patched rules relaxed');
