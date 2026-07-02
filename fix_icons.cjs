const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf-8');

const importRegex = /import \{([^}]+)\} from 'lucide-react';/;
code = code.replace(importRegex, "import {$1, Facebook, Instagram, Youtube} from 'lucide-react';");

const tiktokComponent = `
const TiktokIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 448 512" 
    className={className}
    fill="currentColor"
  >
    <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
  </svg>
);
`;

code = code.replace("export function Layout", tiktokComponent + "\nexport function Layout");

const replacement = `                {/* Social icons placeholders */}
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#1877F2] hover:border-[#1877F2] transition-colors">
                  <span className="sr-only">Facebook</span>
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#000000] hover:border-[#000000] transition-colors">
                  <span className="sr-only">TikTok</span>
                  <TiktokIcon className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#E4405F] hover:border-[#E4405F] transition-colors">
                  <span className="sr-only">Instagram</span>
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#FF0000] hover:border-[#FF0000] transition-colors">
                  <span className="sr-only">YouTube</span>
                  <Youtube className="w-5 h-5" />
                </a>`;

code = code.replace(/\{\/\* Social icons placeholders \*\/\}[\s\S]*?\)\)\}/, replacement);

fs.writeFileSync('src/components/Layout.tsx', code);
