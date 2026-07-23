import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

bad_block = """                    <div className="absolute w-full h-[calc(100%+120px)] top-[-60px] left-0 bg-black">
                      <div className="absolute top-[60px] left-0 right-[60px] h-[60px] z-10 bg-transparent"></div>
                      <div 
                        className="absolute top-[60px] right-0 w-[60px] h-[60px] z-20 cursor-pointer bg-transparent"
                        onClick={(e) => {
                          const container = e.currentTarget.parentElement?.parentElement;
                          if (document.fullscreenElement) {
                            document.exitFullscreen();
                          } else if (container?.requestFullscreen) {
                            container.requestFullscreen();
                          }
                        }}
                        title="Toggle Fullscreen"
                      ></div>
                      <iframe 
                        src={`https://drive.google.com/file/d/${video.id}/preview?autoplay=1`}
                        width="100%" 
                        height="100%" 
                        allow="autoplay; fullscreen" 
                        allowFullScreen
                        title={video.title}
                        className="border-0"
                      ></iframe>
                    </div>"""

good_block = """                    <div className="absolute inset-0 bg-black">
                      <div 
                        className="absolute top-0 right-0 w-[60px] h-[60px] z-20 cursor-pointer bg-transparent flex items-center justify-center"
                        onClick={(e) => {
                          const container = e.currentTarget.parentElement?.parentElement;
                          if (document.fullscreenElement) {
                            document.exitFullscreen();
                          } else if (container?.requestFullscreen) {
                            container.requestFullscreen();
                          }
                        }}
                        title="Toggle Fullscreen"
                      ></div>
                      <iframe 
                        src={`https://drive.google.com/file/d/${video.id}/preview?autoplay=1`}
                        width="100%" 
                        height="100%" 
                        allow="autoplay; fullscreen" 
                        allowFullScreen
                        title={video.title}
                        className="border-0"
                      ></iframe>
                    </div>"""

content = content.replace(bad_block, good_block)

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("Done")
