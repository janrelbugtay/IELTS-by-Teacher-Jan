import re

with open("src/pages/MayListeningTest.tsx", "r") as f:
    content = f.read()

target = r'<a \n                href="https://drive\.google\.com/file/d/1ZKq-vISQpO7DHehoec-ickzrDFvPZRc3/view\?usp=sharing" \n                target="_blank" \n                rel="noopener noreferrer"\n                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2\.5 rounded-full hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"\n              >\n                <ExternalLink className="w-4 h-4" />\n                Play Audio in Google Drive\n              </a>'

replacement = r'''<iframe 
                src="https://drive.google.com/file/d/1ZKq-vISQpO7DHehoec-ickzrDFvPZRc3/preview" 
                width="400" 
                height="100" 
                allow="autoplay" 
                className="rounded-xl overflow-hidden border-0 bg-transparent"
                style={{ border: 'none', background: 'transparent' }}
              ></iframe>'''

content = re.sub(target, replacement, content)

with open("src/pages/MayListeningTest.tsx", "w") as f:
    f.write(content)
