const fs = require('fs');
let code = fs.readFileSync('src/data/decemberReadingData.ts', 'utf8');

const passage2 = `{
    id: 2,
    title: "How could multilingualism benefit India's poorest schoolchildren?",
    subtitle: "READING PASSAGE 2",
    content: [
      "The crowded and bustling streets of Delhi teem with life. Stop to listen and, above the din of rickshaws and buses, you'll hear a multitude of languages, as more than 20 million people go about their daily lives. Many were born and raised here, and many millions more have recently made India's capital their home, having moved from surrounding neighbourhoods, cities and states or across the country, often in the hope of gaining better jobs and a better life. Some arrive speaking fluent Hindi, the dominant language in Delhi (and the official language of government), but many arrive speaking any number of India's 22 officially recognised languages, let alone the hundreds of regional languages in a country of more than 1.3 billion people.",
      "A team of researchers led by Professor Ianthi Tsimpli of Cambridge University is currently working on a project collecting data on 1,000 primary-age children in Delhi and the cities of Hyderabad and Bihar. The overriding aim of the four-year project, called 'Multilingualism and Multiliteracy', is to find out why in a country where multilingualism is so common (more than 255 million people in India speak at least two languages, and nearly 90 million speak three or more languages), the many benefits of speaking more than one language, observed in schools in Europe for instance, do not apply to many of India's schoolchildren.",
      "'Each year across India, 600,000 children are tested, and year after year over 50% of children in Standard 5 [ten-year-olds] cannot read a Standard 2 [seven-year-olds] task fluently, and just under 50% of them cannot solve a Standard 2 subtraction task,' says Tsimpli. She explains that low educational achievement can lead to many of these students dropping out of school – a problem disproportionately affecting female students.",
      "Tsimpli and her colleagues are investigating whether these low learning outcomes could be caused by an Indian school system where the language that children are taught in often differs from the language used at home. The research project, which focuses on 8 to 11-year-old schoolchildren in rural and urban areas, collects data on whether the schoolchildren live in slum* or non-slum areas. Many of the children have moved from remote, rural areas to urban areas. They are so poor they have to live in slums and, as a result of migration, they may speak languages that are different from the regional language.",
      "Having already tested 1,000 children, the researchers will now embark on retesting them. They intend to look not only at test results, but also at variables such as the standard of schooling, the environment and the teaching practices themselves. It's possible that one of the causes of low performance is the lack of pupil-centred teaching methods; in many Indian primary schools the teacher dominates and there is little room for independent learning.",
      "Although the findings are at a preliminary stage, Tsimpli and her team have found that the medium of instruction used in schools, especially English, may hold back those children who have little familiarity with, or exposure to, the language before starting school and outside of school life. According to Tsimpli, most of the evidence from this and other projects shows that English instruction for children from low socio-economic areas might not be the best way for them to learn, at least in the first three years of primary education.",
      "'What we would recommend for everyone, not just low socio-economic status children, would be to start learning in the language they feel comfortable learning in ... English can still be used, but perhaps not as the medium of instruction in primary schools. It could, for example, be one of the subjects that are being taught alongside other subjects. We are not suggesting that English be withdrawn – that ship has sailed – but we perhaps have to think more about learner needs. There is perhaps too much uniformity in teaching and less tailoring to the children's language abilities and needs,' says Tsimpli.",
      "While the preliminary results show there is no difference in general intelligence among boys and girls from slum areas versus those from urban poor backgrounds, an unanticipated finding has been that children from slum backgrounds do not seem to lag behind children from other urban poor backgrounds – and in some cases outperform them (e.g. in numeracy and literacy tasks). According to the researchers, this unexpected finding may be down to the life experiences of children growing up in slums. They are likely to mature faster and come into closer contact with the numeracy skills essential for day-to-day survival.",
      "The project has already caught the attention of government ministers, who are keen to use the findings of the study to inform and adjust school policy in Delhi and the wider state. 'They are as keen as us to understand how the challenging context of deprivation can be attenuated when focusing on the languages children learn and use while at school. Our findings don't mean you\\'re doomed if you\\'re poor. It may be that these low learning outcomes are because of the way education is provided in India, with a huge focus on Hindi and English as the mediums of instruction, to the potential detriment of children unfamiliar with those languages,' explains Tsimpli.",
      "'Language is central to the way knowledge is transferred – so the medium of instruction is obviously hugely influential. We hope to ... show that problem solving, numeracy and literacy can and do improve in children who are educated in a language of instruction they know. The trick may be to bridge school skills with life skills and make use of the richness of a child\\'s life experience to help them learn in the most effective ways possible,' says Tsimpli."
    ],
    questionBlocks: [
      {
        type: "summary-options",
        instruction: "Complete the summary using the list of words, A-J, below.",
        title: "Questions 14-19\\nMultilingualism in Delhi",
        startQuestion: 14,
        endQuestion: 19,
        options: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
        optionsList: [
          { letter: 'A', text: 'basic outlook' },
          { letter: 'B', text: 'employment opportunities' },
          { letter: 'C', text: 'wealthy visitors' },
          { letter: 'D', text: 'distant country' },
          { letter: 'E', text: 'primary objective' },
          { letter: 'F', text: 'similar advantages' },
          { letter: 'G', text: 'thriving economy' },
          { letter: 'H', text: 'nearby district' },
          { letter: 'I', text: 'dense population' },
          { letter: 'J', text: 'new immigrants' }
        ],
        text: "The city of Delhi has a 14 _______ and as you walk through its streets you hear people speaking a variety of languages. Some of them have spent their entire life in Delhi, while others are 15 _______. Whether they have come from a 16 _______ or have travelled from the other side of India, they have all come in search of things such as improved 17 _______.\\n\\nA team of researchers led by Professor Ianthi Tsimpli of Cambridge University is collecting data on primary-age schoolchildren in Delhi and other Indian cities. The 18 _______ of the research is to discover why multilingual Indian schoolchildren do not experience 19 _______ to those that multilingual schoolchildren in Europe experience."
      },
      {
        type: "choice",
        options: ["YES", "NO", "NOT GIVEN"],
        instruction: "Do the following statements agree with the claims of the writer in Reading Passage 2?",
        title: "Questions 20-23",
        startQuestion: 20,
        endQuestion: 23,
        questions: [
          { id: 20, text: "Ten-year-old Indian schoolchildren tend to perform better in literacy tests than in numeracy tests." },
          { id: 21, text: "Tsimpli had problems convincing some female students to take part in the study." },
          { id: 22, text: "Tsimpli and her team wanted to know if there is a connection between poor academic performance and being taught in an unfamiliar language." },
          { id: 23, text: "The researchers have decided against investigating the impact teaching methodology may have on learning outcomes." }
        ]
      },
      {
        type: "mcq",
        instruction: "Choose the correct letter, A, B, C or D.",
        title: "Questions 24-26",
        startQuestion: 24,
        endQuestion: 26,
        questions: [
          {
            id: 24,
            text: "What point does the writer make about primary schools in India in the sixth paragraph?\\nA Exposure to English outside of school is of limited benefit.\\nB Children learn English more easily when they are well motivated.\\nC Poor children may be disadvantaged further by being instructed in English.\\nD There is little consistency across schools with regard to instruction in English."
          },
          {
            id: 25,
            text: "What is Tsimpli suggesting when she uses the phrase 'that ship has sailed'?\\nA The findings of the report may be of little help to some Indian schoolchildren.\\nB Instruction in English could be better adapted to the needs of schoolchildren.\\nC Schools have had limited success in teaching English as a separate subject.\\nD It is too late to remove English completely as a language of instruction in schools."
          },
          {
            id: 26,
            text: "In the eighth paragraph, what do we learn has surprised researchers?\\nA Boys and girls from low socio-economic groups have similar general intelligence levels.\\nB The age at which children move into a slum does not affect their academic performance.\\nC Slum children and children from other urban poor backgrounds have similar life experiences.\\nD The literacy and numeracy skills of slum children are not lower than those of children from other urban poor backgrounds."
          }
        ]
      }
    ]
  }`;

code = code.replace(/\{\s*id:\s*2,\s*title:\s*"December Reading Passage 2"[\s\S]*?questionBlocks:\s*\[\]\s*\}/, passage2);

const newAnswers = `,
  "14": "I",
  "15": "J",
  "16": "H",
  "17": "B",
  "18": "E",
  "19": "F",
  "20": "NO",
  "21": "NOT GIVEN",
  "22": "YES",
  "23": "NO",
  "24": "C",
  "25": "D",
  "26": "D"`;

code = code.replace(/"13": "price"\s*\}/, '"13": "price"' + newAnswers + '\n};');

const newExplanations = `,
  "14": {
    passageId: 2,
    highlights: ["The crowded and bustling streets of Delhi teem with life.", "more than 20 million people go about their daily lives."],
    explanation: "The passage states that Delhi teems with life and has more than 20 million people, which corresponds to having a 'dense population' (I)."
  },
  "15": {
    passageId: 2,
    highlights: ["Many were born and raised here, and many millions more have recently made India's capital their home"],
    explanation: "The passage contrasts those born there with those who 'recently made India's capital their home', meaning they are 'new immigrants' (J)."
  },
  "16": {
    passageId: 2,
    highlights: ["having moved from surrounding neighbourhoods, cities and states or across the country"],
    explanation: "They moved from 'surrounding neighbourhoods', which matches 'nearby district' (H), or across the country."
  },
  "17": {
    passageId: 2,
    highlights: ["often in the hope of gaining better jobs and a better life."],
    explanation: "They came in search of 'better jobs', which translates to 'employment opportunities' (B)."
  },
  "18": {
    passageId: 2,
    highlights: ["The overriding aim of the four-year project... is to find out why"],
    explanation: "The 'overriding aim' means the 'primary objective' (E) of the research."
  },
  "19": {
    passageId: 2,
    highlights: ["the many benefits of speaking more than one language, observed in schools in Europe for instance, do not apply to many of India's schoolchildren."],
    explanation: "The text says the 'benefits' observed in Europe do not apply to Indian children, meaning they do not experience 'similar advantages' (F)."
  },
  "20": {
    passageId: 2,
    highlights: ["over 50% of children in Standard 5 [ten-year-olds] cannot read a Standard 2 [seven-year-olds] task fluently, and just under 50% of them cannot solve a Standard 2 subtraction task"],
    explanation: "More children fail the literacy task (over 50%) than the numeracy task (just under 50%), meaning they tend to perform worse in literacy than in numeracy, making the statement NO."
  },
  "21": {
    passageId: 2,
    highlights: [],
    explanation: "The passage mentions that dropping out is a problem disproportionately affecting female students, but it does not mention Tsimpli having problems convincing female students to take part. Therefore it is NOT GIVEN."
  },
  "22": {
    passageId: 2,
    highlights: ["Tsimpli and her colleagues are investigating whether these low learning outcomes could be caused by an Indian school system where the language that children are taught in often differs from the language used at home."],
    explanation: "This matches the statement perfectly: they wanted to know if poor performance is connected to being taught in an unfamiliar language (YES)."
  },
  "23": {
    passageId: 2,
    highlights: ["They intend to look not only at test results, but also at variables such as the standard of schooling, the environment and the teaching practices themselves."],
    explanation: "The text says they intend to look at teaching practices, which means they are investigating it, not deciding against it. So the statement is NO."
  },
  "24": {
    passageId: 2,
    highlights: ["English instruction for children from low socio-economic areas might not be the best way for them to learn, at least in the first three years of primary education."],
    explanation: "The passage suggests that instruction in English holds back children from low socio-economic areas (poor children), putting them at a disadvantage (C)."
  },
  "25": {
    passageId: 2,
    highlights: ["We are not suggesting that English be withdrawn – that ship has sailed"],
    explanation: "The phrase 'that ship has sailed' is an idiom meaning that it's too late to change something, in this case, removing English completely as a language of instruction (D)."
  },
  "26": {
    passageId: 2,
    highlights: ["an unanticipated finding has been that children from slum backgrounds do not seem to lag behind children from other urban poor backgrounds – and in some cases outperform them (e.g. in numeracy and literacy tasks)."],
    explanation: "The 'unanticipated' (surprising) finding is that literacy and numeracy skills of slum children are not lower than (do not lag behind) those of other urban poor backgrounds (D)."
  }`;

code = code.replace(/"13": \{[\s\S]*?\}\s*\}/, function(match) {
  return match + newExplanations + '\n};';
});

fs.writeFileSync('src/data/decemberReadingData.ts', code);
console.log("Patched passage 2");
