const fs = require('fs');
let content = fs.readFileSync('src/pages/ielts/Dashboard.tsx', 'utf8');

const regex = /{editingScoreId === sub.id \? \([\s\S]*?\) : \([\s\S]*?\{isAdmin && \([\s\S]*?setEditingScoreId\(sub.id\); setEditScoreValue\(sub.bandScore\?\.toString\(\) \|\| ''\);[\s\S]*?<\/button>[\s\S]*?\)[\s\S]*?<\/td>/g;

content = content.replace(regex, (match) => {
    // We want to add editRawScoreValue to the onClick, and add an input for raw score.
    // Let's just do targeted string replacements on the match.
    
    let newMatch = match.replace(
        /setEditingScoreId\(sub.id\); setEditScoreValue\(sub.bandScore\?\.toString\(\) \|\| ''\);/g,
        "setEditingScoreId(sub.id); setEditScoreValue(sub.bandScore?.toString() || ''); setEditRawScoreValue(sub.score?.toString() || '');"
    );
    
    // Add the input for raw score next to the band score input
    newMatch = newMatch.replace(
        /<input([^>]*?)value=\{editScoreValue\}([^>]*?)>/g,
        `<input$1value={editScoreValue}$2 placeholder="Band" title="Band Score" />
         <input type="number" min="0" max="40" className="w-16 px-2 py-1 text-sm border border-slate-300 rounded" value={editRawScoreValue} onChange={(e) => setEditRawScoreValue(e.target.value)} placeholder="Raw" title="Raw Score" />`
    );
    
    // Add the raw score display next to the band score display
    newMatch = newMatch.replace(
        /\{sub.bandScore !== undefined && sub.bandScore !== null \? <span className="bg-blue-50 text-\[\#1E4DB7\] px-3 py-1\.5 rounded-lg border border-blue-100 text-base">\{sub.bandScore.toFixed\(1\)\}<\/span> : <span className="text-slate-400">TBD<\/span>\}/g,
        `{sub.score !== undefined && sub.score !== null && <span className="text-slate-500 font-medium mr-2 text-sm" title="Raw Score">{sub.score}/40</span>}
         {sub.bandScore !== undefined && sub.bandScore !== null ? <span className="bg-blue-50 text-[#1E4DB7] px-3 py-1.5 rounded-lg border border-blue-100 text-base" title="Band Score">{sub.bandScore.toFixed(1)}</span> : <span className="text-slate-400">TBD</span>}`
    );
    
    return newMatch;
});

fs.writeFileSync('src/pages/ielts/Dashboard.tsx', content, 'utf8');
console.log('Done replacing edit UI.');
