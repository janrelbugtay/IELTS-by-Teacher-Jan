const fs = require('fs');
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
home = home.replace('className="p-8 flex flex-col flex-1"', 'className="p-5 sm:p-8 flex flex-col flex-1"');
home = home.replace('className="text-2xl font-bold text-[#0F172A] mb-3 group-hover:text-[#2563EB]', 'className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-2 sm:mb-3 group-hover:text-[#2563EB]');
home = home.replace('className="text-[#64748B] text-[15px] leading-relaxed mb-8 flex-1"', 'className="text-[#64748B] text-sm sm:text-[15px] leading-relaxed mb-6 sm:mb-8 flex-1"');
fs.writeFileSync('src/pages/Home.tsx', home);
console.log('Patched 2');
