const fs = require('fs');
let content = fs.readFileSync('src/pages/CourseDetails.tsx', 'utf8');

content = content.replace(
  "title: 'Speaking Homework 1'",
  "title: 'IELTS Speaking Homework 1'"
);
content = content.replace(
  "title: 'Speaking Homework 2'",
  "title: 'IELTS Speaking Homework 2'"
);
content = content.replace(
  "title: 'Speaking Homework 3'",
  "title: 'IELTS Speaking Homework 3'"
);
content = content.replace(
  "title: 'Speaking Homework'",
  "title: 'IELTS Speaking Homework'"
);

fs.writeFileSync('src/pages/CourseDetails.tsx', content);
