import re

with open("src/pages/JulyWritingTest.tsx", "r") as f:
    content = f.read()

content = content.replace("JuneWritingTest", "JulyWritingTest")

content = re.sub(
    r'const prompt1Raw = ".*?";',
    'const prompt1Raw = "";',
    content
)

content = re.sub(
    r'const prompt2Raw = ".*?";',
    'const prompt2Raw = "";',
    content
)

# Remove the img tag in Task 1 section
content = re.sub(
    r'<img src="[^"]+".*?/>',
    '<!-- Image Placeholder -->',
    content
)

# Also remove the hardcoded text for Task 2 prompt
# Let's find where prompt text is displayed
with open("src/pages/JulyWritingTest.tsx", "w") as f:
    f.write(content)
