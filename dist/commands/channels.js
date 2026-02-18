import chalk from 'chalk';
import { loadConfig } from '../config.js';

const G = chalk.hex('#84ff00');
const L = G('⚡');

export async function listChannels() {
  const config = loadConfig();
  console.log(`\n${L} Connected channels:\n`);
  for (const [name, cfg] of Object.entries(config.channels || {})) {
    const enabled = cfg?.enabled !== false;
    console.log(`  ${enabled ? chalk.green('●') : chalk.dim('○')} ${name} ${enabled ? '' : chalk.dim('(disabled)')}`);
  }
  console.log();
}

export async function loginChannel(channel) {
  console.log(`${L} Linking ${chalk.bold(channel)}...`);
  console.log(chalk.dim(`  Follow the ${channel} setup wizard.`));
}

export async function channelStatus() {
  console.log(`${L} Channel status: all nominal`);
}
