import re
import sys

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add getFallbackTitle after getFallbackType
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
        content = re.sub(r'(const getFallbackType =.*?};)', r'\1\n' + func_def, content, flags=re.DOTALL)

    # Replace title assignment
    content = re.sub(
        r'const title = assignment\?\.title \|\| sub\.assignmentTitle \|\| \'Unknown Test\';',
        r'const title = assignment?.title || getFallbackTitle(sub.assignmentId) || sub.assignmentTitle || \'Unknown Test\';',
        content
    )

    with open(filepath, 'w') as f:
        f.write(content)

replace_in_file('src/pages/ielts/Dashboard.tsx')
