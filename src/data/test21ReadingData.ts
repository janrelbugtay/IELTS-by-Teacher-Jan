export const test21Passages = [
  {
    id: 1,
    title: "READING PASSAGE 1",
    subtitle: "Passage 1",
    content: [
      "You should spend about 20 minutes on Questions 1–13, which are based on Reading Passage 1 below.",
      "Reading Passage 1 content will be added here.",
      "Paragraph A: Content to be added.",
      "Paragraph B: Content to be added.",
      "Paragraph C: Content to be added.",
      "Paragraph D: Content to be added."
    ],
    questionBlocks: [
      {
        title: "Questions 1-7",
        instruction: "Do the following statements agree with the information given in Reading Passage 1?\nIn boxes 1–7 on your answer sheet, write:\nTRUE if the statement agrees with the information\nFALSE if the statement contradicts the information\nNOT GIVEN if there is no information on this",
        type: "choice",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        questions: [
          { id: 1, text: "Question 1" },
          { id: 2, text: "Question 2" },
          { id: 3, text: "Question 3" },
          { id: 4, text: "Question 4" },
          { id: 5, text: "Question 5" },
          { id: 6, text: "Question 6" },
          { id: 7, text: "Question 7" }
        ]
      },
      {
        title: "Questions 8-13",
        instruction: "Complete the notes below.\nChoose ONE WORD ONLY from the passage for each answer.",
        type: "input",
        questions: [
          { id: 8, text: "Question 8: _____" },
          { id: 9, text: "Question 9: _____" },
          { id: 10, text: "Question 10: _____" },
          { id: 11, text: "Question 11: _____" },
          { id: 12, text: "Question 12: _____" },
          { id: 13, text: "Question 13: _____" }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "READING PASSAGE 2",
    subtitle: "Passage 2",
    content: [
      "You should spend about 20 minutes on Questions 14–26, which are based on Reading Passage 2 below.",
      "Reading Passage 2 content will be added here.",
      "Paragraph A: Content to be added.",
      "Paragraph B: Content to be added.",
      "Paragraph C: Content to be added.",
      "Paragraph D: Content to be added.",
      "Paragraph E: Content to be added."
    ],
    questionBlocks: [
      {
        title: "Questions 14-19",
        instruction: "Reading Passage 2 has paragraphs, A–E.\nChoose the correct heading for each paragraph from the list of headings below.",
        type: "matching",
        options: ["i", "ii", "iii", "iv", "v", "vi", "vii"],
        list: [
          "i Heading i",
          "ii Heading ii",
          "iii Heading iii",
          "iv Heading iv",
          "v Heading v",
          "vi Heading vi",
          "vii Heading vii"
        ],
        questions: [
          { id: 14, text: "Paragraph A" },
          { id: 15, text: "Paragraph B" },
          { id: 16, text: "Paragraph C" },
          { id: 17, text: "Paragraph D" },
          { id: 18, text: "Paragraph E" },
          { id: 19, text: "Paragraph F" }
        ]
      },
      {
        title: "Questions 20-26",
        instruction: "Complete the sentences below.\nChoose NO MORE THAN TWO WORDS from the passage for each answer.",
        type: "input",
        questions: [
          { id: 20, text: "Question 20: _____" },
          { id: 21, text: "Question 21: _____" },
          { id: 22, text: "Question 22: _____" },
          { id: 23, text: "Question 23: _____" },
          { id: 24, text: "Question 24: _____" },
          { id: 25, text: "Question 25: _____" },
          { id: 26, text: "Question 26: _____" }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "READING PASSAGE 3",
    subtitle: "Passage 3",
    content: [
      "You should spend about 20 minutes on Questions 27–40, which are based on Reading Passage 3 below.",
      "Reading Passage 3 content will be added here.",
      "Section A: Content to be added.",
      "Section B: Content to be added.",
      "Section C: Content to be added.",
      "Section D: Content to be added."
    ],
    questionBlocks: [
      {
        title: "Questions 27-32",
        instruction: "Do the following statements agree with the claims of the writer in Reading Passage 3?\nIn boxes 27–32 on your answer sheet, write:\nYES if the statement agrees with the claims of the writer\nNO if the statement contradicts the claims of the writer\nNOT GIVEN if it is impossible to say what the writer thinks about this",
        type: "choice",
        options: ["YES", "NO", "NOT GIVEN"],
        questions: [
          { id: 27, text: "Question 27" },
          { id: 28, text: "Question 28" },
          { id: 29, text: "Question 29" },
          { id: 30, text: "Question 30" },
          { id: 31, text: "Question 31" },
          { id: 32, text: "Question 32" }
        ]
      },
      {
        title: "Questions 33-36",
        instruction: "Choose the correct letter, A, B, C or D.",
        type: "choice",
        options: ["A", "B", "C", "D"],
        questions: [
          { id: 33, text: "Question 33" },
          { id: 34, text: "Question 34" },
          { id: 35, text: "Question 35" },
          { id: 36, text: "Question 36" }
        ]
      },
      {
        title: "Questions 37-40",
        instruction: "Complete the summary below.\nChoose NO MORE THAN TWO WORDS from the passage for each answer.",
        type: "input",
        questions: [
          { id: 37, text: "Question 37: _____" },
          { id: 38, text: "Question 38: _____" },
          { id: 39, text: "Question 39: _____" },
          { id: 40, text: "Question 40: _____" }
        ]
      }
    ]
  }
];

export const test21Answers: Record<number, string> = {
  1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "", 8: "", 9: "", 10: "",
  11: "", 12: "", 13: "", 14: "", 15: "", 16: "", 17: "", 18: "", 19: "", 20: "",
  21: "", 22: "", 23: "", 24: "", 25: "", 26: "", 27: "", 28: "", 29: "", 30: "",
  31: "", 32: "", 33: "", 34: "", 35: "", 36: "", 37: "", 38: "", 39: "", 40: ""
};

export const test21Explanations: Record<number, any> = {
  1: { passageId: 1, highlights: [], explanation: "Content to be added." },
  2: { passageId: 1, highlights: [], explanation: "Content to be added." },
  3: { passageId: 1, highlights: [], explanation: "Content to be added." },
  4: { passageId: 1, highlights: [], explanation: "Content to be added." },
  5: { passageId: 1, highlights: [], explanation: "Content to be added." },
  6: { passageId: 1, highlights: [], explanation: "Content to be added." },
  7: { passageId: 1, highlights: [], explanation: "Content to be added." },
  8: { passageId: 1, highlights: [], explanation: "Content to be added." },
  9: { passageId: 1, highlights: [], explanation: "Content to be added." },
  10: { passageId: 1, highlights: [], explanation: "Content to be added." },
  11: { passageId: 1, highlights: [], explanation: "Content to be added." },
  12: { passageId: 1, highlights: [], explanation: "Content to be added." },
  13: { passageId: 1, highlights: [], explanation: "Content to be added." },
  14: { passageId: 2, highlights: [], explanation: "Content to be added." },
  15: { passageId: 2, highlights: [], explanation: "Content to be added." },
  16: { passageId: 2, highlights: [], explanation: "Content to be added." },
  17: { passageId: 2, highlights: [], explanation: "Content to be added." },
  18: { passageId: 2, highlights: [], explanation: "Content to be added." },
  19: { passageId: 2, highlights: [], explanation: "Content to be added." },
  20: { passageId: 2, highlights: [], explanation: "Content to be added." },
  21: { passageId: 2, highlights: [], explanation: "Content to be added." },
  22: { passageId: 2, highlights: [], explanation: "Content to be added." },
  23: { passageId: 2, highlights: [], explanation: "Content to be added." },
  24: { passageId: 2, highlights: [], explanation: "Content to be added." },
  25: { passageId: 2, highlights: [], explanation: "Content to be added." },
  26: { passageId: 2, highlights: [], explanation: "Content to be added." },
  27: { passageId: 3, highlights: [], explanation: "Content to be added." },
  28: { passageId: 3, highlights: [], explanation: "Content to be added." },
  29: { passageId: 3, highlights: [], explanation: "Content to be added." },
  30: { passageId: 3, highlights: [], explanation: "Content to be added." },
  31: { passageId: 3, highlights: [], explanation: "Content to be added." },
  32: { passageId: 3, highlights: [], explanation: "Content to be added." },
  33: { passageId: 3, highlights: [], explanation: "Content to be added." },
  34: { passageId: 3, highlights: [], explanation: "Content to be added." },
  35: { passageId: 3, highlights: [], explanation: "Content to be added." },
  36: { passageId: 3, highlights: [], explanation: "Content to be added." },
  37: { passageId: 3, highlights: [], explanation: "Content to be added." },
  38: { passageId: 3, highlights: [], explanation: "Content to be added." },
  39: { passageId: 3, highlights: [], explanation: "Content to be added." },
  40: { passageId: 3, highlights: [], explanation: "Content to be added." }
};
