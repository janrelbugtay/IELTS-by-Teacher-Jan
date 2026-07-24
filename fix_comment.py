import re
with open('src/pages/JulyWritingTest.tsx', 'r') as f:
    text = f.read()

text = text.replace('{* Image Placeholder *}', '{/* Image Placeholder */}')
text = text.replace('<!-- Image Placeholder -->', '{/* Image Placeholder */}')

with open('src/pages/JulyWritingTest.tsx', 'w') as f:
    f.write(text)
