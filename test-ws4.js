const WebSocket = require('ws');
const { execSync } = require('child_process');
let token = execSync('openclaw config get gateway.auth.token').toString().trim();
const ws = new WebSocket('ws://127.0.0.1:18789/', { headers: { Origin: 'http://localhost:3000' }});
ws.on('open', () => {
});
ws.on('message', (d) => {
  console.log('Msg:', d.toString());
  setTimeout(() => process.exit(0), 1000);
});
