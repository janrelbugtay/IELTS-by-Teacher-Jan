const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('import { Dashboard as KetDashboard }')) {
  content = content.replace(
    "import { Dashboard as PetDashboard } from './pages/pet/Dashboard';",
    "import { Dashboard as PetDashboard } from './pages/pet/Dashboard';\nimport { Dashboard as KetDashboard } from './pages/ket/Dashboard';"
  );
}

if (!content.includes('path="/ket/dashboard"')) {
  content = content.replace(
    "<Route path=\"/pet/dashboard\" element={<ProtectedRoute><PetDashboard /></ProtectedRoute>} />",
    "<Route path=\"/pet/dashboard\" element={<ProtectedRoute><PetDashboard /></ProtectedRoute>} />\n              <Route path=\"/ket/dashboard\" element={<ProtectedRoute><KetDashboard /></ProtectedRoute>} />"
  );
}

if (!content.includes('userCourse?.toLowerCase() === \'ket\'')) {
  content = content.replace(
    "if (userCourse?.toLowerCase() === 'pet') {\n      return <Navigate to=\"/pet/dashboard\" replace />;\n    }",
    "if (userCourse?.toLowerCase() === 'pet') {\n      return <Navigate to=\"/pet/dashboard\" replace />;\n    }\n    if (userCourse?.toLowerCase() === 'ket') {\n      return <Navigate to=\"/ket/dashboard\" replace />;\n    }"
  );
}

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx with proper imports");
