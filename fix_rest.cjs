const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  // Handle July and May which have the trailing `{ window.open... }`
  content = content.replace(/<iframe src="https:\/\/drive\.google\.com\/file\/d\/([^\/]+)\/preview"[^>]*><\/iframe> \{ window\.open\('https:\/\/drive\.google\.com\/file\/d\/[^\/]+\/view\?usp=sharing', '_blank'\); return true; \}\}\s*\/>/g, '<iframe src="https://drive.google.com/file/d/$1/preview" width="100%" height="150" allow="autoplay" className="border-0 rounded shadow-sm bg-white overflow-hidden max-w-[400px]"></iframe>');
  
  // Handle May Listening test which was split differently?
  // Let's just fix the general case
  fs.writeFileSync(file, content);
}

fix('src/pages/JulyListeningTest.tsx');

let may = fs.readFileSync('src/pages/MayListeningTest.tsx', 'utf8');
may = may.replace(/<iframe[\s\S]*?src="\/api\/audio\?id=([^"]+)"[\s\S]*?\/>/g, (match, id) => {
    return `<iframe src="https://drive.google.com/file/d/${id}/preview" width="100%" height="150" allow="autoplay" className="border-0 rounded shadow-sm bg-white overflow-hidden max-w-[400px]"></iframe>`;
});
fs.writeFileSync('src/pages/MayListeningTest.tsx', may);

// Fix June height
let june = fs.readFileSync('src/pages/JuneListeningTest.tsx', 'utf8');
june = june.replace(/<iframe src="([^"]+)" width="100%" style=\{\{ maxWidth: "400px" \}\} height="80"/g, '<iframe src="$1" width="100%" style={{ maxWidth: "400px" }} height="150"');
fs.writeFileSync('src/pages/JuneListeningTest.tsx', june);

console.log('Fixed rest');
