with open('src/components/CustomAudioPlayer.tsx', 'r') as f:
    content = f.read()

content = content.replace("height: '120px'", "height: '140px'")

with open('src/components/CustomAudioPlayer.tsx', 'w') as f:
    f.write(content)
print("Done")
