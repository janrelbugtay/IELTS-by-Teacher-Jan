import sys

with open("src/pages/CourseDetails.tsx", "r") as f:
    content = f.read()

# Replace the conditional render
old_render = """            {folder.externalLink ? (
              <a 
                href={folder.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`block h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${folder.color}`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </a>
            ) : ("""

new_render = """            {folder.link ? (
              <Link 
                to={folder.link}
                className={`block h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${folder.color}`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </Link>
            ) : folder.externalLink ? (
              <a 
                href={folder.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`block h-full p-8 rounded-[24px] border shadow-sm hover:shadow-lg transition-all duration-300 bg-white group hover:-translate-y-1 cursor-pointer`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${folder.color}`}>
                  {folder.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{folder.title}</h3>
                <p className="text-[#64748B] text-[15px]">{folder.desc}</p>
              </a>
            ) : ("""

content = content.replace(old_render, new_render)

with open("src/pages/CourseDetails.tsx", "w") as f:
    f.write(content)
