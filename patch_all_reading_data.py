import os
import glob
import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. A-G
    content = re.sub(
        r'("instruction": ".*?A.{1,3}G.*?)(",\n\s*)"type": "input"',
        r'\1\2"type": "dropdown",\n        "options": ["A", "B", "C", "D", "E", "F", "G"]',
        content,
        flags=re.IGNORECASE | re.DOTALL
    )

    # 2. A-H
    content = re.sub(
        r'("instruction": ".*?A.{1,3}H.*?)(",\n\s*)"type": "input"',
        r'\1\2"type": "dropdown",\n        "options": ["A", "B", "C", "D", "E", "F", "G", "H"]',
        content,
        flags=re.IGNORECASE | re.DOTALL
    )
    
    # 3. A-F
    content = re.sub(
        r'("instruction": ".*?A.{1,3}F.*?)(",\n\s*)"type": "input"',
        r'\1\2"type": "dropdown",\n        "options": ["A", "B", "C", "D", "E", "F"]',
        content,
        flags=re.IGNORECASE | re.DOTALL
    )
    
    # 4. A-E
    content = re.sub(
        r'("instruction": ".*?A.{1,3}E.*?)(",\n\s*)"type": "input"',
        r'\1\2"type": "dropdown",\n        "options": ["A", "B", "C", "D", "E"]',
        content,
        flags=re.IGNORECASE | re.DOTALL
    )

    # 5. A-I
    content = re.sub(
        r'("instruction": ".*?A.{1,3}I.*?)(",\n\s*)"type": "input"',
        r'\1\2"type": "dropdown",\n        "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I"]',
        content,
        flags=re.IGNORECASE | re.DOTALL
    )

    # 6. A-J
    content = re.sub(
        r'("instruction": ".*?A.{1,3}J.*?)(",\n\s*)"type": "input"',
        r'\1\2"type": "dropdown",\n        "options": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]',
        content,
        flags=re.IGNORECASE | re.DOTALL
    )

    # 7. A-D
    content = re.sub(
        r'("instruction": ".*?A.{1,3}D.*?)(",\n\s*)"type": "input"',
        r'\1\2"type": "dropdown",\n        "options": ["A", "B", "C", "D"]',
        content,
        flags=re.IGNORECASE | re.DOTALL
    )

    
    with open(filepath, 'w') as f:
        f.write(content)

for filepath in glob.glob("src/data/*ReadingData.ts"):
    patch_file(filepath)

print("Done")
