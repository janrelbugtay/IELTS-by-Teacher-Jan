const readingMap = [[0, 82], [13, 100], [20, 120], [25, 133], [28, 140], [30, 150]];
const writingMap = [[0, 82], [12, 100], [18, 120], [23, 133], [27, 140], [30, 150]];
const listeningMap = [[0, 82], [11, 100], [17, 120], [21, 133], [23, 140], [25, 150]];
const speakingMap = [[0, 82], [18, 100], [27, 120], [33, 133], [40, 140], [45, 150]];

function getScore(score, map) {
  for (let i = 0; i < map.length - 1; i++) {
    const [minRaw, minScale] = map[i];
    const [maxRaw, maxScale] = map[i + 1];
    if (score >= minRaw && score <= maxRaw) {
      if (maxRaw === minRaw) return minScale;
      return Math.round(minScale + ((score - minRaw) * (maxScale - minScale)) / (maxRaw - minRaw));
    }
  }
  return 0;
}

console.log("R 23:", getScore(23, readingMap)); // Should be 128
console.log("W 23:", getScore(23, writingMap)); // Should be 133
console.log("L 19:", getScore(19, listeningMap)); // Should be 127
console.log("S 27:", getScore(27, speakingMap)); // Should be 120
