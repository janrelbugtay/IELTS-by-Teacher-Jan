const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

if (!content.includes('to="/ket/dashboard"')) {
  // Try another replacement if the first failed
  const alternativeNav = `<Link
                to="/pet/dashboard"
                className={\`flex items-center gap-3 px-4 py-3 rounded-xl`;
                
  if (content.includes(alternativeNav)) {
    // Just inject before it
    content = content.replace(alternativeNav, `<Link
                to="/ket/dashboard"
                className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group \${
                  location.pathname === '/ket/dashboard'
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm font-semibold'
                    : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 font-medium'
                }\`}
              >
                <div className={\`p-1.5 rounded-lg transition-colors \${
                  location.pathname === '/ket/dashboard'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }\`}>
                  <BookOpen className="w-5 h-5" />
                </div>
                KET Score Calculator
              </Link>
              ` + alternativeNav);
  }
}

fs.writeFileSync('src/components/Layout.tsx', content);
console.log("Patched nav again");
