const tests = [];
let idCounter = 1;
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const skills = [
  { name: 'Reading', duration: '60 mins' },
  { name: 'Listening', duration: '60 mins' },
  { name: 'Writing', duration: '60 mins' },
  { name: 'Speaking', duration: '15 mins' }
];

months.forEach((month, mIndex) => {
  skills.forEach(skill => {
    tests.push({
      id: idCounter,
      title: `${month} ${skill.name} Practice (IELTS)`
    });
    idCounter++;
  });
});

console.log(tests.filter(t => t.title.includes('Writing')).slice(0, 7));
