import re

with open("src/pages/JulyWritingTest.tsx", "r") as f:
    content = f.read()

content = content.replace('{/* Image Placeholder */}', '<div className="w-full h-[300px] bg-gray-200 flex items-center justify-center text-gray-500 rounded border border-gray-300">Graph: Birth and death rates in New Zealand (1901-2101)</div>')

with open("src/pages/JulyWritingTest.tsx", "w") as f:
    f.write(content)
