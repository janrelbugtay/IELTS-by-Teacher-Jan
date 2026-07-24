import re

with open('src/data/readingTestData.ts', 'r') as f:
    content = f.read()

# Add import
import_stmt = "import { octoberPassages, octoberAnswers, octoberExplanations } from './octoberReadingData';\n"
content = import_stmt + content

# Replace id === '33' block with a combined one
content = content.replace("if (id === '33') {\n    return { passages: septemberPassages, answers: septemberAnswers, explanations: septemberExplanations };\n  }", "if (id === '33') {\n    return { passages: septemberPassages, answers: septemberAnswers, explanations: septemberExplanations };\n  }\n  if (id === '37') {\n    return { passages: octoberPassages, answers: octoberAnswers, explanations: octoberExplanations };\n  }")

# Remove '37' from future tests
content = content.replace("if (id && ['37', '41'].includes(id))", "if (id && ['41'].includes(id))")

with open('src/data/readingTestData.ts', 'w') as f:
    f.write(content)

print("Done")
