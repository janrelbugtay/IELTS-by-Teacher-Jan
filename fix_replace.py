import re
with open('src/data/octoberReadingData.ts', 'r') as f:
    content = f.read()

# Instead of re.sub with string replacement, let's use string.replace
with open('add_oct_explanations.py', 'r') as f:
    code = f.read()

# I will just run a python script that does replace on a known string
import json

# re-import explanations
exec(code.split("with open")[0]) # load explanations dict

with open('src/data/octoberReadingData.ts', 'r') as f:
    content = f.read()

export_str = "export const octoberExplanations: Record<number, any> = " + json.dumps(explanations, indent=2) + ";"

# The original might be "export const octoberExplanations = {};"
# Or "export const octoberExplanations: Record<number, any> = {};"
if "export const octoberExplanations = {};" in content:
    content = content.replace("export const octoberExplanations = {};", export_str)
elif "export const octoberExplanations: Record<number, any> = {};" in content:
    content = content.replace("export const octoberExplanations: Record<number, any> = {};", export_str)
else:
    # use regex but safely
    content = re.sub(r'export const octoberExplanations[^;]+;', lambda m: export_str, content)

with open('src/data/octoberReadingData.ts', 'w') as f:
    f.write(content)

print("Replaced safely")
