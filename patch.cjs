const fs = require('fs');
let content = fs.readFileSync('src/components/KETCalculator.tsx', 'utf8');

const oldMaps = `// Map arrays: [Raw Marks, Cambridge Scale Score]
const CONVERSION_MAPS = {
  reading: [[0, 82], [10, 100], [14, 120], [20, 133], [25, 140], [30, 150]],
  writing: [[0, 82], [10, 100], [14, 120], [20, 133], [25, 140], [30, 150]],
  listening: [[0, 82], [9, 100], [12, 120], [17, 133], [21, 140], [25, 150]],
  speaking: [[0, 82], [14, 100], [18, 120], [27, 133], [36, 140], [45, 150]]
};`;

const newMaps = `// Map arrays: [Raw Marks, Cambridge Scale Score]
const CONVERSION_MAPS = {
  reading: [[0, 82], [13, 100], [20, 120], [25, 133], [28, 140], [30, 150]],
  writing: [[0, 82], [12, 100], [18, 120], [23, 133], [27, 140], [30, 150]],
  listening: [[0, 82], [11, 100], [17, 120], [21, 133], [23, 140], [25, 150]],
  speaking: [[0, 82], [18, 100], [27, 120], [33, 133], [40, 140], [45, 150]]
};`;

content = content.replace(oldMaps, newMaps);

const oldGrade = `const getGradeInfo = (scaleScore) => {
  if (scaleScore === null) return { text: "-", color: "text-gray-400" };
  if (scaleScore < 102) return { text: "Not Reported", color: "text-red-500" };
  if (scaleScore <= 119) return { text: "Level A1", color: "text-orange-500" };
  if (scaleScore <= 139) return { text: "Fail - Level A2", color: "text-amber-500" };
  if (scaleScore <= 152) return { text: "Pass - Grade C (Level A2)", color: "text-emerald-500" };
  if (scaleScore <= 159) return { text: "Pass - Grade B (Level A2)", color: "text-teal-500" };
  return { text: "Pass - Grade A (Level B2)", color: "text-blue-500" };
};`;

const newGrade = `const getGradeInfo = (scaleScore) => {
  if (scaleScore === null) return { text: "-", color: "text-gray-400" };
  if (scaleScore < 100) return { text: "Not Reported", color: "text-red-500" };
  if (scaleScore <= 119) return { text: "Level A1 (Fail)", color: "text-orange-500" };
  if (scaleScore <= 132) return { text: "Grade C (Level A2)", color: "text-emerald-500" };
  if (scaleScore <= 139) return { text: "Grade B (Level A2)", color: "text-teal-500" };
  return { text: "Grade A (Level B1)", color: "text-blue-500" };
};`;

content = content.replace(oldGrade, newGrade);

fs.writeFileSync('src/components/KETCalculator.tsx', content);
console.log('done');
