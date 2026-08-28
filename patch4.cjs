const fs = require('fs');
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');
home = home.replace(
  '<div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>',
  `<div className={\`absolute top-0 left-0 right-0 h-1 sm:hidden bg-gradient-to-r \${feature.color}\`}></div>
                <div className={\`absolute inset-0 bg-gradient-to-br \${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500\`}></div>`
);
fs.writeFileSync('src/pages/Home.tsx', home);
console.log('Patched 4');
