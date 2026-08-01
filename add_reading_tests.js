const fs = require('fs');

const path = 'src/pages/PracticeTests.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes("for (let i = 13; i <= 15; i++)")) {
    const splitPoint = "return tests;";
    const addition = `
  if (courseName === 'IELTS') {
    let readingIds = [49, 53, 57];
    for (let i = 13; i <= 15; i++) {
        tests.push({
            id: readingIds[i - 13] as any,
            title: \`IELTS Reading Test \${i}\`,
            skill: 'Reading',
            month: 'Extra', // We can just put empty or 'Extra'
            attempts: randomAttempts(readingIds[i - 13]),
            difficulty: getDifficulty(readingIds[i - 13]),
            duration: '60 mins',
            image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
            createdAt: new Date(2026, 11 + i, 1).getTime(),
        });
    }
  }

  `;
    
    content = content.replace(splitPoint, addition + splitPoint);
    fs.writeFileSync(path, content);
}
