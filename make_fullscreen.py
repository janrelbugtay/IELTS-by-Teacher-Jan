import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

# Replace the existing top bar block:
# <div className="absolute top-0 left-0 right-0 h-[60px] z-10 bg-transparent"></div>
# with the new logic.

replacement = """<div className="absolute top-0 left-0 right-[60px] h-[60px] z-10 bg-transparent"></div>
                <div 
                  className="absolute top-0 right-0 w-[60px] h-[60px] z-20 cursor-pointer bg-transparent"
                  onClick={(e) => {
                    const container = e.currentTarget.parentElement;
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else if (container.requestFullscreen) {
                      container.requestFullscreen();
                    }
                  }}
                  title="Toggle Fullscreen"
                ></div>"""

content = content.replace('<div className="absolute top-0 left-0 right-0 h-[60px] z-10 bg-transparent"></div>', replacement)

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("Done")
