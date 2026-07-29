const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

const search = `                                    feedback: sub.feedback || sub.teacherComment || sub.aiFeedback || '',
                                    vietnameseTranslation: sub.vietnameseTranslation || sub.teacherCommentVi || ''`;

const replace = `                                    feedback: sub.feedback || sub.teacherComment || sub.aiFeedback || sub.answers?.feedback || sub.answers?.teacherComment || '',
                                    vietnameseTranslation: sub.vietnameseTranslation || sub.teacherCommentVi || sub.answers?.vietnameseTranslation || sub.answers?.teacherCommentVi || ''`;

if(code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
    console.log("Patched Dashboard.tsx edit modal with answers fallback");
} else {
    console.log("Could not find search string in Dashboard.tsx");
}
