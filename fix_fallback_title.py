import re

def fix(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    replacement = r"""const getFallbackTitle = (id: any) => {
  const strId = String(id);
  if (!/^\d+$/.test(strId)) return null;
  const numId = parseInt(strId, 10);
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
};"""

    content = re.sub(
        r"const getFallbackTitle = \(id: any\) => \{.*?return null;\n\};",
        lambda m: replacement,
        content,
        flags=re.DOTALL
    )
    
    with open(filepath, 'w') as f:
        f.write(content)

fix('src/pages/ielts/Dashboard.tsx')
fix('src/pages/TestResult.tsx')
