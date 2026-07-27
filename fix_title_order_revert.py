import re

def fix(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    content = content.replace(
        "const title = assignment?.title || sub.assignmentTitle || getFallbackTitle(sub.assignmentId) || 'Unknown Test';",
        "const title = assignment?.title || getFallbackTitle(sub.assignmentId) || sub.assignmentTitle || 'Unknown Test';"
    )
    
    content = content.replace(
        "const title = assignment?.title || submission.assignmentTitle || getFallbackTitle(submission.assignmentId) || 'Test Submission';",
        "const title = assignment?.title || getFallbackTitle(submission.assignmentId) || submission.assignmentTitle || 'Test Submission';"
    )
    
    with open(filepath, 'w') as f:
        f.write(content)

fix('src/pages/ielts/Dashboard.tsx')
fix('src/pages/TestResult.tsx')
