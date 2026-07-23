import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

# Add activeVideo state
state_match = re.search(r'export const Home = \(\) => \{\n', content)
if state_match:
    content = content.replace('export const Home = () => {\n', 'export const Home = () => {\n  const [activeVideo, setActiveVideo] = useState<string | null>(null);\n')

videos_data = """
const VIDEOS = [
  { id: '1m3tRXayFhFQGk7P4TgtK0Vc1kwNvk6-V', title: 'Life at Ky Nguyen Era Video 1' },
  { id: '1ec3Ee5VTwWkep1L4-strCnOx3evHoE0e', title: 'Life at Ky Nguyen Era Video 2' },
  { id: '1G39tMBVChShT-bU52uwjHqZV7NYwduhr', title: 'Life at Ky Nguyen Era Video 3' },
  { id: '1jmkstraxzjwScvee4npqHGiRJOHp1DzA', title: 'Life at Ky Nguyen Era Video 4' },
  { id: '1UV_enof7q1KvsshgHkSE1ly5qOZKSLBc', title: 'Life at Ky Nguyen Era Video 5' },
  { id: '1nlYKmV4DLV3xIqRTSYM_AOvvj9ig_qBJ', title: 'Life at Ky Nguyen Era Video 6' },
];
"""
content = content.replace('export const Home = () => {', videos_data + 'export const Home = () => {')


grid_start = '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">'
grid_end = '            </div>\n          </div>\n        </div>\n      </section>'

grid_start_idx = content.find(grid_start)
grid_end_idx = content.find(grid_end, grid_start_idx)

new_grid = grid_start + """
              {VIDEOS.map((video, index) => (
                <motion.div 
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg border border-[#E2E8F0] bg-black"
                >
                  {activeVideo !== video.id ? (
                    <div className="absolute inset-0 cursor-pointer group" onClick={() => setActiveVideo(video.id)}>
                      <img src={`https://drive.google.com/thumbnail?id=${video.id}&sz=w1000`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={video.title} referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center group-hover:bg-[#1E4DB7] transition-colors">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute w-full h-[calc(100%+120px)] top-[-60px] left-0 bg-black">
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
                    </div>
                  )}
                </motion.div>
              ))}
"""

content = content[:grid_start_idx] + new_grid + content[grid_end_idx:]

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("Done")
