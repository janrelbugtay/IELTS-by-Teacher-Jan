import re
with open('src/components/CustomAudioPlayer.tsx', 'r') as f:
    content = f.read()

replacement = """
    return (
      <div className="w-full max-w-[600px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: '120px' }}>
        <iframe src={`https://drive.google.com/file/d/${driveId}/preview`} width="100%" height="100%" style={{ border: 'none' }} allow="autoplay" />
      </div>
    );
"""

content = re.sub(r'return \(\s*<div className="flex items-center gap-4 bg-white rounded-full px-2 py-1 shadow-sm border border-gray-200" style={{ width: \'320px\', height: \'60px\', overflow: \'hidden\' }}>\s*<iframe src={`https://drive\.google\.com/file/d/\$\{driveId\}/preview`} width="100%" height="100%" style={{ border: \'none\', borderRadius: \'24px\' }} allow="autoplay" />\s*</div>\s*\);', replacement.strip(), content)

with open('src/components/CustomAudioPlayer.tsx', 'w') as f:
    f.write(content)
print("Done")
