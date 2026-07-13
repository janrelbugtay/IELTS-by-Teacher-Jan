const fs = require('fs');
let code = fs.readFileSync('src/pages/JanuaryListeningTest.tsx', 'utf8');

const target = `export const LISTENING_ANSWER_KEY: Record<number, string> = {
    1: 'ELSINORE', 2: '077896245', 3: 'WAITER', 4: 'BASEBALL', 5: 'BEACH',
    6: 'DIVING', 7: 'OCTOBER', 8: 'SATURDAY', 9: '6', 10: 'RADIO',
    11: 'B', 12: 'E', 13: 'F', 14: 'I', 15: 'C',
    16: 'C', 17: 'A', 18: 'B', 19: 'A', 20: 'A',
    21: 'B', 22: 'E', 23: 'C', 24: 'G', 25: 'F',
    26: 'B', 27: 'C', 28: 'A', 29: 'C', 30: 'C',
    31: 'NETS', 32: 'SMILE', 33: 'RATS', 34: 'AWARE', 35: 'INSTINCTIVE',
    36: 'WALKING', 37: 'NEWSPAPER', 38: 'SOCIAL', 39: 'WHISTLE', 40: 'FIGHT'
};`;

const replacement = `export const LISTENING_ANSWER_KEY: Record<number, string> = {
    1: '10/TEN', 2: 'WEATHER', 3: 'SAFETY', 4: 'DISCOUNT', 5: 'DICTIONARY',
    6: 'CERTIFICATE', 7: 'TOWEL', 8: 'CAFÉ/CAFE', 9: 'VIDEOS', 10: 'LOCKERS',
    11: 'A', 12: 'B', 13: 'A', 14: 'A', 15: 'A',
    16: 'C', 17: 'C', 18: 'A', 19: 'B', 20: 'C',
    21: 'B/D', 22: 'B/D', 23: 'C/E', 24: 'C/E', 25: 'G',
    26: 'B', 27: 'F', 28: 'H', 29: 'A', 30: 'E',
    31: 'METAL/METALS', 32: 'SLOW', 33: 'DEMAND', 34: 'EQUATOR', 35: 'RECYCLE',
    36: 'FUNGUS', 37: 'WEATHER', 38: 'STRONG', 39: 'ROOTS', 40: 'SOIL'
};`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/JanuaryListeningTest.tsx', code);
