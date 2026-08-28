import os
import glob
import re

files = glob.glob("src/pages/*WritingTest.tsx")
for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # We injected the hook right before "const formatTime =" or "const handleSubmit =" or "const handleConfirmSubmit ="
    # Let's find "  const unmountStateRef = useRef" and remove it until "}, []);"
    
    pattern = r"  const unmountStateRef = useRef\(\{.*?\}\, \[\]\);\n\n"
    content = re.sub(pattern, "", content, flags=re.DOTALL)
    
    with open(file, 'w') as f:
        f.write(content)
    print(f"Reverted {file}")
