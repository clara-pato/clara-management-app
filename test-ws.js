const WebSocket = require('ws');
const { execSync } = require('child_process');

let token;
try {
  token = execSync('openclaw config get gateway.auth.token').toString().trim();
} catch (err) {
  console.error('Failed to get token', err);
  process.exit(1);
}

const ws = new WebSocket('ws://127.0.0.1:18789/');

ws.on('open', () => {
  console.log('Connected');
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
  console.log('Message:', data.toString());
  const parsed = JSON.parse(data.toString());
  if (parsed.type === 'evt' && parsed.method === 'connect.challenge') {
    console.log('Got challenge, trying to respond or wait');
    // For local operator, maybe we send connect.challenge_response?
    // Let's see if we get req_1 ok anyway.
  }
  if (parsed.id === 'req_1' && parsed.ok) {
    console.log('req_1 ok!');
    process.exit(0);
  }
  if (parsed.error) {
    console.log('Error:', parsed.error);
    process.exit(1);
  }
});
