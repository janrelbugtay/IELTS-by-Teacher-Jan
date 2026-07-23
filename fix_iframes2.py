with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

old_clean = '<div className="absolute top-0 right-0 w-[60px] h-[60px] z-10 bg-transparent" title="Fullscreen is available in the bottom right"></div>\n                <iframe '
new_clean = '<div className="absolute top-0 left-0 right-0 h-[60px] z-10 bg-transparent"></div>\n                <iframe '
content = content.replace(old_clean, new_clean)

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("Done")
