const fs = require('fs');
let data = fs.readFileSync('src/data/septemberReadingData.ts', 'utf8');

const answers = {
  1: "ii", 2: "viii", 3: "v", 4: "i", 5: "iii", 6: "ix",
  7: "Irish moss", 8: "agar", 9: "seameal", 10: "cough mixtures",
  11: "B", 12: "C", 13: "A",
  14: "A", 15: "B", 16: "C", 17: "D", 18: "E", 19: "F", 20: "G",
  21: "A", 22: "B", 23: "C",
  24: "NOT GIVEN", 25: "NOT GIVEN", 26: "FALSE",
  27: "YES", 28: "NO", 29: "NOT GIVEN", 30: "YES", 31: "NO", 32: "NOT GIVEN",
  33: "A", 34: "B", 35: "C", 36: "D", 37: "A",
  38: "B", 39: "C", 40: "D",
};

data = data.replace(
  'export const septemberAnswers: Record<number, string> = {};',
  'export const septemberAnswers: Record<number, string> = ' + JSON.stringify(answers, null, 2) + ';'
);

fs.writeFileSync('src/data/septemberReadingData.ts', data);
