const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

const search = `vietnameseTranslation: sub.vietnameseTranslation || ''`;
const replace = `vietnameseTranslation: sub.vietnameseTranslation || sub.teacherCommentVi || ''`;

if(code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
    console.log("Patched Dashboard.tsx edit modal fallback");
} else {
    console.log("Could not find search string in Dashboard.tsx");
}
