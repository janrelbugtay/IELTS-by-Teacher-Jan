const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

const search = `                        const payload = {
                          assignmentTitle: offlineForm.name || 'Offline Speaking Assignment',
                          audioUrl: offlineForm.link,
                          bandScore: isNaN(bandScore) ? null : bandScore,
                          feedback: offlineForm.feedback,
                          vietnameseTranslation: offlineForm.vietnameseTranslation,
                          createdAt: offlineForm.date ? new Date(offlineForm.date) : serverTimestamp(),
                        };`;

const replace = `                        const payload = {
                          assignmentTitle: offlineForm.name || 'Offline Speaking Assignment',
                          audioUrl: offlineForm.link,
                          bandScore: isNaN(bandScore) ? null : bandScore,
                          feedback: offlineForm.feedback,
                          teacherComment: offlineForm.feedback,
                          vietnameseTranslation: offlineForm.vietnameseTranslation,
                          teacherCommentVi: offlineForm.vietnameseTranslation,
                          createdAt: offlineForm.date ? new Date(offlineForm.date) : serverTimestamp(),
                        };`;

if(code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
    console.log("Patched Dashboard.tsx payload");
} else {
    console.log("Could not find search string in Dashboard.tsx");
}
