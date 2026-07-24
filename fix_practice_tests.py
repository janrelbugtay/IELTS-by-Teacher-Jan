import re

with open('src/pages/PracticeTests.tsx', 'r') as f:
    content = f.read()

# Replace the array of test IDs with an updated array that includes 37
old_array = "[1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19, 21, 22, 23, 25, 26, 29, 33, 'IELTS-READING-JAN2026-001']"
new_array = "[1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19, 21, 22, 23, 25, 26, 29, 33, 37, 'IELTS-READING-JAN2026-001']"

content = content.replace(old_array, new_array)

with open('src/pages/PracticeTests.tsx', 'w') as f:
    f.write(content)

print("Done")
