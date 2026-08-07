const fs = require('fs');
let code = fs.readFileSync('src/pages/ComputerReadingTest.tsx', 'utf8');

const target = `          let regexString = escapedParts.join('[\\\\s\\\\S]*?');
          // Allow flexible matching for quotes
          regexString = regexString.replace(/['\\'’‘]/g, "['\\'’‘]").replace(/["“”]/g, '["“”]');`;

const replacement = `          let regexString = escapedParts.join('[\\\\s\\\\S]*?');
          // Allow flexible matching for quotes
          regexString = regexString.replace(/['’‘]/g, "['’‘]").replace(/["“”]/g, '["“”]');`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/ComputerReadingTest.tsx', code.replace(target, replacement));
  console.log("Patched quotes successfully");
} else {
  console.log("Target quotes not found");
}
