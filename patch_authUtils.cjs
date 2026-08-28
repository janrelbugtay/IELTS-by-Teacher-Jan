const fs = require('fs');
let content = fs.readFileSync('src/lib/authUtils.ts', 'utf8');
content = content.replace(
    /firstName\.toLowerCase\(\)\.replace/g,
    "(firstName || '').toLowerCase().replace"
);
content = content.replace(
    /lastName\.toLowerCase\(\)\.replace/g,
    "(lastName || '').toLowerCase().replace"
);
fs.writeFileSync('src/lib/authUtils.ts', content);
console.log('patched authUtils.ts');
