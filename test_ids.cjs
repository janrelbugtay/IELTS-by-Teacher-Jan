const fs = require('fs');

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const skills = [
  { name: 'Reading', duration: '60 mins' },
  { name: 'Listening', duration: '60 mins' },
  { name: 'Writing', duration: '60 mins' },
  { name: 'Speaking', duration: '15 mins' },
];

let idCounter = 1;
const tests = [];

months.forEach((month, mIndex) => {
  skills.forEach(skill => {
    tests.push({
      id: idCounter,
      title: `IELTS ${skill.name} Test ${mIndex + 1}`,
      skill: skill.name,
      month: month,
    });
    idCounter++;
  });
});

console.log(tests.filter(t => t.skill === 'Reading').slice(0, 8));
