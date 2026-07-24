import re

with open("src/pages/JulyWritingTest.tsx", "r") as f:
    content = f.read()

# Replace Task 1 prompt
content = re.sub(
    r'The plans show a student common room from five years ago and now\.<br/><br/>.*?make comparisons where relevant\.',
    '[July Task 1 Prompt will be here]',
    content,
    flags=re.DOTALL
)

# Replace Task 2 prompt
content = re.sub(
    r'Some people believe that sports competitions are a source of emotional stress for young people.*?Do you agree or disagree\?',
    '[July Task 2 Prompt will be here]',
    content,
    flags=re.DOTALL
)

with open("src/pages/JulyWritingTest.tsx", "w") as f:
    f.write(content)
