import re

def fix(filepath, is_dashboard=False):
    with open(filepath, 'r') as f:
        content = f.read()
        
    if is_dashboard:
        content = re.sub(
            r"const title = assignment\?\.title \|\| getFallbackTitle\(sub\.assignmentId\) \|\| sub\.assignmentTitle \|\| 'Unknown Test';",
            r"const title = sub.assignmentTitle || getFallbackTitle(sub.assignmentId) || assignment?.title || 'Unknown Test';",
            content
        )
    else:
        content = re.sub(
            r"const title = assignment\?\.title \|\| getFallbackTitle\(submission\.assignmentId\) \|\| submission\.assignmentTitle \|\| 'Test Submission';",
            r"const title = submission.assignmentTitle || getFallbackTitle(submission.assignmentId) || assignment?.title || 'Test Submission';",
            content
        )
    
    with open(filepath, 'w') as f:
        f.write(content)

fix('src/pages/ielts/Dashboard.tsx', True)
fix('src/pages/TestResult.tsx', False)
