const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

code = code.replace(
`const getFallbackType = (id) => {
  const numId = parseInt(String(id));`,
`const getFallbackType = (id) => {
  if (id === 'offline_speaking') return 'speaking';
  const numId = parseInt(String(id));`
);

fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
