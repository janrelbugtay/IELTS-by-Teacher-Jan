with open('src/components/CustomAudioPlayer.tsx', 'r') as f:
    content = f.read()

# Remove the incorrectly inserted block
import re
content = re.sub(r'// Extract ID from src.*?return \(\n.*?\n.*?\n.*?\);\n  }', '', content, flags=re.DOTALL)

# Find the real return statement for the component
replacement = """
  // Extract ID from src
  let driveId = '';
  if (src && src.includes('?id=')) {
    driveId = src.split('?id=')[1].split('&')[0];
  } else if (src && src.includes('file/d/')) {
    driveId = src.split('file/d/')[1].split('/')[0];
  }

  if (driveId) {
    return (
      <div className="flex items-center gap-4 bg-white rounded-full px-2 py-1 shadow-sm border border-gray-200" style={{ width: '320px', height: '60px', overflow: 'hidden' }}>
        <iframe src={`https://drive.google.com/file/d/${driveId}/preview`} width="100%" height="100%" style={{ border: 'none', borderRadius: '24px' }} allow="autoplay" />
      </div>
    );
  }
"""

content = content.replace('  return (\n    <div className="flex items-center', replacement + '\n  return (\n    <div className="flex items-center', 1)

with open('src/components/CustomAudioPlayer.tsx', 'w') as f:
    f.write(content)
print("Done")
