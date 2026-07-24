import re

with open("src/pages/TestResult.tsx", "r") as f:
    content = f.read()

# Add imports
content = re.sub(
    r"import { MayWritingTest } from '\./MayWritingTest';",
    "import { MayWritingTest } from './MayWritingTest';\nimport { JuneWritingTest } from './JuneWritingTest';\nimport { JulyWritingTest } from './JulyWritingTest';",
    content
)

# Add logic
content = re.sub(
    r"      if \(submission\.assignmentTitle\?\.toLowerCase\(\)\.includes\('may'\)\) {\n          return <MayWritingTest submissionId=\{id\} \/>;\n      }",
    "      if (submission.assignmentTitle?.toLowerCase().includes('may')) {\n          return <MayWritingTest submissionId={id} />;\n      }\n      if (submission.assignmentTitle?.toLowerCase().includes('june')) {\n          return <JuneWritingTest submissionId={id} />;\n      }\n      if (submission.assignmentTitle?.toLowerCase().includes('july')) {\n          return <JulyWritingTest submissionId={id} />;\n      }",
    content
)

with open("src/pages/TestResult.tsx", "w") as f:
    f.write(content)
