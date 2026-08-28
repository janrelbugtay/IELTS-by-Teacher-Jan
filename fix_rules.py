import re

with open('firestore.rules', 'r') as f:
    content = f.read()

# Remove the block:
#     match /{document=**} {
#       allow read, write: if false;
#     }
content = re.sub(r'\s*match /\{document=\*\*\} \{\s*allow read, write: if false;\s*\}', '', content)

with open('firestore.rules', 'w') as f:
    f.write(content)
