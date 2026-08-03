const fs = require('fs');
let content = fs.readFileSync('src/pages/SeptemberListeningTest.tsx', 'utf8');

// replace notesList rendering
const notesRender = `
          {notesList.map((note, idx) => (
             <div key={idx} className="absolute z-40 bg-yellow-100 border border-yellow-300 p-2 shadow-md rounded text-sm max-w-xs text-black" style={{ top: note.y, right: 20 }}>
                <Edit3 size={12} className="inline mr-1" /> {note.text}
             </div>
          ))}
          <div className="w-full max-w-[1000px] min-h-full">
`;

if (!content.includes('notesList.map')) {
  content = content.replace('<div className="w-full max-w-[1000px] min-h-full">', notesRender);
}

fs.writeFileSync('src/pages/SeptemberListeningTest.tsx', content);
