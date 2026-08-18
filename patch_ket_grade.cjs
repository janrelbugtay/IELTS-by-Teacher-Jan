const fs = require('fs');
let content = fs.readFileSync('src/components/KETCalculator.tsx', 'utf8');

const oldGrade = `  const getGrade = (score: number | null) => {
    if (score === null) return { grade: 'N/A', level: 'N/A', color: 'text-gray-400', bg: 'bg-gray-100' };
    if (score >= 160) return { grade: 'Grade A', level: 'Level B2', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (score >= 153) return { grade: 'Grade B', level: 'Level B1', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (score >= 140) return { grade: 'Grade C', level: 'Level B1', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (score >= 120) return { grade: 'Level A2', level: 'Level A2', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'Fail', level: 'Below A2', color: 'text-rose-600', bg: 'bg-rose-100' };
  };`;

const newGrade = `  const getGrade = (score: number | null) => {
    if (score === null) return { grade: 'N/A', level: 'N/A', color: 'text-gray-400', bg: 'bg-gray-100' };
    if (score >= 140) return { grade: 'Grade A', level: 'Level B1', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (score >= 133) return { grade: 'Grade B', level: 'Level A2', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (score >= 120) return { grade: 'Grade C', level: 'Level A2', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    if (score >= 100) return { grade: 'Level A1', level: 'Level A1', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { grade: 'Fail', level: 'Below A1', color: 'text-rose-600', bg: 'bg-rose-100' };
  };`;

content = content.replace(oldGrade, newGrade);

fs.writeFileSync('src/components/KETCalculator.tsx', content);
console.log("Patched grades");
