import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import WebSocket from 'ws';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Ignore local .env tokens for OpenClaw connection, fetch the real one directly from the CLI
  let token;
  try {
    token = execSync('openclaw config get gateway.auth.token').toString().trim();
  } catch (err) {
    console.error('Failed to get OpenClaw token', err);
    return new Response('Internal Server Error: No token', { status: 500 });
  }

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const pingInterval = setInterval(() => {
    writer.write(encoder.encode(': ping\n\n')).catch(() => {});
  }, 15000);

  const ws = new WebSocket('ws://127.0.0.1:18789/', {
    headers: {
      Origin: 'http://127.0.0.1:18789'
    }
  });

  ws.onopen = () => {
    console.log('[SSE] Connected to OpenClaw WS');
    ws.send(JSON.stringify({
      type: 'req',
      id: 'req_1',
      method: 'connect',
      params: {
        role: 'operator',
        minProtocol: 3,
        maxProtocol: 3,
        scopes: ['operator.admin', 'operator.read', 'operator.write'],
        client: { id: 'openclaw-control-ui', version: '1.0', platform: 'webchat', mode: 'webchat' },
        auth: { token }
      }
    }));
  };

  let pollInterval: NodeJS.Timeout | null = null;

  ws.onmessage = (event) => {
    const data = event.data.toString();
    try {
      const parsed = JSON.parse(data);
      
      // If we just successfully connected, start polling
      if (parsed.id === 'req_1' && (parsed.ok || !parsed.error)) {
        pollInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'req',
              id: 'log_req',
              method: 'logs.tail',
              params: { limit: 10 }
            }));
            ws.send(JSON.stringify({
              type: 'req',
              id: 'stat_req',
              method: 'status',
              params: {}
            }));
          }
        }, 2000);
      }

      writer.write(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`));
    } catch (e) {
      // Not JSON or error
    }
  };

  ws.onclose = () => {
    console.log('[SSE] OpenClaw WS closed');
    clearInterval(pingInterval);
    if (pollInterval) clearInterval(pollInterval);
    writer.close().catch(() => {});
  };

  ws.onerror = (err) => {
    console.error('[SSE] OpenClaw WS error');
    clearInterval(pingInterval);
    if (pollInterval) clearInterval(pollInterval);
    writer.close().catch(() => {});
  };

  request.signal.addEventListener('abort', () => {
    console.log('[SSE] Client aborted');
    clearInterval(pingInterval);
    if (pollInterval) clearInterval(pollInterval);
    ws.close();
    writer.close().catch(() => {});
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
