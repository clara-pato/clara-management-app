const WebSocket = require('ws');
const { execSync } = require('child_process');

let token = execSync('openclaw config get gateway.auth.token').toString().trim();

const ws = new WebSocket('ws://127.0.0.1:18789/', {
  headers: {
    Origin: 'http://localhost:3000'
  }
});

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'req',
    id: 'req_1',
    method: 'connect',
    params: {
      role: 'operator',
      minProtocol: 3,
      maxProtocol: 3,
      client: { id: 'openclaw-control-ui', version: '1.0', platform: 'webchat', mode: 'webchat' },
      auth: { token }
    }
  }));
});

ws.on('message', (data) => {
  console.log('Msg:', data.toString());
  const parsed = JSON.parse(data.toString());
  if(parsed.id === 'req_1' && parsed.ok) { process.exit(0); }
  else if(parsed.error) { process.exit(1); }
});
