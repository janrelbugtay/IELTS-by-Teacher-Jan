import re

with open('src/data/octoberReadingData.ts', 'r') as f:
    content = f.read()

# Add answers
content = content.replace('"6": "G",', '"6": "G",\n  "7": "A",\n  "8": "D",')

with open('src/data/octoberReadingData.ts', 'w') as f:
    f.write(content)
