const fs = require('fs');

function addImport(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes("import { useTheme } from '../contexts/ThemeContext';")) {
    content = "import { useTheme } from '../contexts/ThemeContext';\n" + content;
    fs.writeFileSync(file, content);
    console.log('Added import to', file);
  }
}

addImport('src/pages/ComputerReadingTest.tsx');
addImport('src/pages/SeptemberListeningTest.tsx');
addImport('src/pages/OctoberListeningTest.tsx');
