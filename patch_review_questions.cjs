const fs = require('fs');
let code = fs.readFileSync('src/components/SpeakingRecordingsReview.tsx', 'utf8');

const oldQuestions = `const MOCK_QUESTIONS = {
  part1: [
    { id: 'p1_1', text: 'What do you enjoy most about your work?', duration: '0:42' },
    { id: 'p1_2', text: 'Do you prefer working alone or with others?', duration: '0:31' },
    { id: 'p1_3', text: 'Do you think you are a careful reader?', duration: '0:45' }
  ],
  part2: {
    id: 'p2_1',
    text: 'Describe a time when you helped someone. You should say: who you helped, how you helped them, why you helped them, and how you felt about it.',
    duration: '2:04'
  },
  part3: [
    { id: 'p3_1', text: 'Do you think people are less willing to help others these days?', duration: '0:55' },
    { id: 'p3_2', text: 'What kinds of people need help in society?', duration: '1:12' }
  ]
};`;

const newQuestions = `const MOCK_QUESTIONS = {
  part1: [
    { id: 'p1_1', text: 'Did you like going to parks as a child?', duration: '0:30' },
    { id: 'p1_2', text: 'Do you still like going to parks now?', duration: '0:35' },
    { id: 'p1_3', text: 'Would you like to see more parks in your city?', duration: '0:40' },
    { id: 'p1_4', text: 'Are there any parks you want to go to in the future?', duration: '0:35' },
    { id: 'p1_5', text: 'Do you like to keep things tidy?', duration: '0:30' },
    { id: 'p1_6', text: 'Did you use to keep your room tidy when you were a child?', duration: '0:35' },
    { id: 'p1_7', text: 'Have you ever seen old buildings in the city？', duration: '0:40' },
    { id: 'p1_8', text: 'Do you think we should preserve old buildings in cities？', duration: '0:45' },
    { id: 'p1_9', text: 'Do you prefer living in an old building or a modern house？', duration: '0:45' }
  ],
  part2: {
    id: 'p2_1',
    text: 'Describe an environmental protection law. You should say: What is it? How did you first learn about it? Who benefits from it? And explain how you feel about this law?',
    duration: '2:00'
  },
  part3: [
    { id: 'p3_1', text: 'Is there any situation where in people may disobey the law?', duration: '0:55' },
    { id: 'p3_2', text: 'What qualities should a police officer possess?', duration: '1:00' },
    { id: 'p3_3', text: 'How to solve major crimes in the city?', duration: '1:10' },
    { id: 'p3_4', text: 'Should people be penalized when they use mobile phones while driving?', duration: '1:05' }
  ]
};`;

code = code.replace(oldQuestions, newQuestions);
fs.writeFileSync('src/components/SpeakingRecordingsReview.tsx', code);
