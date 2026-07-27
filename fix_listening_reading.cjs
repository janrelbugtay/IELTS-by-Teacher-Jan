const fs = require('fs');
let file = fs.readFileSync('src/pages/ComputerListeningTest.tsx', 'utf8');

const oldTitleLogic = `      let title = 'January Listening Practice';`;
const newTitleLogic = `      let title = 'Listening Practice';
      if (id) {
          const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          const numId = parseInt(id, 10);
          if (!isNaN(numId) && numId >= 1 && numId <= 48) {
              const month = months[Math.ceil(numId / 4) - 1];
              title = \`\${month} Listening Practice\`;
          } else {
              title = id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
          }
      }`;

file = file.replace(oldTitleLogic, newTitleLogic);
fs.writeFileSync('src/pages/ComputerListeningTest.tsx', file);
