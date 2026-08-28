const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');
content = content.replace(
    /firstName\.toLowerCase\(\)\.replace/g,
    "(firstName || '').toLowerCase().replace"
);
content = content.replace(
    /lastName\.toLowerCase\(\)\.replace/g,
    "(lastName || '').toLowerCase().replace"
);
fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
console.log('patched AdminDashboard.tsx');
