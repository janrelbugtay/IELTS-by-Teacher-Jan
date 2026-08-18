const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

content = content.replace(
  "const dashboardPath = userCourse?.toLowerCase() === 'pet' ? '/pet/dashboard' : '/ielts/dashboard';",
  "let dashboardPath = '/ielts/dashboard';\n  if (userCourse?.toLowerCase() === 'pet') dashboardPath = '/pet/dashboard';\n  if (userCourse?.toLowerCase() === 'ket') dashboardPath = '/ket/dashboard';"
);

fs.writeFileSync('src/components/Layout.tsx', content);
console.log("Patched nav layout conditional path");
