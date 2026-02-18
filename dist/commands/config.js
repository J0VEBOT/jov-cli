// jovebot config + doctor

import chalk from 'chalk';
import { existsSync } from 'fs';
import { loadConfig, saveConfig, setVal, getVal, CONFIG_PATH, JOV_DIR } from '../lib/config.js';

const G = chalk.hex('#84ff00');

export async function config(opts) {
  if (opts.path) { console.log(CONFIG_PATH); return; }
  if (opts.get) { const v = getVal(opts.get); console.log(v !== undefined ? v : chalk.dim('(not set)')); return; }
  if (opts.set) {
    const eq = opts.set.indexOf('=');
    if (eq === -1) { console.log(chalk.red('  Use: --set key=value')); return; }
    const key = opts.set.slice(0, eq);
    const val = opts.set.slice(eq + 1);
    setVal(key, val);
    console.log(G(`  ✓ Set ${key}`));
    return;
  }
  if (opts.edit) {
    const { execSync } = await import('child_process');
    execSync(`${process.env.EDITOR || 'nano'} "${CONFIG_PATH}"`, { stdio: 'inherit' });
    return;
  }
  const c = loadConfig();
  console.log();
  console.log(G('  ⚡ J0VEBOT Config'));
  console.log(chalk.dim('  ' + CONFIG_PATH));
  console.log();
  // Show config with secrets masked
  const display = { ...c };
  if (display.jupiterApiKey) display.jupiterApiKey = display.jupiterApiKey.slice(0, 6) + '...' + display.jupiterApiKey.slice(-4);
  console.log(JSON.stringify(display, null, 2));
  console.log();
}

export async function doctor() {
  const config = loadConfig();

  console.log();
  console.log(G('  ⚡ J0VEBOT Doctor'));
  console.log(chalk.dim('  ─'.repeat(28)));
  console.log();

  const checks = [
    ['J0VEBOT directory (~/.jov)', existsSync(JOV_DIR)],
    ['Config file', existsSync(CONFIG_PATH)],
    ['Node >= 18', parseInt(process.versions.node) >= 18],
    ['Jupiter API key', !!(config.jupiterApiKey || process.env.JUPITER_API_KEY)],
    ['Wallet address', !!(config.walletAddress || process.env.WALLET_ADDRESS)],
    ['RPC URL configured', !!config.rpcUrl],
  ];

  let allGood = true;
  for (const [name, ok] of checks) {
    console.log(`  ${ok ? chalk.green('✓') : chalk.red('✗')} ${name}`);
    if (!ok) allGood = false;
  }

  // Test Jupiter API connectivity
  console.log();
  if (config.jupiterApiKey || process.env.JUPITER_API_KEY) {
    try {
      const { jupFetch } = await import('../lib/jupiter.js');
      const data = await jupFetch('/price/v3?ids=So11111111111111111111111111111111111111112');
      const solPrice = data.data?.['So11111111111111111111111111111111111111112']?.price;
      console.log(`  ${chalk.green('✓')} Jupiter API connected — SOL: $${parseFloat(solPrice).toFixed(2)}`);
    } catch (err) {
      console.log(`  ${chalk.red('✗')} Jupiter API: ${err.message}`);
      allGood = false;
    }
  }

  console.log();
  console.log(chalk.dim('  Config:') + '  ' + chalk.white(CONFIG_PATH));
  console.log(chalk.dim('  RPC:') + '     ' + chalk.white(config.rpcUrl || 'not set'));
  console.log(chalk.dim('  Token:') + '   ' + G('$JOV'));
  console.log(chalk.dim('  CA:') + '      ' + chalk.dim('9Pgz2xfquZy3quM4mNVt7qf8B1t9NNgd2ENHU7Hrjove'));
  console.log();

  if (allGood) {
    console.log(G('  All checks passed ✅'));
  } else {
    console.log(chalk.yellow('  Some checks failed. Run: jovebot config --set <key>=<value>'));
  }
  console.log();
}
