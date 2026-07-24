import re

with open("src/pages/JulyWritingTest.tsx", "r") as f:
    content = f.read()

placeholder = '<div className="w-full h-[300px] bg-gray-200 flex items-center justify-center text-gray-500 rounded border border-gray-300">Graph: Birth and death rates in New Zealand (1901-2101)</div>'
replacement = '<img src="https://lh3.googleusercontent.com/d/1Ux-pPK6i2YrIHB_PoHjgkfn_oKFzK66R=w1000" style={{ width: \'100%\', height: \'auto\', maxHeight: \'600px\', objectFit: \'contain\' }} alt="Task 1 Graph" referrerPolicy="no-referrer" />'

content = content.replace(placeholder, replacement)

with open("src/pages/JulyWritingTest.tsx", "w") as f:
    f.write(content)
