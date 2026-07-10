with open("src/data/readingTestData.ts", "r") as f:
    content = f.read()

import_statement = "import { mayPassages, mayAnswers, mayExplanations } from './mayReadingData';\nimport { junePassages, juneAnswers, juneExplanations } from './juneReadingData';"
content = content.replace("import { mayPassages, mayAnswers, mayExplanations } from './mayReadingData';", import_statement)

june_block = """  if (id === '17') {
    return { passages: mayPassages, answers: mayAnswers, explanations: mayExplanations };
  }
  
  if (id === '21') {
    return { passages: junePassages, answers: juneAnswers, explanations: juneExplanations };
  }"""
content = content.replace("""  if (id === '17') {
    return { passages: mayPassages, answers: mayAnswers, explanations: mayExplanations };
  }""", june_block)

future_tests_old = "if (id && ['21', '25', '29', '33', '37', '41'].includes(id)) {"
future_tests_new = "if (id && ['25', '29', '33', '37', '41'].includes(id)) {"
content = content.replace(future_tests_old, future_tests_new)

with open("src/data/readingTestData.ts", "w") as f:
    f.write(content)
