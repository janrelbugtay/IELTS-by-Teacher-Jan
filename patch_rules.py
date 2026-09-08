filepath = 'firestore.rules'
with open(filepath, 'r') as f:
    content = f.read()

new_rule = """
    match /homeworkConfig/{configId} {
      allow read: if true;
      allow write: if true;
    }
"""

if "match /homeworkConfig" not in content:
    content = content.replace("match /databases/{database}/documents {", "match /databases/{database}/documents {" + new_rule)
    with open(filepath, 'w') as f:
        f.write(content)
    print("Rules patched")
else:
    print("Rules already patched")
