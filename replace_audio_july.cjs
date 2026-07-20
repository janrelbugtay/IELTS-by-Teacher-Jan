const fs = require('fs');
let file = fs.readFileSync('src/pages/JulyListeningTest.tsx', 'utf8');

file = file.replace(
    '<div>\n              <CustomAudioPlayer ref={audioRef} src="/api/audio?id=1OuGcq0z6bZ28Uv0nKogXeu40tEZTD5Jl" isMockMode={testMode === \'mock\'} />\n          </div>',
    `<div className="flex flex-col items-end gap-1">\n              <a href="https://drive.google.com/file/d/1fjJ_EmkcFK8tm9C7EbehCVERPuQy5EZV/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline font-semibold">\n                  Open Listening File in New Window\n              </a>\n              <CustomAudioPlayer ref={audioRef} src="/api/audio?id=1fjJ_EmkcFK8tm9C7EbehCVERPuQy5EZV" isMockMode={testMode === 'mock'} />\n          </div>`
);

fs.writeFileSync('src/pages/JulyListeningTest.tsx', file);
console.log('Audio player updated.');
