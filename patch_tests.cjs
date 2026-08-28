const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes("import { useTheme }")) {
    content = content.replace("import React,", "import React,\n"); // Ensure newline
    content = content.replace("import { useState", "import { useTheme } from '../contexts/ThemeContext';\nimport { useState");
  }

  // Replace local state with useTheme
  content = content.replace(
    /const \[colorTheme, setColorTheme\] = useState\('standard'\);/g,
    "const { theme: globalTheme, setTheme: setGlobalTheme } = useTheme();\n  const colorTheme = globalTheme === 'dark' ? 'white-on-black' : globalTheme === 'picture' ? 'yellow-on-black' : 'standard';\n  const setColorTheme = (val) => setGlobalTheme(val === 'white-on-black' ? 'dark' : val === 'yellow-on-black' ? 'picture' : 'light');"
  );
  
  // For ComputerListeningTest.tsx if it exists and has colorTheme, wait, grep said only 3 files.

  fs.writeFileSync(file, content);
  console.log('Patched', file);
}

patchFile('src/pages/ComputerReadingTest.tsx');
patchFile('src/pages/SeptemberListeningTest.tsx');
patchFile('src/pages/OctoberListeningTest.tsx');
