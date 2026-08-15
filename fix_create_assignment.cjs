const fs = require('fs');
let content = fs.readFileSync('src/pages/CreateAssignment.tsx', 'utf8');

// Fix the syntax error in useState
content = content.replace(
  "  const [type,\n        ...(type === 'speaking' ? { speakingParts } : {}), setType] = useState<'reading' | 'listening' | 'writing' | 'speaking'>('reading');",
  "  const [type, setType] = useState<'reading' | 'listening' | 'writing' | 'speaking'>('reading');"
);

// Fix the addDoc argument
content = content.replace(
  "      await addDoc(collection(db, 'assignments'), {\n        title: title.trim(),\n        description: description.trim(),\n        type,\n        content: content.trim(),",
  "      await addDoc(collection(db, 'assignments'), {\n        title: title.trim(),\n        description: description.trim(),\n        type,\n        ...(type === 'speaking' ? { speakingParts } : {}),\n        content: content.trim(),"
);

fs.writeFileSync('src/pages/CreateAssignment.tsx', content);
