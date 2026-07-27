with open('src/pages/TestResult.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "const title = submission.assignmentTitle || assignment?.title || 'Test Submission';",
    "const title = assignment?.title || getFallbackTitle(submission.assignmentId) || submission.assignmentTitle || 'Test Submission';"
)

with open('src/pages/TestResult.tsx', 'w') as f:
    f.write(content)

