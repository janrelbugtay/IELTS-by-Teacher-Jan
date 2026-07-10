with open("src/pages/pet/Dashboard.tsx", "r") as f:
    content = f.read()

content = content.replace("feedback: '' };\\n    const", "feedback: '' };\n    const")

with open("src/pages/pet/Dashboard.tsx", "w") as f:
    f.write(content)
