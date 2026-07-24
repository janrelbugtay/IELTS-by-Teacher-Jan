import re

with open('src/pages/MayListeningTest.tsx', 'r') as f:
    content = f.read()

pattern = r'<div className="flex items-center gap-2">\s*<button className="bg-gradient[^>]+>Settings</button>\s*<button className="bg-gradient[^>]+>Help.*?</button>\s*<button onClick=\{\(\) => navigate\(\'/dashboard\'\)\} className="bg-gradient[^>]+>Quit</button>\s*<div className="flex items-center gap-2 ml-2 bg-gradient[^>]+>.*?</div>\s*</div>'

content = re.sub(pattern, '<div className="flex items-center gap-2"></div>', content, flags=re.DOTALL)

with open('src/pages/MayListeningTest.tsx', 'w') as f:
    f.write(content)
print("Done")
