const fs = require('fs');

let layout = fs.readFileSync('src/components/Layout.tsx', 'utf8');
layout = layout.replace('className="flex flex-col hidden sm:flex"', 'className="flex flex-col"');
layout = layout.replace('className="font-bold text-[15px] leading-tight text-[#0F172A]">Kỷ Nguyên Era', 'className="font-bold text-sm sm:text-[15px] leading-tight text-[#0F172A]">Kỷ Nguyên Era');
layout = layout.replace('className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Chi nhánh Phú Hoà', 'className="text-[9px] sm:text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Chi nhánh Phú Hoà');
fs.writeFileSync('src/components/Layout.tsx', layout);

let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
// Fix gap
home = home.replace('className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"', 'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8"');
// Fix padding
home = home.replace('className={`group relative p-8 rounded-[32px]', 'className={`group relative p-6 sm:p-8 rounded-[24px] sm:rounded-[32px]');
// Fix icon
home = home.replace('w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-6', 'w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} text-white flex items-center justify-center mb-4 sm:mb-6');
// Fix title
home = home.replace('className="text-xl font-bold text-[#0F172A] mb-3 group-hover:text-white', 'className="text-lg sm:text-xl font-bold text-[#0F172A] mb-2 sm:mb-3 group-hover:text-white');
// Fix desc
home = home.replace('className="text-[#64748B] text-[15px] leading-relaxed group-hover:text-white/90', 'className="text-[#64748B] text-sm sm:text-[15px] leading-relaxed group-hover:text-white/90');

fs.writeFileSync('src/pages/Home.tsx', home);
console.log('Patched');
