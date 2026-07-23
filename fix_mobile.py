with open('src/pages/Home.tsx', 'r') as f:
    content = f.read()

content = content.replace('className="text-[36px] sm:text-5xl lg:text-[64px] font-extrabold text-[#0F172A] leading-tight sm:leading-[1.1] mb-6 sm:mb-8 tracking-tight"', 'className="text-3xl sm:text-5xl lg:text-[64px] font-extrabold text-[#0F172A] leading-tight sm:leading-[1.1] mb-4 sm:mb-8 tracking-tight"')
content = content.replace('<span className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl text-[#64748B] font-bold mt-2 block">from Pre-Starter to IELTS</span>', '<span className="text-xl sm:text-4xl lg:text-5xl xl:text-6xl text-[#64748B] font-bold mt-2 block">from Pre-Starter to IELTS</span>')
content = content.replace('inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-[#2563EB] font-semibold text-sm mb-8 border border-blue-100 shadow-sm', 'inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-50 text-[#2563EB] font-semibold text-xs sm:text-sm mb-6 sm:mb-8 border border-blue-100 shadow-sm text-center')

# Also the videos padding on mobile
content = content.replace('text-[32px]', 'text-2xl sm:text-[32px]')
content = content.replace('text-[40px]', 'text-3xl sm:text-[40px]')

with open('src/pages/Home.tsx', 'w') as f:
    f.write(content)
print("Done")
