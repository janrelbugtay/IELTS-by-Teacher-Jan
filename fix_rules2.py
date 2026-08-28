import re

with open('firestore.rules', 'r') as f:
    content = f.read()

content = content.replace(
    'match /speaking_tests/{testId} {\n      allow read, write: if true;\n    }',
    'match /speaking_tests/{testId} {\n      allow read, write: if true;\n    }\n    match /writing_tests/{testId} {\n      allow read, write: if true;\n    }\n    match /reading_tests/{testId} {\n      allow read, write: if true;\n    }\n    match /listening_tests/{testId} {\n      allow read, write: if true;\n    }'
)

with open('firestore.rules', 'w') as f:
    f.write(content)
