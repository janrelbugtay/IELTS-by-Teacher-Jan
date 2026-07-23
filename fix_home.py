import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

videos_data = """
const VIDEOS = [
  { id: '1m3tRXayFhFQGk7P4TgtK0Vc1kwNvk6-V', title: 'Life at Ky Nguyen Era Video 1' },
  { id: '1ec3Ee5VTwWkep1L4-strCnOx3evHoE0e', title: 'Life at Ky Nguyen Era Video 2' },
  { id: '1G39tMBVChShT-bU52uwjHqZV7NYwduhr', title: 'Life at Ky Nguyen Era Video 3' },
  { id: '1jmkstraxzjwScvee4npqHGiRJOHp1DzA', title: 'Life at Ky Nguyen Era Video 4' },
  { id: '1UV_enof7q1KvsshgHkSE1ly5qOZKSLBc', title: 'Life at Ky Nguyen Era Video 5' },
  { id: '1nlYKmV4DLV3xIqRTSYM_AOvvj9ig_qBJ', title: 'Life at Ky Nguyen Era Video 6' },
];

export function Home() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
"""

if 'const [activeVideo' not in content:
    content = content.replace('export function Home() {', videos_data)
else:
    # If VIDEOS missing but state is there?
    pass

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("Done")
