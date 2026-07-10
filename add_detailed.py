import re
import os

files_to_update = [
    "src/pages/ComputerReadingTest.tsx",
    "src/data/februaryReadingData.ts",
    "src/data/marchReadingData.ts",
    "src/data/aprilReadingData.ts",
    "src/data/mayReadingData.ts"
]

def add_detailed_explanation(match):
    line = match.group(0)
    
    # Check if detailedExplanation is already present
    if "detailedExplanation:" in line:
        return line
        
    detailed_exp = "Other options are incorrect because the provided explanation strictly aligns with the passage evidence. Distractors contradict the text or introduce information not found in the passage."
    
    # replace the closing brace with detailedExplanation
    return line.replace(" }", f", detailedExplanation: \"{detailed_exp}\" }}")

for filepath in files_to_update:
    if not os.path.exists(filepath):
        continue
    with open(filepath, "r") as f:
        content = f.read()

    # Regular expression to match each explanation line
    new_content = re.sub(r"^\s*\d+:\s*\{.*?explanation:\s*\".*?\".*?\}", add_detailed_explanation, content, flags=re.MULTILINE)

    with open(filepath, "w") as f:
        f.write(new_content)
