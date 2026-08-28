const fs = require('fs');
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
home = home.replace('className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold', 'className="text-3xl sm:text-5xl lg:text-[64px] font-extrabold');
home = home.replace('className="text-[#64748B] text-lg sm:text-xl mb-8 sm:mb-10', 'className="text-[#64748B] text-base sm:text-xl mb-8 sm:mb-10');
home = home.replace('className="text-3xl sm:text-[40px] font-bold text-[#0F172A]', 'className="text-2xl sm:text-[40px] font-bold text-[#0F172A]');
home = home.replace('className="text-3xl sm:text-[40px] font-bold text-[#0F172A] mb-4', 'className="text-2xl sm:text-[40px] font-bold text-[#0F172A] mb-4');
home = home.replace('className="text-3xl sm:text-[40px] font-bold mb-6', 'className="text-2xl sm:text-[40px] font-bold mb-6');
fs.writeFileSync('src/pages/Home.tsx', home);
console.log('Patched 3');
