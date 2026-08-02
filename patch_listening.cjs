const fs = require('fs');
const path = require('path');

const dir = 'src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('ListeningTest.tsx')).map(f => path.join(dir, f));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix play/pause text color
    content = content.replace(
        /className="ml-2 px-2 py-0.5 text-xs font-normal bg-white border border-gray-400 rounded hover:bg-gray-100"/g,
        'className="ml-2 px-2 py-0.5 text-xs font-normal bg-white text-black border border-gray-400 rounded hover:bg-gray-100"'
    );
    
    // Remove the 3 buttons
    content = content.replace(
        /<button className="bg-gradient-to-b from-gray-100 to-gray-300 text-black px-3 py-0.5 rounded text-xs border border-gray-400 shadow-sm hover:from-white hover:to-gray-200">Settings<\/button>\s*<button className="bg-gradient-to-b from-gray-100 to-gray-300 text-black px-3 py-0.5 rounded text-xs border border-gray-400 shadow-sm hover:from-white hover:to-gray-200">Help <span className="text-blue-700 font-bold ml-0.5">\?<\/span><\/button>\s*<button onClick=\{\(\) => navigate\('\/dashboard'\)\} className="bg-gradient-to-b from-gray-100 to-gray-300 text-black px-3 py-0.5 rounded text-xs border border-gray-400 shadow-sm hover:from-white hover:to-gray-200">Quit<\/button>/g,
        ''
    );
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Done');
