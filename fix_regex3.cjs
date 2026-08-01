const fs = require('fs');
const files = [
  'src/pages/ComputerReadingTest.tsx', 
  'src/pages/AprilReadingTest.tsx', 
  'src/pages/FebruaryReadingTest.tsx', 
  'src/pages/MarchReadingTest.tsx', 
  'src/pages/MayReadingTest.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace \\s with \s in the regex
    content = content.replace(
      /\/q\^\(\?:\[A-K\]\[\.\)\]\?\\\\s\+\|\(\?:i\{1,3\}\|iv\|v\|vi\{1,3\}\|ix\|x\)\[\.\)\]\\\\s\+\)\/i/g, 
      "not working"
    );
    // Let's do it easier
    content = content.split('/^(?:[A-K][.)]?\\\\s+|(?:i{1,3}|iv|v|vi{1,3}|ix|x)[.)]\\\\s+)/i').join('/^(?:[A-K][.)]?\\s+|(?:i{1,3}|iv|v|vi{1,3}|ix|x)[.)]\\s+)/i');

    fs.writeFileSync(file, content);
  }
}
