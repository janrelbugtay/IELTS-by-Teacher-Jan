import re
import sys

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add getFallbackTitle if not present
    if "const getFallbackTitle" not in content:
        func_def = """
const getFallbackTitle = (id: any) => {
  const numId = parseInt(String(id));
  if (!isNaN(numId) && numId >= 1 && numId <= 48) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = months[Math.ceil(numId / 4) - 1];
    let skill = 'Practice';
    if (numId % 4 === 1) skill = 'Reading';
    if (numId % 4 === 2) skill = 'Listening';
    if (numId % 4 === 3) skill = 'Writing';
    if (numId % 4 === 0) skill = 'Speaking';
    return `${month} ${skill} Practice (IELTS)`;
  }
  return null;
};
"""
        # Insert after imports
        content = re.sub(r'(import .*?;)', r'\1\n' + func_def, content, count=1, flags=re.DOTALL)

    # Replace title assignment
    content = re.sub(
        r'const title = assignment\?\.title \|\| submission\.assignmentTitle \|\| \'Test Submission\';',
        r'const title = assignment?.title || getFallbackTitle(submission.assignmentId) || submission.assignmentTitle || \'Test Submission\';',
        content
    )

    with open(filepath, 'w') as f:
        f.write(content)

replace_in_file('src/pages/TestResult.tsx')
