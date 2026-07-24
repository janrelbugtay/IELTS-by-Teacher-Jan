import re

with open("src/pages/JulyWritingTest.tsx", "r") as f:
    content = f.read()

task1_text = "The graph below gives information about changes in the birth and death rates in New Zealand between 1901 and 2101. Summarize the information by selecting and reporting the main points and make comparisons where relevant."
task2_text = "Some people believe that all wild animals should be protected. Others say that few wild animals should be protected instead. Discuss both views and give your opinion."

content = content.replace('const prompt1Raw = "";', f'const prompt1Raw = "{task1_text}";')
content = content.replace('const prompt2Raw = "";', f'const prompt2Raw = "{task2_text}";')

content = content.replace('[July Task 1 Prompt will be here]', task1_text)
content = content.replace('[July Task 2 Prompt will be here]', task2_text)

with open("src/pages/JulyWritingTest.tsx", "w") as f:
    f.write(content)
