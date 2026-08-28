const fs = require('fs');
let file = fs.readFileSync('firestore.rules', 'utf8');

file = file.replace(
`    function isValidAssignment(data) {
      return data.keys().hasAll(['title', 'description', 'type', 'content', 'createdBy', 'createdAt', 'updatedAt']) &&
             data.keys().size() == 7 &&
             data.title is string && data.title.size() > 0 && data.title.size() <= 200 &&
             data.description is string && data.description.size() <= 1000 &&
             data.type is string && data.type.matches('^(reading|listening|writing)$') &&`,
`    function isValidAssignment(data) {
      return data.keys().hasAll(['title', 'description', 'type', 'content', 'createdBy', 'createdAt', 'updatedAt']) &&
             (data.keys().size() == 7 || data.keys().size() == 8) &&
             data.title is string && data.title.size() > 0 && data.title.size() <= 200 &&
             data.description is string && data.description.size() <= 1000 &&
             data.type is string && data.type.matches('^(reading|listening|writing|speaking)$') &&`
);

fs.writeFileSync('firestore.rules', file);
console.log('patched rules');
