const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('else if (score >= 2) bandScore = 2.0;\n\n      await addDoc')) {
    content = content.replace(
      'else if (score >= 2) bandScore = 2.0;\n\n      await addDoc',
      'else if (score >= 2) bandScore = 2.0;\n      else if (score >= 1) bandScore = 1.0;\n\n      await addDoc'
    );
    fs.writeFileSync(file, content);
    console.log('Patched ' + file);
  }
}

['src/pages/AugustListeningTest.tsx', 'src/pages/JulyListeningTest.tsx', 'src/pages/JuneListeningTest.tsx', 'src/pages/MayListeningTest.tsx', 'src/pages/AprilListeningTest.tsx', 'src/pages/MarchListeningTest.tsx'].forEach(patchFile);
