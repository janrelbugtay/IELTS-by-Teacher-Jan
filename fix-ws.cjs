const fs = require('fs');
let content = fs.readFileSync('src/components/LiveSpeakingTestScreen.tsx', 'utf8');
content = content.replace('const ws = new WebSocket(`wss://${location.host}/live`);', 'const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";\n      const ws = new WebSocket(`${protocol}//${window.location.host}/live`);');
fs.writeFileSync('src/components/LiveSpeakingTestScreen.tsx', content);
console.log('Fixed websocket URL');
