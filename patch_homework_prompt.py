import re

filepath = 'src/pages/ComputerWritingTest.tsx'
with open(filepath, 'r') as f:
    content = f.read()

hw_case = """        case 'ielts-writing-homework-1':
            return {
                t1Title: defaultPrompt.t1Title,
                t1Desc: defaultPrompt.t1Desc,
                t1Content: defaultPrompt.t1Content,
                t1Raw: defaultPrompt.t1Raw,
                t2Prompt: (
                    <>
                        <p className="font-bold mb-4">In some cities and towns all over the world, traffic jam is a problem.</p>
                        <p className="font-bold mb-4">What are the causes of this and what actions can be taken to solve this problem?</p>
                    </>
                ),
                t2Desc: "Give reasons for your answer and include any relevant examples from your own knowledge or experience.",
                t2Raw: "In some cities and towns all over the world, traffic jam is a problem. What are the causes of this and what actions can be taken to solve this problem? Give reasons for your answer and include any relevant examples from your own knowledge or experience."
            };"""

if "case 'ielts-writing-homework-1':" not in content:
    content = content.replace("default:", hw_case + "\n        default:")
    with open(filepath, 'w') as f:
        f.write(content)
    print("Added homework prompt")
else:
    print("Homework prompt already exists")

