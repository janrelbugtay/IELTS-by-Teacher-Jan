const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

if (!code.includes('@plugin "@tailwindcss/typography";')) {
    code = code.replace('@import "tailwindcss";', '@import "tailwindcss";\n@plugin "@tailwindcss/typography";');
    fs.writeFileSync('src/index.css', code);
    console.log("Patched src/index.css with typography plugin");
} else {
    console.log("Already patched src/index.css");
}
