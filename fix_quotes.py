import re
import glob

def fix(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    content = content.replace("\\'Unknown Test\\'", "'Unknown Test'")
    content = content.replace("\\'Test Submission\\'", "'Test Submission'")
    
    with open(filepath, 'w') as f:
        f.write(content)

fix('src/pages/ielts/Dashboard.tsx')
fix('src/pages/TestResult.tsx')
