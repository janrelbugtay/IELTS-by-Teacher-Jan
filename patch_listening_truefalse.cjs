const fs = require('fs');
const path = require('path');

const dir = 'src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('ListeningTest.tsx')).map(f => path.join(dir, f));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove the true/false conversions in Listening tests
    content = content.replace(/if \(userAns === 'T'\) userAns = 'TRUE';\n?\s*/g, '');
    content = content.replace(/if \(userAns === 'F'\) userAns = 'FALSE';\n?\s*/g, '');
    content = content.replace(/if \(userAns === 'NG' \|\| userAns === 'N'\) userAns = 'NOT GIVEN';\n?\s*/g, '');
    content = content.replace(/if \(userAns === 'Y'\) userAns = 'YES';\n?\s*/g, '');
    content = content.replace(/if \(userAns === 'N' && String\(.*?\) userAns = 'NO';\n?\s*/g, '');
    content = content.replace(/if \(userAns === 'N' && String\(correctAns\)\.includes\('NO'\)\) userAns = 'NO';\n?\s*/g, '');
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Done');
