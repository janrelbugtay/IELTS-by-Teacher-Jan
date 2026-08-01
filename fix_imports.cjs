const fs = require('fs');

// Fix AugustListeningTest.tsx
let august = fs.readFileSync('src/pages/AugustListeningTest.tsx', 'utf8');
august = august.replace(/export function AugustListeningTest\(\) \{/g, 'export function AugustListeningTest({ submissionId }: { submissionId?: string }) {');
august = august.replace(/import \{ FebruaryListeningTest \} from '\.\/FebruaryListeningTest';\n/g, '');
// Since we might not need submissionId but let's keep it if we replaced
fs.writeFileSync('src/pages/AugustListeningTest.tsx', august);

// Fix ComputerListeningTest.tsx
let comp = fs.readFileSync('src/pages/ComputerListeningTest.tsx', 'utf8');
if (!comp.includes('AugustListeningTest')) {
    comp = comp.replace(
        /import \{ JulyListeningTest \} from '\.\/JulyListeningTest';/,
        "import { JulyListeningTest } from './JulyListeningTest';\nimport { AugustListeningTest } from './AugustListeningTest';"
    );
    comp = comp.replace(
        /if \(id === '26' && !submissionId\) return <JulyListeningTest \/>;/,
        "if (id === '26' && !submissionId) return <JulyListeningTest />;\n  if (id === '30' && !submissionId) return <AugustListeningTest />;"
    );
    fs.writeFileSync('src/pages/ComputerListeningTest.tsx', comp);
}
console.log("Done");
