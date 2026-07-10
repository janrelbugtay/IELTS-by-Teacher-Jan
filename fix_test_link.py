with open("src/pages/PracticeTests.tsx", "r") as f:
    content = f.read()

old_link_logic = """      let externalLink = undefined;"""
new_link_logic = """      let externalLink = undefined;
      if (courseName === 'IELTS') {
        if (testId === 21) {
           externalLink = `/test/reading/21`;
        }
      }"""
content = content.replace(old_link_logic, new_link_logic)

with open("src/pages/PracticeTests.tsx", "w") as f:
    f.write(content)
