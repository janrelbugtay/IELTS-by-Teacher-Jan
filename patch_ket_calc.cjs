const fs = require('fs');
let content = fs.readFileSync('src/components/KETCalculator.tsx', 'utf8');

// Replace MIN_POINTS and MAX_POINTS
content = content.replace(
  "const MIN_POINTS = { reading: 5, writing: 10, listening: 5, speaking: 7 };",
  "const MIN_POINTS = { reading: 5, writing: 5, listening: 5, speaking: 9 };"
);
content = content.replace(
  "const MAX_POINTS = { reading: 32, writing: 40, listening: 25, speaking: 30 };",
  "const MAX_POINTS = { reading: 30, writing: 30, listening: 25, speaking: 45 };"
);

// Replace CONVERSION_MAPS
const oldMaps = `const CONVERSION_MAPS = {
  reading: [[0, 82], [5, 102], [13, 120], [23, 140], [29, 160], [32, 170]],
  writing: [[0, 82], [10, 102], [16, 120], [24, 140], [34, 160], [40, 170]],
  listening: [[0, 82], [5, 102], [11, 120], [18, 140], [23, 160], [25, 170]],
  speaking: [[0, 82], [7, 102], [12, 120], [18, 140], [24, 160], [30, 170]]
};`;

const newMaps = `const CONVERSION_MAPS = {
  reading: [[0, 82], [10, 100], [14, 120], [20, 133], [25, 140], [30, 150]],
  writing: [[0, 82], [10, 100], [14, 120], [20, 133], [25, 140], [30, 150]],
  listening: [[0, 82], [9, 100], [12, 120], [17, 133], [21, 140], [25, 150]],
  speaking: [[0, 82], [14, 100], [18, 120], [27, 133], [36, 140], [45, 150]]
};`;

content = content.replace(oldMaps, newMaps);

fs.writeFileSync('src/components/KETCalculator.tsx', content);
console.log("Patched MIN/MAX/CONVERSION");
