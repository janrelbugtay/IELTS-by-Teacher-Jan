const fs = require('fs');
let code = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

const search = `                          createdAt: serverTimestamp(),`;
const replace = `                          createdAt: offlineForm.date ? new Date(offlineForm.date) : serverTimestamp(),`;

if(code.includes(search)) {
    code = code.replace(search, replace);
    fs.writeFileSync('src/pages/ielts/Dashboard.tsx', code);
    console.log("Replaced");
} else {
    console.log("Not found");
}
