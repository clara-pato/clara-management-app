import { NextResponse } from 'next/server';
import fs from 'fs';
import os from 'os';
import path from 'path';
import WebSocket from 'ws';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  let token;
  try {
    const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    token = configData?.gateway?.auth?.token;
    if (!token) throw new Error('No token found in config');
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
        scopes: ['operator.read'],
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
      console.log('[SSE] WS msg:', JSON.stringify(parsed));
      
      // If we just successfully connected, start polling
      if (parsed.id === 'req_1' && (parsed.ok || !parsed.error)) {
        console.log('[SSE] Auth successful, starting poll');
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
      } else if (parsed.id === 'req_1' && parsed.error) {
        console.error('[SSE] Auth failed:', parsed.error);
      }

      writer.write(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`));
    } catch (e) {
      console.error('[SSE] JSON parse error on WS message:', e);
    }
  };

  ws.onclose = () => {
    console.log('[SSE] OpenClaw WS closed');
    clearInterval(pingInterval);
    if (pollInterval) clearInterval(pollInterval);
    writer.close().catch(() => {});
  };

  ws.onerror = (err) => {
    console.error('[SSE] OpenClaw WS error', err);
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
