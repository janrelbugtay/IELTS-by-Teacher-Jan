const fs = require('fs');
let code = fs.readFileSync('src/data/speakingTestData.ts', 'utf8');

code = code.replace(
    "'Let\\'s talk about where you live. What do you like most about the place where you live?'",
    "'What do you like most about the place where you live?'"
);
code = code.replace(
    "'Now let\\'s talk about your work or studies. What do you enjoy most about your work or studies?'",
    "'What do you enjoy most about your work or studies?'"
);
code = code.replace(
    "'Now I\\'d like to ask you about singing. When do you usually sing?'",
    "'When do you usually sing?'"
);

fs.writeFileSync('src/data/speakingTestData.ts', code);
console.log("Patched repeating intro phrases");
