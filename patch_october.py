import json

with open('src/data/octoberReadingData.ts', 'r') as f:
    content = f.read()

# We need to parse the file or just use regex / string replacement
import re

new_block = """      {
        "title": "Questions 7-8",
        "instruction": "Choose TWO letters, A-E.\\nAccording to the article, which TWO of these statements are true of the new approach to flood control?",
        "description": "A. It aims to slow the movement of water to the sea.\\nB. It aims to channel water more directly into rivers.\\nC. It will cost more than twice as much as former measures.\\nD. It will involve the loss of some areas of land.\\nE. It has been tested only in The Netherlands.",
        "type": "input",
        "questions": [
          { "id": 7, "text": "" },
          { "id": 8, "text": "" }
        ]
      },
      {
        "title": "Questions 9-13","""

content = content.replace('      {\n        "title": "Questions 9-13",', new_block)

with open('src/data/octoberReadingData.ts', 'w') as f:
    f.write(content)

