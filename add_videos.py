with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

new_videos = """              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="w-full aspect-video rounded-3xl overflow-hidden shadow-lg border border-[#E2E8F0]"
              >
                <iframe 
                  src="https://drive.google.com/file/d/1jmkstraxzjwScvee4npqHGiRJOHp1DzA/preview" 
                  width="100%" 
                  height="100%" 
                  allow="autoplay; fullscreen" 
                  allowFullScreen
                  title="Life at Ky Nguyen Era Video 4"
                  className="border-0"
                ></iframe>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="w-full aspect-video rounded-3xl overflow-hidden shadow-lg border border-[#E2E8F0]"
              >
                <iframe 
                  src="https://drive.google.com/file/d/1UV_enof7q1KvsshgHkSE1ly5qOZKSLBc/preview" 
                  width="100%" 
                  height="100%" 
                  allow="autoplay; fullscreen" 
                  allowFullScreen
                  title="Life at Ky Nguyen Era Video 5"
                  className="border-0"
                ></iframe>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="w-full aspect-video rounded-3xl overflow-hidden shadow-lg border border-[#E2E8F0]"
              >
                <iframe 
                  src="https://drive.google.com/file/d/1nlYKmV4DLV3xIqRTSYM_AOvvj9ig_qBJ/preview" 
                  width="100%" 
                  height="100%" 
                  allow="autoplay; fullscreen" 
                  allowFullScreen
                  title="Life at Ky Nguyen Era Video 6"
                  className="border-0"
                ></iframe>
              </motion.div>"""

old_str = """                  title="Life at Ky Nguyen Era Video 3"
                  className="border-0"
                ></iframe>
              </motion.div>"""

if old_str in content:
    content = content.replace(old_str, old_str.replace("              </motion.div>", new_videos))
    with open('src/pages/Home.tsx', 'w') as f:
        f.write(content)
    print("Successfully added videos")
else:
    print("Could not find anchor string")
