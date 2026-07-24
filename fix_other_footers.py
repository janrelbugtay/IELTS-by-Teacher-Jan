import glob

for filepath in glob.glob("src/pages/*ReadingTest.tsx"):
    if "ComputerReadingTest" in filepath:
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    # We want to replace the flex wrapping with single row.
    # We will do this via some regex to be safe.
    import re
    
    # Change footer container to flex-row min-w-max
    content = re.sub(
        r'<div className="max-w-\[1400px\] mx-auto flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between w-full">',
        '<div className="max-w-[1400px] mx-auto flex flex-row items-center justify-between min-w-max gap-6 w-full">',
        content
    )
    
    # Change flex-col xl:flex-row to flex-row
    content = re.sub(
        r'<div className="flex flex-col xl:flex-row gap-8 items-start xl:items-center">',
        '<div className="flex flex-row items-center gap-8">',
        content
    )
    
    # Remove mt-2 xl:mt-0 from legends
    content = re.sub(
        r'shrink-0 mt-2 xl:mt-0 p-2',
        r'shrink-0 p-2',
        content
    )
    
    # Change the parts container
    content = re.sub(
        r'<div className="flex flex-col gap-2\.5">',
        r'<div className="flex flex-row items-center gap-4 xl:gap-6">',
        content
    )
    
    # Remove the intermediate wrappers inside parts
    content = re.sub(
        r'<div className="flex flex-wrap items-center gap-6">\s*<div className={`flex items-center',
        r'<div className={`flex items-center',
        content
    )
    
    content = re.sub(
        r'</div>\s*</div>\s*<div className={`flex items-center',
        r'</div>\n                  <div className={`flex items-center',
        content
    )
    
    # Change flex-wrap gap-[1px] to flex-row gap-[1px]
    content = re.sub(
        r'<div className="flex flex-wrap gap-\[1px\]">',
        r'<div className="flex flex-row gap-[1px]">',
        content
    )
    
    # Change uppercase Part labels
    content = re.sub(
        r'tracking-wider w-14 shrink-0',
        r'tracking-wider w-12 xl:w-14 shrink-0',
        content
    )
    
    with open(filepath, 'w') as f:
        f.write(content)
        
    print(f"Patched {filepath}")

print("Done")
