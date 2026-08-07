const fs = require('fs');
let code = fs.readFileSync('src/data/speakingTestData.ts', 'utf8');

const target = `  '4': {
    part1: [
      { id: 'p1_1', topic: 'Placeholder', text: 'Content to be added later.', sampleAnswer: 'Sample answer to be added later.' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Content to be added later.',
      bulletPoints: [
        'Content to be added later.'
      ],
      sampleAnswer: 'Sample answer to be added later.'
    },
    part3: [
      { 
        id: 'p3_1', 
        topic: 'Placeholder', 
        text: 'Content to be added later.',
        sampleAnswer: 'Sample answer to be added later.'
      }
    ]
  },`;

const replacement = `  '4': {
    part1: [
      { id: 'p1_1', topic: 'Team Sports', text: 'Have you ever played a team sport?' },
      { id: 'p1_2', topic: 'Team Sports', text: 'Which team sports are popular in your country?' },
      { id: 'p1_3', topic: 'Team Sports', text: 'Do you prefer team sports or individual sports?' },
      { id: 'p1_4', topic: 'Team Sports', text: 'Did you play team sports at school?' },
      { id: 'p1_5', topic: 'Life Stages', text: 'Which stage of life do you think is the happiest?' },
      { id: 'p1_6', topic: 'Life Stages', text: 'What do children learn that adults often forget?' },
      { id: 'p1_7', topic: 'Life Stages', text: 'Do people become happier as they get older?' },
      { id: 'p1_8', topic: 'Life Stages', text: 'Which life stage do you look forward to?' }
    ],
    part2: {
      id: 'p2_1',
      topic: 'Describe a movie you watched and enjoyed recently.',
      bulletPoints: [
        'when and where you watched it',
        'who you watched it with',
        'what it was about',
        'and explain why you enjoyed this movie.'
      ],
      sampleAnswer: \`One movie I watched and really enjoyed recently was Mưa Đỏ (Red Rain), a Vietnamese war drama. I watched it about two weeks ago at a cinema near my house with two of my close friends after we finished our final exams. We had heard many positive reviews about it, so we decided to watch it together.
The film is based on the famous novel by Chu Lai and was directed by Meritorious Artist Đặng Thái Huyền. It tells the story of the 81-day Battle of the Quảng Trị Citadel during the Vietnam War. Instead of focusing only on the fighting, the movie also portrays the courage, friendship, and sacrifices of young soldiers who fought to protect their country. It includes many emotional scenes that show how war affected both the soldiers and their families.
What I enjoyed most about this movie was how realistic and emotional it was. The battle scenes were incredibly well-produced, with impressive visual effects and sound that made me feel as if I were actually on the battlefield. At the same time, the film wasn't just about action. It also highlighted the human side of war, showing the hopes, fears, and dreams of ordinary young people. Several scenes were so touching that many people in the cinema became emotional.
Another reason I liked the movie is that it taught me more about Vietnamese history. Although I had learned about the Battle of Quảng Trị in school, watching the film helped me understand the sacrifices made by previous generations on a much deeper level. It made me appreciate the peaceful life we enjoy today.
All in all, Mưa Đỏ is one of the most memorable Vietnamese films I've seen recently. It's not only entertaining but also meaningful and educational, so I would definitely recommend it to anyone who is interested in history or inspiring true stories.\`
    },
    part3: [
      { 
        id: 'p3_1', 
        topic: 'Movies and Cinema', 
        text: 'Why do people prefer to watch movies in the cinema?',
        sampleAnswer: \`You know, there's something special about watching a movie in the cinema that you just can't replicate at home. First off, the big screen and the powerful sound system make the whole experience way more immersive. There's also the vibe of the audience; sharing reactions and emotions with a crowd can really amplify the enjoyment. Plus, heading to the cinema can be a fun outing—it's a chance to step out, grab some popcorn, and escape into another world for a few hours.\`
      },
      { 
        id: 'p3_2', 
        topic: 'Movies and Cinema', 
        text: 'Do you think successful movies should have well-known actors or actresses in leading roles?',
        sampleAnswer: \`Not necessarily, but having well-known actors can definitely help. Big names often draw crowds because people look forward to seeing their favorite stars. However, a movie can absolutely succeed without famous actors, especially if it has a strong storyline, good direction, and effective marketing. Sometimes, fresh faces can bring a unique touch to the film, making it stand out even more.\`
      },
      { 
        id: 'p3_3', 
        topic: 'Movies and Cinema', 
        text: 'What are the factors that make a successful movie?',
        sampleAnswer: \`Several factors come into play. A compelling story is crucial; it needs to engage the audience and keep them interested. Strong performances from the cast are also important—they can really make or break a film. Good direction, high production quality, and effective marketing are key too. And let's not forget the soundtrack—it can enhance the film's atmosphere significantly. When all these elements come together, they set the stage for a successful movie.\`
      },
      { 
        id: 'p3_4', 
        topic: 'Movies and Cinema', 
        text: 'What kinds of movies do you think are successful in your country?',
        sampleAnswer: \`In my country, a variety of movie genres tend to do well, but especially those that resonate with the local culture and values. For instance, movies that blend action and comedy often see huge success because they cater to a wide audience. Dramas that touch on relevant social issues also tend to attract a lot of viewers who appreciate deeper storytelling. And of course, romantic comedies always seem to find their audience, providing a light-hearted escape with a feel-good finish.\`
      }
    ]
  },`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/data/speakingTestData.ts', code);
  console.log("Replaced successfully");
} else {
  console.log("Target not found!");
}
