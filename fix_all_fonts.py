import glob
import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Generic replace for any text sizes
    content = re.sub(r"'standard':\s*'text-\[.*?\].*?'", "'standard': 'text-[20px] font-sans'", content)
    content = re.sub(r"'large':\s*'text-\[.*?\].*?'", "'large': 'text-[23px] font-sans'", content)
    content = re.sub(r"'xlarge':\s*'text-\[.*?\].*?'", "'xlarge': 'text-[27px] font-sans'", content)

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Regex patched {filepath}")

for filepath in glob.glob("src/pages/*ReadingTest.tsx"):
    patch_file(filepath)

print("Done")
