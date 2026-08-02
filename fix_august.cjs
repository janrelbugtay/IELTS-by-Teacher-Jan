const fs = require('fs');
const content = fs.readFileSync('src/pages/AugustListeningTest.tsx', 'utf8');
const fixed = content.replace(/<CustomAudioPlayer[\s\S]*?src="\/api\/audio\?id=([^"]+)"[\s\S]*?\/>/g, (match, id) => {
    return `<iframe src="https://drive.google.com/file/d/${id}/preview" width="100%" height="150" allow="autoplay" className="border-0 rounded shadow-sm bg-white overflow-hidden max-w-[400px]"></iframe>`;
});
fs.writeFileSync('src/pages/AugustListeningTest.tsx', fixed);
