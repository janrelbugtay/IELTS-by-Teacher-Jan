import json

with open("src/data/juneReadingData.ts", "r") as f:
    content = f.read()

# Let's just do a simple replacement for true/false/not given and mcq to add detailedExplanation.
# I will use a python script to parse and modify the file because it's a JS file.
