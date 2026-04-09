const WebSocket = require('ws');
const { execSync } = require('child_process');
let token = execSync('openclaw config get gateway.auth.token').toString().trim();
const ws = new WebSocket('ws://127.0.0.1:18789/', { headers: { Origin: 'http://localhost:3000' }});
ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'req', id: 'req_1', method: 'connect',
    params: { role: 'operator', minProtocol: 3, maxProtocol: 3, client: { id: 'gateway-client', version: '1.0', platform: 'node', mode: 'backend' }, auth: { token } }
  }));
});
ws.on('message', (d) => {
  console.log('Msg:', d.toString());
  const parsed = JSON.parse(d.toString());
  if (parsed.id === 'req_1' && parsed.ok) process.exit(0);
  if (parsed.error) process.exit(1);
});
