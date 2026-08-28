const fs = require('fs');

let content = fs.readFileSync('src/data/test17ReadingData.ts', 'utf8');

// Replace Q1-4 type
content = content.replace(
  /type:\s*"true_false_not_given"/,
  'type: "choice"'
);

// Replace Q5-8 type
content = content.replace(
  /type:\s*"short_answer"/,
  'type: "input"'
);

// Replace Q9-13 block entirely
const oldQ9_13 = /\{\s*title:\s*"Questions 9-13"[\s\S]*?\}\s*\]\s*\}/;

const newQ9_13 = `{
        title: "Questions 9-13",
        instruction: "Complete the following summary of the paragraphs of Reading Passage.\\nUsing NO MORE THAN TWO WORDS from the Reading Passage for each answer.\\nWrite your answers in boxes 9-13 on your answer sheet.",
        text: "Besides normal transport task, changes are also implemented to the trailers in these workshops at the request of the buyers when it was used on a medical emergency or a moveable {9}. ‘Ambulance’ is made from metal, with rubber wheels and drive-by another bicycle. When put with {10} in the two-wheeled ‘ambulance’, the patient can stay comfortable and which another {11} can sit on caring for the patient in transport journey. In order to dismantle or attach other equipment, and assembling {12} is designed. Later, as users suggest, {13} has also been added to give protection to the patient.",
        type: "summary-input",
        questions: [
          { id: 9, text: "Question 9" },
          { id: 10, text: "Question 10" },
          { id: 11, text: "Question 11" },
          { id: 12, text: "Question 12" },
          { id: 13, text: "Question 13" }
        ]
      }`;

content = content.replace(oldQ9_13, newQ9_13);

fs.writeFileSync('src/data/test17ReadingData.ts', content);
console.log('patched format');
