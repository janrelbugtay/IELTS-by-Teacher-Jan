const fs = require('fs');
const files = [
  'src/pages/AprilReadingTest.tsx', 
  'src/pages/FebruaryReadingTest.tsx', 
  'src/pages/MarchReadingTest.tsx', 
  'src/pages/MayReadingTest.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(
      /className=\{\`mt-4 font-sans not-italic text-\[1\.25em\] \$\{colorTheme !== 'standard' \? 'text-white' : 'text-black'\}\`\}/g,
      "className={`mt-4 font-sans not-italic text-[1.25em] text-black`}"
    );

    // Also just in case the font-bold was still there
    content = content.replace(
      /className=\{\`mt-4 font-sans not-italic text-\[1\.25em\] font-bold \$\{colorTheme !== 'standard' \? 'text-white' : 'text-black'\}\`\}/g,
      "className={`mt-4 font-sans not-italic text-[1.25em] text-black`}"
    );

    fs.writeFileSync(file, content);
  }
}
