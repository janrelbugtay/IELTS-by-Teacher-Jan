import re

with open('src/data/octoberReadingData.ts', 'r') as f:
    content = f.read()

content = re.sub(r'"title": "Keeping the water away.*?new approaches to flood control",', '"title": "Reading Passage 1",', content, flags=re.IGNORECASE)

with open('src/data/octoberReadingData.ts', 'w') as f:
    f.write(content)

print("Done")
