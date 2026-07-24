import glob

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    old_text_classes_pt = """  const textClass: any = {
    'standard': 'text-[11pt]',
    'large': 'text-[14pt]',
    'xlarge': 'text-[18pt]'
  }[textSize];"""
  
    old_text_classes_px_already_done = """  const textClass: any = {
    'standard': 'text-[20px] font-sans',
    'large': 'text-[23px] font-sans',
    'xlarge': 'text-[27px] font-sans'
  }[textSize];"""

    new_text_classes = """  const textClass: any = {
    'standard': 'text-[20px] font-sans',
    'large': 'text-[23px] font-sans',
    'xlarge': 'text-[27px] font-sans'
  }[textSize];"""

    if old_text_classes_pt in content:
        content = content.replace(old_text_classes_pt, new_text_classes)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Patched {filepath}")
    elif old_text_classes_px_already_done not in content:
        print(f"Pattern not found in {filepath} (it might be formatted differently)")
    else:
        print(f"Already patched {filepath}")

for filepath in glob.glob("src/pages/*ReadingTest.tsx"):
    patch_file(filepath)

print("Done")
