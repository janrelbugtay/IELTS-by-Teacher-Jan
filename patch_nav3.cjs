const fs = require('fs');
let content = fs.readFileSync('src/components/Layout.tsx', 'utf8');

const navLinkKet = `navLinks.push({ name: 'Dashboard', path: dashboardPath });`;
if (!content.includes('navLinks.push({ name: \'KET Score Calculator\', path: \'/ket/dashboard\' });')) {
  // Try another approach
}
