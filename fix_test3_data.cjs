const fs = require('fs');
let code = fs.readFileSync('src/data/speakingTestData.ts', 'utf8');

const target = `  '3': {
    part1: [
      { id: 'p1_1', topic: 'Placeholder', text: 'Content to be added later.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Content to be added later.',
      bulletPoints: [
        'Content to be added later.'
      ]
    },
    part3: [
      { id: 'p3_1', topic: 'Placeholder', text: 'Content to be added later.' }
    ]
  },`;

const replacement = `  '3': {
    part1: [
      { id: 'p1_1', topic: 'Headphones', text: 'Do you often use headphones?' },
      { id: 'p1_2', topic: 'Headphones', text: 'What do you usually listen to with your headphones?' },
      { id: 'p1_3', topic: 'Headphones', text: 'Do you prefer wireless or wired headphones?' },
      { id: 'p1_4', topic: 'Headphones', text: 'Do you think headphones affect communication with others?' },
      { id: 'p1_5', topic: 'Scenery', text: 'Do you enjoy looking at beautiful scenery?' },
      { id: 'p1_6', topic: 'Scenery', text: 'What kind of scenery do you like the most?' },
      { id: 'p1_7', topic: 'Scenery', text: 'Is there a place with beautiful scenery near where you live?' },
      { id: 'p1_8', topic: 'Scenery', text: 'Do you often take photos of landscapes?' }
    ],
    part2: {
      id: 'p2_1',
      topic: "Describe a rule (at school or at work) that you don't like",
      bulletPoints: [
        'What the rule is',
        'Where you have to follow it',
        'How other people feel about it',
        "and explain why you don't like this rule."
      ]
    },
    part3: [
      { id: 'p3_1', topic: 'Rules and Laws', text: "It's often said that everyone breaks the law at some point in their life. Do you agree or disagree? Why?" },
      { id: 'p3_2', topic: 'Rules and Laws', text: "What would happen if every country in the world had the same set of laws? Do you think that's a good idea? Why or why not?" },
      { id: 'p3_3', topic: 'Rules and Laws', text: "Why do countries have different laws even though some problems are universal?" }
    ]
  },`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/data/speakingTestData.ts', code);
  console.log("Replaced successfully");
} else {
  console.log("Target not found!");
}
