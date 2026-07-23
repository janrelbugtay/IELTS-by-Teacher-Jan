with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

content = content.replace('className="max-w-[1400px] mx-auto"', 'className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"')

# Also let's fix the h1 text sizes to fit better on mobile.
content = content.replace('className="text-5xl sm:text-6xl lg:text-[64px] font-extrabold text-[#0F172A] leading-[1.1] mb-8 tracking-tight"', 'className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold text-[#0F172A] leading-[1.1] mb-8 tracking-tight"')
content = content.replace('<span className="text-[40px] sm:text-5xl lg:text-6xl text-[#64748B] font-bold mt-2 block">', '<span className="text-3xl sm:text-4xl lg:text-6xl text-[#64748B] font-bold mt-2 block">')

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("Done")
