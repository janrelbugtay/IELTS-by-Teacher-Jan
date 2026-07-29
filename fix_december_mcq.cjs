const fs = require('fs');
let code = fs.readFileSync('src/data/decemberReadingData.ts', 'utf8');

const replacement = `      {
        type: "mcq",
        instruction: "Choose the correct letter, A, B, C or D.",
        title: "Questions 24-26",
        startQuestion: 24,
        endQuestion: 26,
        questions: [
          {
            id: 24,
            text: "What point does the writer make about primary schools in India in the sixth paragraph?",
            options: [
              "A Exposure to English outside of school is of limited benefit.",
              "B Children learn English more easily when they are well motivated.",
              "C Poor children may be disadvantaged further by being instructed in English.",
              "D There is little consistency across schools with regard to instruction in English."
            ]
          },
          {
            id: 25,
            text: "What is Tsimpli suggesting when she uses the phrase 'that ship has sailed'?",
            options: [
              "A The findings of the report may be of little help to some Indian schoolchildren.",
              "B Instruction in English could be better adapted to the needs of schoolchildren.",
              "C Schools have had limited success in teaching English as a separate subject.",
              "D It is too late to remove English completely as a language of instruction in schools."
            ]
          },
          {
            id: 26,
            text: "In the eighth paragraph, what do we learn has surprised researchers?",
            options: [
              "A Boys and girls from low socio-economic groups have similar general intelligence levels.",
              "B The age at which children move into a slum does not affect their academic performance.",
              "C Slum children and children from other urban poor backgrounds have similar life experiences.",
              "D The literacy and numeracy skills of slum children are not lower than those of children from other urban poor backgrounds."
            ]
          }
        ]
      }`;

code = code.replace(/\{\s*type:\s*"mcq"[\s\S]*?id:\s*26,\s*text:\s*"In the eighth paragraph[\s\S]*?\}\s*\]\s*\}/, replacement);
fs.writeFileSync('src/data/decemberReadingData.ts', code);
