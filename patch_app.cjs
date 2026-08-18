const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import { KETDashboard }')) {
  content = content.replace(
    "import { PETDashboard } from './pages/pet/Dashboard';",
    "import { PETDashboard } from './pages/pet/Dashboard';\nimport { KETDashboard } from './pages/ket/Dashboard';"
  );
}

if (!content.includes('path="/ket/dashboard"')) {
  content = content.replace(
    "<Route path=\"/pet/dashboard\" element={<PETDashboard />} />",
    "<Route path=\"/pet/dashboard\" element={<PETDashboard />} />\n              <Route path=\"/ket/dashboard\" element={<KETDashboard />} />"
  );
}

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx");
