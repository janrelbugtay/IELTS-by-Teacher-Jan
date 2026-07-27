const fs = require('fs');

const files = fs.readdirSync('src/pages').filter(f => f.endsWith('ReadingTest.tsx'));

files.forEach(f => {
  let file = 'src/pages/' + f;
  let content = fs.readFileSync(file, 'utf8');

  // We are going to find the optionLines container
  const target = "className={`mt-4 p-5 border-2 rounded-lg shadow-sm font-sans not-italic text-[1.25em] font-semibold ${theme.box} ${theme.border} ${theme.text}`}";
  const replacement = "className={`mt-4 font-sans not-italic text-[1.25em] font-medium ${colorTheme !== 'standard' ? 'text-white' : 'text-black'}`}";

  if (content.includes(target)) {
     content = content.replace(target, replacement);
     fs.writeFileSync(file, content, 'utf8');
     console.log('Fixed instruction box in', file);
  }
});
