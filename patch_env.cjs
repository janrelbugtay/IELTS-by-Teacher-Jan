const fs = require('fs');
let envExample = fs.readFileSync('.env.example', 'utf8');

envExample = envExample.replace('# VITE_GOOGLE_CLIENT_ID: Google OAuth Client ID\nVITE_GOOGLE_CLIENT_ID=""\n\n# Custom Google Drive Integration (Service Account)\n# GOOGLE_SERVICE_ACCOUNT_JSON must be the full JSON string of the service account key\nGOOGLE_SERVICE_ACCOUNT_JSON=\nGOOGLE_DRIVE_FOLDER_ID=1d2io0UUmFF6OItoG_HybPZLe_noI5uxy', '');
fs.writeFileSync('.env.example', envExample);
