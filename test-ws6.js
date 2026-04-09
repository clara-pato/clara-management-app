const WebSocket = require('ws');
const { execSync } = require('child_process');
let token = execSync('openclaw config get gateway.auth.token').toString().trim();
const ws = new WebSocket('ws://127.0.0.1:18789/');
ws.on('open', () => {});
ws.on('message', (d) => {
  const parsed = JSON.parse(d.toString());
  if (parsed.event === 'connect.challenge') {
    ws.send(JSON.stringify({
      type: 'req', id: 'req_1', method: 'connect',
      params: { 
        role: 'operator', minProtocol: 3, maxProtocol: 3, 
        client: { id: 'node-host', version: '1.0', platform: 'node', mode: 'node' }, 
        auth: { token } 
      }
    }));
  }
  if (parsed.id === 'req_1') {
     console.log('Got req_1 response:', JSON.stringify(parsed, null, 2));
     process.exit(parsed.ok ? 0 : 1);
  }
});
