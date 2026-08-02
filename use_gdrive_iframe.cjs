const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/AprilListeningTest.tsx',
  'src/pages/AugustListeningTest.tsx',
  'src/pages/ComputerListeningTest.tsx',
  'src/pages/FebruaryListeningTest.tsx',
  'src/pages/JanuaryListeningTest.tsx',
  'src/pages/JulyListeningTest.tsx',
  'src/pages/JuneListeningTest.tsx',
  'src/pages/MarchListeningTest.tsx',
  'src/pages/MayListeningTest.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Replace <CustomAudioPlayer ... /> with iframe
  // We need to extract the ID from src="/api/audio?id=XYZ"
  const regex = /<CustomAudioPlayer[^>]*src="\/api\/audio\?id=([^"]+)"[^>]*>/g;
  
  content = content.replace(regex, (match, id) => {
    return `<iframe src="https://drive.google.com/file/d/${id}/preview" width="100%" height="150" allow="autoplay" className="border-0 rounded shadow-sm bg-white overflow-hidden max-w-[400px]"></iframe>`;
  });
  
  // also handle the case where it might be split across lines
  // AugustListeningTest.tsx doesn't have an ID in the CustomAudioPlayer? Let's check what it has.
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Converted to Google Drive iframe.');
