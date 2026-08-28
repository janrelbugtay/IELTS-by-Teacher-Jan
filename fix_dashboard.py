import re

with open('src/pages/ielts/Dashboard.tsx', 'r') as f:
    content = f.read()

bad = """      {/* Welcome Section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-10 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
        <div className="relative z-10 flex items-center gap-6 md:gap-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-4 border-white/20 shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL || undefined} alt="Profile" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
            ) : (
              <span className="text-4xl md:text-5xl font-bold text-white">{firstName.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">"""

good = """      {/* Welcome Section */}
      <section className="flex flex-col lg:flex-row justify-between items-center lg:items-center gap-6 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-6 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden group text-center md:text-left">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 w-full">
          <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-4 border-white/20 shadow-2xl overflow-hidden flex items-center justify-center shrink-0 mx-auto md:mx-0">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL || undefined} alt="Profile" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
            ) : (
              <span className="text-3xl md:text-5xl font-bold text-white">{firstName.charAt(0)}</span>
            )}
          </div>
          <div className="flex flex-col items-center md:items-start w-full">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-3">"""

if bad in content:
    content = content.replace(bad, good)
    
bad_h1 = """            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2 tracking-tight">"""
good_h1 = """            <h1 className="text-2xl md:text-5xl font-extrabold text-white leading-tight mb-2 tracking-tight">"""
content = content.replace(bad_h1, good_h1)

bad_p = """            <p className="text-blue-100 text-lg md:text-xl font-medium max-w-lg">"""
good_p = """            <p className="text-blue-100 text-base md:text-xl font-medium max-w-lg">"""
content = content.replace(bad_p, good_p)

with open('src/pages/ielts/Dashboard.tsx', 'w') as f:
    f.write(content)
print("done")
