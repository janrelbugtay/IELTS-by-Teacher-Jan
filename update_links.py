import re

with open('src/pages/PracticeTests.tsx', 'r') as f:
    content = f.read()

# Replace the specific hardcoded 21 check with a generic one for all reading tests up to October (testId 37)
new_code = """      if (courseName === 'IELTS') {
        if (skill.name === 'Reading' && testId <= 37) {
           externalLink = `/test/reading/${testId}`;
        }
      }"""

content = re.sub(r"      if \(courseName === 'IELTS'\) \{\n        if \(testId === 21\) \{\n           externalLink = `/test/reading/21`;\n        \}\n      \}", new_code, content)

with open('src/pages/PracticeTests.tsx', 'w') as f:
    f.write(content)

print("Done")
