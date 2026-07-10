with open("src/pages/PracticeTests.tsx", "r") as f:
    content = f.read()

# Add 21 to the list of included test ids
old_includes = "[1, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 17, 'IELTS-READING-JAN2026-001'].includes(test.id)"
new_includes = "[1, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 17, 21, 'IELTS-READING-JAN2026-001'].includes(test.id)"
content = content.replace(old_includes, new_includes)

with open("src/pages/PracticeTests.tsx", "w") as f:
    f.write(content)
