// JOV Gateway — src/gateway/server.ts
// WebSocket control plane for JOV

import chalk from 'chalk';
import { loadConfig } from '../config.js';

const L = chalk.hex('#84ff00')('⚡');

interface GatewayOpts {
  port?: string;
  verbose?: boolean;
  daemon?: boolean;
}

export async function startGateway(opts: GatewayOpts) {
  const config = loadConfig();
  const port = parseInt(opts.port || String(config.gateway?.port || 18789));
  const bind = config.gateway?.bind || '127.0.0.1';

  console.log();
  console.log(chalk.hex('#84ff00')('  ╔════════════════════════════════════════╗'));
  console.log(chalk.hex('#84ff00')('  ║') + `  ${L}  ${chalk.bold.hex('#84ff00')('JOV')} Gateway                    ${chalk.hex('#84ff00')('║')}`);
  console.log(chalk.hex('#84ff00')('  ╚════════════════════════════════════════╝'));
  console.log();

  const express = (await import('express')).default;
  const { WebSocketServer } = await import('ws');
  const { createServer } = await import('http');

  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Health endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      name: 'jov-gateway',
      version: '2026.2.12',
      model: config.agent.model,
      uptime: process.uptime(),
    });
  });

  // Status endpoint
  app.get('/status', (_req, res) => {
    res.json({
      gateway: { port, bind },
      agent: { model: config.agent.model },
      channels: Object.entries(config.channels || {})
        .filter(([_, v]: any) => v?.enabled !== false)
        .map(([k]) => k),
      sessions: sessions.size,
      nodes: [],
    });
  });

  // Session tracking
  const sessions = new Map<string, { id: string; connected: Date; lastMessage?: Date }>();

  // WebSocket connections
  wss.on('connection', (ws, req) => {
    const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    sessions.set(id, { id, connected: new Date() });

    if (opts.verbose) {
      console.log(chalk.dim(`  ← ws connect: ${id}`));
    }

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());
        const session = sessions.get(id);
        if (session) session.lastMessage = new Date();

        if (opts.verbose) {
          console.log(chalk.dim(`  ← ${id}: ${msg.method || msg.type || 'message'}`));
        }

        // Handle agent messages
        if (msg.method === 'agent.send' || msg.type === 'message') {
          const reply = await handleAgentMessage(msg.content || msg.message, config);
          ws.send(JSON.stringify({ type: 'agent.reply', content: reply, sessionId: id }));
        }

        // Handle ping
        if (msg.method === 'ping' || msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (e: any) {
        ws.send(JSON.stringify({ type: 'error', message: e.message }));
      }
    });

    ws.on('close', () => {
      sessions.delete(id);
      if (opts.verbose) console.log(chalk.dim(`  → ws disconnect: ${id}`));
    });

    // Send welcome
    ws.send(
      JSON.stringify({
        type: 'welcome',
        sessionId: id,
        gateway: { name: 'jovebot', version: '2026.2.12', model: config.agent.model },
      })
    );
  });

  server.listen(port, bind, () => {
    console.log(`  ${chalk.green('●')} Gateway running on ${chalk.bold(`ws://${bind}:${port}`)}`);
    console.log(`  ${chalk.dim('●')} Health: ${chalk.dim(`http://${bind}:${port}/health`)}`);
    console.log(`  ${chalk.dim('●')} Model: ${chalk.white(config.agent.model)}`);
    console.log(`  ${chalk.dim('●')} API: ${config.grok?.apiKey ? chalk.green('configured') : chalk.hex('#84ff00')('not set')}`);
    console.log();
    console.log(chalk.dim('  Press Ctrl+C to stop'));
    console.log();
  });
}

async function handleAgentMessage(content: string, config: any): Promise<string> {
  const apiKey = config.grok?.apiKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  const model = config.agent.model || 'grok-3';
  const baseUrl = config.grok?.baseUrl || 'https://api.x.ai/v1';

  if (!apiKey) return '[JOV] No Grok API key configured. Run: jovebot config --set grok.apiKey=YOUR-KEY';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are JOV ⚡ — a personal AI assistant powered by Grok.' },
        { role: 'user', content },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`Grok API ${response.status}`);
  const data = (await response.json()) as any;
  return data.choices?.[0]?.message?.content || '(no response)';
}
