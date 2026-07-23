import re

with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

# We want to insert an absolute div right before the iframe.
# The motion.div has className="w-full aspect-video rounded-3xl overflow-hidden shadow-lg border border-[#E2E8F0]"
# Wait, let's just make it relative if it's not already, wait, it doesn't have relative.
# So we add relative to the motion.div className and insert the overlay before iframe.

def replacer(match):
    prefix = match.group(1) # up to className="..."
    class_name = match.group(2)
    suffix = match.group(3) # >\n                <iframe
    
    new_class_name = class_name
    if "relative" not in new_class_name:
        new_class_name = class_name.replace('className="', 'className="relative ')
        
    return prefix + new_class_name + suffix.replace(
        '<iframe', 
        '<div className="absolute top-0 left-0 right-0 h-[60px] z-10 bg-transparent"></div>\n                <iframe'
    )

new_content = re.sub(
    r'(className="[^"]*w-full aspect-video rounded-3xl overflow-hidden shadow-lg border border-\[#E2E8F0\][^"]*")(\s*>\s*)<iframe',
    replacer,
    content
)

with open('src/pages/Home.tsx', 'w') as f:
    f.write(new_content)
print("Done")
