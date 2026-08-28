const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');
content = content.replace(
  /export const db = initializeFirestore\(app, \{\s*experimentalForceLongPolling: true,\s*\}, \(firebaseConfig as any\)\.firestoreDatabaseId \|\| 'ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e'\);/,
  "export const db = initializeFirestore(app, {}, (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-6d37f61d-b7fb-45ee-96ed-666c99c3c40e');"
);
fs.writeFileSync('src/lib/firebase.ts', content);
console.log('patched firebase.ts');
