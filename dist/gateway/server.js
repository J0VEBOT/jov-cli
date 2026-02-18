import chalk from 'chalk';
import { loadConfig } from '../config.js';

const G = chalk.hex('#84ff00');
const L = G('⚡');

export async function startGateway(opts) {
  const config = loadConfig();
  const port = parseInt(opts.port || String(config.gateway?.port || 18789));
  const bind = config.gateway?.bind || '127.0.0.1';

  console.log();
  console.log(G('  ╔════════════════════════════════════════╗'));
  console.log(G('  ║') + `  ${L}  ${chalk.bold.hex('#84ff00')('J0VEBOT')} Gateway               ${G('║')}`);
  console.log(G('  ╚════════════════════════════════════════╝'));
  console.log();

  const express = (await import('express')).default;
  const { WebSocketServer } = await import('ws');
  const { createServer } = await import('http');

  const app = express();
  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  app.use((req, res, next) => { res.setHeader('X-Powered-By', 'J0VEBOT'); next(); });

  // Health
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', name: 'j0vebot-gateway', version: '1.0.0',
      model: config.agent.model, uptime: process.uptime(), token: '$JOV',
      contract: '9Pgz2xfquZy3quM4mNVt7qf8B1t9NNgd2ENHU7Hrjove' });
  });

  // Status
  app.get('/status', (_req, res) => {
    res.json({ gateway: { port, bind }, agent: { model: config.agent.model },
      channels: Object.entries(config.channels || {}).filter(([_, v]) => v?.enabled !== false).map(([k]) => k),
      sessions: sessions.size, skills: ['integrating-jupiter'] });
  });

  // Skills endpoint
  app.get('/skills', (_req, res) => {
    res.json({ skills: [
      { name: 'integrating-jupiter', apis: 15, source: 'J0VEBOT/agent-skills',
        install: 'npx add-skill J0VEBOT/agent-skills' }
    ]});
  });

  const sessions = new Map();

  wss.on('connection', (ws, req) => {
    const id = `jov-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    sessions.set(id, { id, connected: new Date() });
    if (opts.verbose) console.log(chalk.dim(`  ← connect: ${id}`));

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());
        const session = sessions.get(id);
        if (session) session.lastMessage = new Date();
        if (opts.verbose) console.log(chalk.dim(`  ← ${id}: ${msg.method || msg.type}`));

        if (msg.method === 'agent.send' || msg.type === 'message') {
          const reply = await handleAgentMessage(msg.content || msg.message, config);
          ws.send(JSON.stringify({ type: 'agent.reply', content: reply, sessionId: id }));
        }
        if (msg.method === 'ping' || msg.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
        if (msg.method === 'swap' || msg.type === 'swap') {
          ws.send(JSON.stringify({ type: 'swap.ack', message: 'Route to Jupiter Ultra API', sessionId: id }));
        }
      } catch (e) {
        ws.send(JSON.stringify({ type: 'error', message: e.message }));
      }
    });

    ws.on('close', () => { sessions.delete(id); });

    ws.send(JSON.stringify({
      type: 'welcome', sessionId: id,
      gateway: { name: 'j0vebot', version: '1.0.0', model: config.agent.model, token: '$JOV' },
    }));
  });

  server.listen(port, bind, () => {
    console.log(`  ${chalk.green('●')} Gateway running on ${chalk.bold(`ws://${bind}:${port}`)}`);
    console.log(`  ${chalk.dim('●')} Health: ${chalk.dim(`http://${bind}:${port}/health`)}`);
    console.log(`  ${chalk.dim('●')} Skills: ${chalk.dim(`http://${bind}:${port}/skills`)}`);
    console.log(`  ${chalk.dim('●')} Model:  ${chalk.white(config.agent.model)}`);
    console.log(`  ${chalk.dim('●')} Token:  ${G('$JOV')} on Solana`);
    console.log(`  ${chalk.dim('●')} API:    ${config.grok?.apiKey ? chalk.green('configured') : chalk.yellow('not set — run: jovebot onboard')}`);
    console.log();
    console.log(chalk.dim('  Press Ctrl+C to stop'));
    console.log();
  });
}

async function handleAgentMessage(content, config) {
  const apiKey = config.grok?.apiKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  const model = config.agent.model || 'grok-3';
  const baseUrl = config.grok?.baseUrl || 'https://api.x.ai/v1';

  if (!apiKey) return '[J0VEBOT] No Grok API key. Run: jovebot config --set grok.apiKey=YOUR-KEY';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model, temperature: 0.7,
      messages: [
        { role: 'system', content: 'You are J0VEBOT ⚡ — an autonomous Jupiter agent on Solana. You have access to 15 Jupiter APIs: Ultra Swap, Lend, Perps, Trigger, Recurring, Token, Price, Portfolio, Predictions, Send, Studio, Lock, Routing, RFQ. You are sharp, precise, and execute trades with zero hesitation. $JOV token. Contract: 9Pgz2xfquZy3quM4mNVt7qf8B1t9NNgd2ENHU7Hrjove.' },
        { role: 'user', content },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Grok API ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '(no response)';
}
