import re

with open('src/pages/PracticeTests.tsx', 'r') as f:
    content = f.read()

new_code = """      if (courseName === 'IELTS') {
        if (testId <= 40) {
           externalLink = `/test/${skill.name.toLowerCase()}/${testId}`;
        }
      }"""

content = re.sub(r"      if \(courseName === 'IELTS'\) \{\n        if \(skill.name === 'Reading' && testId <= 37\) \{\n           externalLink = `/test/reading/\$\{testId\}`;\n        \}\n      \}", new_code, content)

with open('src/pages/PracticeTests.tsx', 'w') as f:
    f.write(content)

print("Done")
