const fs = require('fs');
let content = fs.readFileSync('src/pages/CourseDetails.tsx', 'utf8');

content = content.replace(
  "title: 'Reading Homework',",
  "title: 'IELTS Reading Homework',"
);
content = content.replace(
  "title: 'Listening Homework',",
  "title: 'IELTS Listening Homework',"
);
content = content.replace(
  "title: 'Writing Homework',",
  "title: 'IELTS Writing Homework',"
);

fs.writeFileSync('src/pages/CourseDetails.tsx', content);
