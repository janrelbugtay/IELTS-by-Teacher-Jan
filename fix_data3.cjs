const fs = require('fs');
let code = fs.readFileSync('src/data/speakingTestData.ts', 'utf8');

const target = `    part2: {
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
    ]`;

const replacement = `    part2: {
      id: 'p2_1',
      topic: "Describe a rule (at school or at work) that you don't like",
      bulletPoints: [
        'What the rule is',
        'Where you have to follow it',
        'How other people feel about it',
        "and explain why you don't like this rule."
      ],
      sampleAnswer: \`One school rule that I don't really like is that students are not allowed to use their mobile phones in the classroom. As soon as we enter the classroom, we have to keep our phones in our bags and are not allowed to take them out unless the teacher gives us permission.
I have to follow this rule at my secondary school in Vietnam. The school introduced it to help students concentrate on their lessons instead of scrolling through social media or playing games. If a student is caught using a phone without permission, the teacher may take it away until the end of the school day or even ask the student's parents to come to school.
Most of my classmates have mixed feelings about this rule. Some of them think it is reasonable because phones can be very distracting, especially during lessons. However, many students, including me, feel that the rule is a little too strict. Nowadays, smartphones are not only used for entertainment but also for learning. We often use them to look up new vocabulary, search for information, or use educational apps.
The main reason I don't like this rule is that it doesn't allow any flexibility. I believe students should be allowed to use their phones when there is a genuine educational purpose or in an emergency. For example, if we are doing a research project or need to use an online dictionary in English class, using a phone can actually make learning more effective. In addition, there may be situations where students need to contact their parents urgently.
I understand why the school has this rule because it helps reduce distractions and improves classroom discipline. However, I think a more flexible policy would be much better. Instead of banning phones completely, teachers could allow students to use them only when they are related to the lesson. In my opinion, this would help students become more responsible while still making good use of technology in their education.\`
    },
    part3: [
      { 
        id: 'p3_1', 
        topic: 'Rules and Laws', 
        text: "It's often said that everyone breaks the law at some point in their life. Do you agree or disagree? Why?",
        sampleAnswer: \`Point : Hmm, to be honest, I do agree with that idea to some extent.
Explain : You know, many people unintentionally break minor laws in their everyday life—things like jaywalking or downloading copyrighted content without thinking twice. It's not always out of bad intentions, but rather habit or convenience.
Example : Like, in my country, crossing the street when the light is still red—especially if there's no traffic—is super common. Technically it's illegal, but honestly, people don't see it as a big deal.
Link : So yeah, even if most people are law-abiding overall, I'd say almost everyone has broken a small rule at some point.\`
      },
      { 
        id: 'p3_2', 
        topic: 'Rules and Laws', 
        text: "What would happen if every country in the world had the same set of laws? Do you think that's a good idea? Why or why not?",
        sampleAnswer: \`Point : Well, honestly, I don't think having one global law system would work very well.
Explain : The thing is, each country has its own cultural values and traditions, so trying to apply the same set of laws everywhere can create a lot of problems. What's acceptable in one society might be completely taboo in another.
Example : For example, freedom of speech is a basic right in some countries, but in others, there are strict limits. So yeah, one-size-fits-all just doesn't really make sense.
Link : Overall, I believe laws should reflect local norms and situations, not be forced globally.\`
      },
      { 
        id: 'p3_3', 
        topic: 'Rules and Laws', 
        text: "Why do countries have different laws even though some problems are universal?",
        sampleAnswer: \`Point : Well, that's a really interesting question. I guess it's because every country deals with issues differently based on their history, politics, and culture.
Explain : Even if problems like theft or corruption exist everywhere, the way governments handle them can vary a lot. That's mostly due to legal traditions and what each society considers acceptable or unacceptable.
Example : Take drug laws for instance—some countries have super strict rules, while others are much more relaxed. It all depends on their values and approach to crime .
Link : So yeah, even when the problems are the same, the legal solutions don't always match.\`
      }
    ]`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/data/speakingTestData.ts', code);
  console.log("Replaced successfully");
} else {
  console.log("Target not found!");
}
