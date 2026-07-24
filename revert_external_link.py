import re

with open('src/pages/PracticeTests.tsx', 'r') as f:
    content = f.read()

new_code = """      let externalLink = undefined;
      if (courseName === 'IELTS') {
        if (testId === 21) {
           externalLink = `/test/reading/21`;
        }
      }"""

# The code to replace:
#       if (courseName === 'IELTS') {
#         if (testId <= 40) {
#            externalLink = `/test/${skill.name.toLowerCase()}/${testId}`;
#         }
#       }

content = re.sub(r"      let externalLink = undefined;\n      if \(courseName === 'IELTS'\) \{\n        if \(testId <= 40\) \{\n           externalLink = `/test/\$\{skill\.name\.toLowerCase\(\)\}/\$\{testId\}`;\n        \}\n      \}", new_code, content)

with open('src/pages/PracticeTests.tsx', 'w') as f:
    f.write(content)

print("Done")
