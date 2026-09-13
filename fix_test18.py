with open('src/data/test18ReadingData.ts', 'r') as f:
    content = f.read()

content = content.replace(
'''        type: "true-false",
        questions: [''',
'''        type: "choice",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        questions: ['''
)

content = content.replace(
'''        type: "multiple-choice",
        questions: [''',
'''        type: "mcq",
        questions: ['''
)

content = content.replace(
'''        instruction: "Do the following statements agree with the claims of the writer in Reading Passage 3?\\n\\nIn boxes 38–40 on your answer sheet, write:\\nYES if the statement agrees with the claims of the writer\\nNO if the statement contradicts the claims of the writer\\nNOT GIVEN if it is impossible to say what the writer thinks about this",
        type: "choice",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        questions: [''',
'''        instruction: "Do the following statements agree with the claims of the writer in Reading Passage 3?\\n\\nIn boxes 38–40 on your answer sheet, write:\\nYES if the statement agrees with the claims of the writer\\nNO if the statement contradicts the claims of the writer\\nNOT GIVEN if it is impossible to say what the writer thinks about this",
        type: "choice",
        options: ["YES", "NO", "NOT GIVEN"],
        questions: ['''
)

with open('src/data/test18ReadingData.ts', 'w') as f:
    f.write(content)
