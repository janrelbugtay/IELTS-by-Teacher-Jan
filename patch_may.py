import re

with open("src/pages/MayListeningTest.tsx", "r") as f:
    content = f.read()

target = r'<CustomAudioPlayer ref=\{audioRef\} src="/api/audio\?id=[^"]+"  isMockMode=\{testMode === \'mock\'\} />'
replacement = r'''<a 
                href="https://drive.google.com/file/d/1ZKq-vISQpO7DHehoec-ickzrDFvPZRc3/view?usp=sharing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Play Audio in Google Drive
              </a>'''

content = re.sub(target, replacement, content)

with open("src/pages/MayListeningTest.tsx", "w") as f:
    f.write(content)
