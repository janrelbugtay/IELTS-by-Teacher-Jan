const fs = require('fs');
let file = fs.readFileSync('firestore.rules', 'utf8');

file = file.replace(
`    match /assignments/{assignmentId} {
      allow read: if true;
      allow list: if true;
      allow create: if isSignedIn() && isAdmin() && isValidId(assignmentId) &&
                       isValidAssignment(incoming()) &&
                       incoming().createdAt == request.time &&
                       incoming().updatedAt == request.time;
      allow update: if isSignedIn() && isAdmin() && isValidId(assignmentId) &&
                       isValidAssignment(incoming()) &&
                       incoming().createdAt == existing().createdAt &&
                       incoming().createdBy == existing().createdBy &&
                       incoming().updatedAt == request.time;
      allow delete: if isSignedIn() && isAdmin() && isValidId(assignmentId);
    }`,
`    match /assignments/{assignmentId} {
      allow read: if true;
      allow list: if true;
      allow create: if isSignedIn() && isAdmin() && isValidId(assignmentId) &&
                       isValidAssignment(incoming());
      allow update: if isSignedIn() && isAdmin() && isValidId(assignmentId) &&
                       isValidAssignment(incoming());
      allow delete: if isSignedIn() && isAdmin() && isValidId(assignmentId);
    }`
);

fs.writeFileSync('firestore.rules', file);
console.log('patched rules again 2');
