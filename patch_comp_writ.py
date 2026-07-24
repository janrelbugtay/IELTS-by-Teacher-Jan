import re

with open("src/pages/ComputerWritingTest.tsx", "r") as f:
    content = f.read()

# Add import
content = re.sub(
    r"import { JuneWritingTest } from '\./JuneWritingTest';",
    "import { JuneWritingTest } from './JuneWritingTest';\nimport { JulyWritingTest } from './JulyWritingTest';",
    content
)

# Add route logic
content = re.sub(
    r"    if \(id === '23' && !submissionId\) {\n        return <JuneWritingTest />;\n    }",
    "    if (id === '23' && !submissionId) {\n        return <JuneWritingTest />;\n    }\n    if (id === '27' && !submissionId) {\n        return <JulyWritingTest />;\n    }",
    content
)

with open("src/pages/ComputerWritingTest.tsx", "w") as f:
    f.write(content)
