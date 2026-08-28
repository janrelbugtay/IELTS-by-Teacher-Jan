const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Replace the pill with the dropdown
const pillRegex = /<div className="flex bg-slate-100 rounded-full p-1 gap-1">[\s\S]*?<\/div>/;

const dropdownContent = `
                  <div className="relative">
                    <button 
                      onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                      className="p-2 rounded-full hover:bg-slate-100 text-[#64748B] hover:text-[#0F172A] transition-colors flex items-center justify-center bg-slate-50 border border-slate-200"
                      title="Theme Settings"
                    >
                      {theme === 'light' ? <Sun className="w-5 h-5"/> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                    </button>
                    <AnimatePresence>
                      {themeMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 w-40 z-50 overflow-hidden"
                        >
                          <button onClick={() => {setTheme('light'); setThemeMenuOpen(false);}} className={\`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-sm transition-colors \${theme === 'light' ? 'text-[#2563EB] font-medium bg-blue-50/50' : 'text-slate-700'}\`}>
                            <Sun className="w-4 h-4" /> Light Mode
                          </button>
                          <button onClick={() => {setTheme('dark'); setThemeMenuOpen(false);}} className={\`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-sm transition-colors \${theme === 'dark' ? 'text-[#2563EB] font-medium bg-blue-50/50' : 'text-slate-700'}\`}>
                            <Moon className="w-4 h-4" /> Dark Mode
                          </button>
                          <button onClick={() => {setTheme('picture'); setThemeMenuOpen(false);}} className={\`w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-3 text-sm transition-colors \${theme === 'picture' ? 'text-[#2563EB] font-medium bg-blue-50/50' : 'text-slate-700'}\`}>
                            <ImageIcon className="w-4 h-4" /> Color Mode
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>`;

content = content.replace(pillRegex, dropdownContent);

// Also add state for themeMenuOpen
if (!content.includes('const [themeMenuOpen')) {
  content = content.replace(/const \[userMenuOpen, setUserMenuOpen\] = useState\(false\);/, "const [userMenuOpen, setUserMenuOpen] = useState(false);\n  const [themeMenuOpen, setThemeMenuOpen] = useState(false);");
}

fs.writeFileSync('src/components/Layout.tsx', content);
console.log('Layout patched');
