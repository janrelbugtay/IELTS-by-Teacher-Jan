const fs = require('fs');
let code = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');

const oldQuestions = `const MOCK_QUESTIONS = {
  part1: [
    { id: 'p1_1', topic: 'Studies', text: 'What do you enjoy most about your work or studies?' },
    { id: 'p1_2', topic: 'Studies', text: 'Do you prefer working or studying alone or with other people?' },
    { id: 'p1_3', topic: 'Studies', text: 'Have your work or study habits changed over the past few years?' },
    { id: 'p1_4', topic: 'Careful Reading', text: 'Do you think you are a careful reader?' },
    { id: 'p1_5', topic: 'Careful Reading', text: 'What kinds of things do you usually read?' },
    { id: 'p1_6', topic: 'Careful Reading', text: 'Do you read instructions carefully before doing something?' },
    { id: 'p1_7', topic: 'Pets', text: 'Do you have any pets?' },
    { id: 'p1_8', topic: 'Pets', text: 'Did you have a pet when you were a child?' },
    { id: 'p1_9', topic: 'Pets', text: 'What kind of pet would you like to have in the future?' }
  ],
  part2: {
    id: 'p2_1',
    topic: 'Describe a program or app on your computer or phone.',
    bulletPoints: [
      'What it is',
      'How often you use it',
      'When/how you use it',
      'When/how you found it',
      'And explain how you feel about it'
    ]
  },
  part3: [
    { id: 'p3_1', topic: 'Apps & Technology', text: 'What are the differences between old and young people when using apps?' },
    { id: 'p3_2', topic: 'Apps & Technology', text: 'What apps are popular in your country?' },
    { id: 'p3_3', topic: 'Apps & Technology', text: 'Should parents limit their children’s use of computer programs and computer games? Why and how?' }
  ]
};`;

const newQuestions = `const MOCK_QUESTIONS = {
  part1: [
    { id: 'p1_1', topic: 'Public gardens and parks', text: 'Did you like going to parks as a child?' },
    { id: 'p1_2', topic: 'Public gardens and parks', text: 'Do you still like going to parks now?' },
    { id: 'p1_3', topic: 'Public gardens and parks', text: 'Would you like to see more parks in your city?' },
    { id: 'p1_4', topic: 'Public gardens and parks', text: 'Are there any parks you want to go to in the future?' },
    { id: 'p1_5', topic: 'Tidying up', text: 'Do you like to keep things tidy?' },
    { id: 'p1_6', topic: 'Tidying up', text: 'Did you use to keep your room tidy when you were a child?' },
    { id: 'p1_7', topic: 'Old buildings', text: 'Have you ever seen old buildings in the city？' },
    { id: 'p1_8', topic: 'Old buildings', text: 'Do you think we should preserve old buildings in cities？' },
    { id: 'p1_9', topic: 'Old buildings', text: 'Do you prefer living in an old building or a modern house？' }
  ],
  part2: {
    id: 'p2_1',
    topic: 'Describe an environmental protection law.',
    bulletPoints: [
      'What is it?',
      'How did you first learn about it?',
      'Who benefits from it?',
      'And explain how you feel about this law?'
    ]
  },
  part3: [
    { id: 'p3_1', topic: 'Law', text: 'Is there any situation where in people may disobey the law?' },
    { id: 'p3_2', topic: 'Law', text: 'What qualities should a police officer possess?' },
    { id: 'p3_3', topic: 'Law', text: 'How to solve major crimes in the city?' },
    { id: 'p3_4', topic: 'Law', text: 'Should people be penalized when they use mobile phones while driving?' }
  ]
};`;

code = code.replace(oldQuestions, newQuestions);
fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', code);
