import chalk from 'chalk';
import ora from 'ora';
import { loadConfig, saveConfig, ensureJovDir, CONFIG_PATH, JOV_DIR, WORKSPACE_PATH } from '../config.js';
import { createInterface } from 'readline';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const G = chalk.hex('#84ff00');
const L = G('⚡');

function ask(q) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(r => { rl.question(chalk.dim('  ❯ ') + q + ' ', a => { rl.close(); r(a.trim()); }); });
}

export async function onboard(opts) {
  console.log();
  console.log(G('  ╔══════════════════════════════════════════════╗'));
  console.log(G('  ║') + `  ${L}  ${chalk.bold.hex('#84ff00')('J0VEBOT')} — Setup Wizard                 ${G('║')}`);
  console.log(G('  ║') + `     Autonomous Jupiter Agent · ${chalk.white('$JOV')}            ${G('║')}`);
  console.log(G('  ╚══════════════════════════════════════════════╝'));
  console.log();

  const spinner = ora({ text: 'Initializing...', color: 'green' }).start();
  ensureJovDir();
  spinner.succeed('J0VEBOT directory created at ' + chalk.dim(JOV_DIR));

  console.log();
  console.log(G.bold('  Step 1: Grok API Configuration'));
  console.log(chalk.dim('  Get your API key from https://console.x.ai'));
  console.log();
  const apiKey = await ask('Grok API Key (xai-...):');
  if (!apiKey) {
    console.log(chalk.yellow('  ⚠ No API key. Set later: jovebot config --set grok.apiKey=xai-KEY'));
  }

  console.log();
  console.log(G.bold('  Step 2: Model Selection'));
  console.log(chalk.dim('  1. grok-3       (recommended)'));
  console.log(chalk.dim('  2. grok-3-mini  (faster)'));
  console.log(chalk.dim('  3. grok-2       (legacy)'));
  console.log();
  const mc = await ask('Select model [1-3, default: 1]:');
  const model = ['grok-3', 'grok-3-mini', 'grok-2'][parseInt(mc || '1') - 1] || 'grok-3';

  console.log();
  console.log(G.bold('  Step 3: Gateway'));
  const port = await ask('Gateway port [default: 18789]:');
  const gp = parseInt(port) || 18789;

  console.log();
  console.log(G.bold('  Step 4: Jupiter Agent Skills'));
  console.log(chalk.dim('  Install with: npx add-skill J0VEBOT/agent-skills'));
  console.log(chalk.dim('  15 Jupiter APIs: Swap, Lend, Perps, DCA, Token, Price...'));
  console.log();

  const config = loadConfig();
  config.agent.model = model;
  config.gateway = { ...config.gateway, port: gp };
  if (apiKey) config.grok = { ...config.grok, apiKey };
  saveConfig(config);

  const s2 = ora({ text: 'Saving...', color: 'green' }).start();
  await new Promise(r => setTimeout(r, 400));
  s2.succeed('Config saved to ' + chalk.dim(CONFIG_PATH));

  // Create workspace files
  const agentMd = join(WORKSPACE_PATH, 'AGENTS.md');
  const soulMd = join(WORKSPACE_PATH, 'SOUL.md');
  if (!existsSync(agentMd)) writeFileSync(agentMd, `# J0VEBOT Agent\n\nYou are J0VEBOT ⚡ — an autonomous Jupiter agent on Solana.\nYou have access to 15 Jupiter APIs. You execute trades, manage positions, and scan opportunities.\nContract: 9Pgz2xfquZy3quM4mNVt7qf8B1t9NNgd2ENHU7Hrjove\n`);
  if (!existsSync(soulMd)) writeFileSync(soulMd, `# J0VEBOT Soul\n\nJ0VEBOT is a neon green bolt-themed autonomous agent.\nPersonality: sharp, precise, relentless. Like a bolt — strikes fast, never misses.\n$JOV on Solana. Built on Jupiter.\n`);

  if (opts.installDaemon) {
    const ds = ora({ text: 'Installing daemon...', color: 'green' }).start();
    try { const { installDaemon } = await import('../daemon.js'); await installDaemon(gp); ds.succeed('Daemon installed (auto-starts)'); }
    catch (e) { ds.warn('Daemon skipped: ' + e.message); }
  }

  console.log();
  console.log(G('  ════════════════════════════════════════════'));
  console.log();
  console.log(`  ${L}  ${chalk.bold.green('J0VEBOT is ready!')}`);
  console.log();
  console.log(chalk.dim('  Quick start:'));
  console.log(chalk.white('    jovebot gateway              ') + chalk.dim('# Start gateway'));
  console.log(chalk.white('    jovebot agent -m "swap 1 SOL to USDC"') + chalk.dim('  # Talk to agent'));
  console.log(chalk.white('    jovebot skills install J0VEBOT/agent-skills') + chalk.dim(''));
  console.log(chalk.white('    jovebot doctor               ') + chalk.dim('# Health check'));
  console.log();
  console.log(chalk.dim('  Token: $JOV · j0ve.bot · @J0VEBOT'));
  console.log();
}
