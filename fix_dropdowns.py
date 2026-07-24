import os
import glob
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We want to replace `"type": "dropdown",\n        "options": [...],` back to `"type": "input",`
    # ONLY IF the instruction doesn't actually mention A-G, A-F, etc.
    # A better heuristic: if the instruction contains "WORD" or "WORDS" or "NUMBER", it's an input.
    # Let's just find blocks.
    
    blocks = re.split(r'(\{\s*"title": "Questions)', content)
    for i in range(1, len(blocks), 2):
        block_text = blocks[i] + blocks[i+1]
        
        # If it has "type": "dropdown" and it's mistakenly assigned:
        if '"type": "dropdown"' in block_text:
            instruction_match = re.search(r'"instruction": "(.*?)"', block_text)
            if instruction_match:
                instruction = instruction_match.group(1)
                # Proper dropdown instructions should have "A-G", "A-E", etc.
                # Actually, some might be "A-H".
                if "A-G" not in instruction and "A\u2013G" not in instruction \
                   and "A-H" not in instruction and "A\u2013H" not in instruction \
                   and "A-F" not in instruction and "A\u2013F" not in instruction \
                   and "A-E" not in instruction and "A\u2013E" not in instruction \
                   and "A-I" not in instruction and "A\u2013I" not in instruction \
                   and "A-J" not in instruction and "A\u2013J" not in instruction \
                   and "A-D" not in instruction and "A\u2013D" not in instruction \
                   and "Which paragraph contains" not in instruction:
                    
                    # It's a mistake! Revert it.
                    # Remove the "type": "dropdown" and the options array.
                    fixed_block = re.sub(r'"type": "dropdown",\n\s*"options": \[.*?\],', '"type": "input",', block_text, flags=re.DOTALL)
                    blocks[i+1] = fixed_block[len(blocks[i]):] # Replace the second part
                    
    with open(filepath, 'w') as f:
        f.write("".join(blocks))
        
for filepath in glob.glob("src/data/*ReadingData.ts"):
    fix_file(filepath)

print("Done")
