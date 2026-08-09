const fs = require('fs');
let content = fs.readFileSync('src/pages/CourseDetails.tsx', 'utf8');

const target = `            ) : folder.externalLink ? (
              <a 
                href={folder.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className={\`block h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer\`}
              >
                <div className={\`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 \${folder.color}\`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </a>
            ) : (
              <div 
                className={\`block h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer\`}
              >`;

const replacement = `            ) : folder.externalLink ? (
              <a 
                href={folder.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className={\`block h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer\`}
              >
                <div className={\`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 \${folder.color}\`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </a>
            ) : folder.action ? (
              <button 
                onClick={folder.action}
                className={\`block w-full text-left h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer\`}
              >
                <div className={\`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 \${folder.color}\`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </button>
            ) : (
              <div 
                className={\`block h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer\`}
              >`;

content = content.replace(target, replacement);
fs.writeFileSync('src/pages/CourseDetails.tsx', content);
