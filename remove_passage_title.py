import os
import glob

for filename in glob.glob('src/pages/*ReadingTest.tsx'):
    with open(filename, 'r') as f:
        content = f.read()
    
    # We want to remove the passage.title header in the left panel.
    target = '<h2 className={`text-[1.25em] font-bold uppercase tracking-widest mb-2 ${theme.muted}`}>{passage.title}</h2>'
    if target in content:
        content = content.replace(target, '')
        with open(filename, 'w') as f:
            f.write(content)
        print(f"Removed in {filename}")
    else:
        print(f"Target not found in {filename}")
