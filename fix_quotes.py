import re

with open('src/data/test18ReadingData.ts', 'r') as f:
    content = f.read()

# find all explanation: "..." and replace with explanation: `...`
def replacer(match):
    inner = match.group(1)
    # inside the backticks, we might have actual newlines which is perfectly valid in JS
    return f"explanation: `{inner}`"

content = re.sub(r'explanation:\s*"([^"]+)"', replacer, content)

with open('src/data/test18ReadingData.ts', 'w') as f:
    f.write(content)
