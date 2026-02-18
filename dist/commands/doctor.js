import chalk from 'chalk';
import { existsSync } from 'fs';
import { CONFIG_PATH, JOV_DIR, SKILLS_PATH, loadConfig } from '../config.js';

const G = chalk.hex('#84ff00');
const L = G('⚡');

export async function doctor() {
  console.log();
  console.log(`${L} J0VEBOT Doctor`);
  console.log();
  const config = loadConfig();
  const checks = [
    ['J0VEBOT directory (~/.jov)', existsSync(JOV_DIR)],
    ['Config file (jov.json)', existsSync(CONFIG_PATH)],
    ['Skills directory', existsSync(SKILLS_PATH)],
    ['Node >= 18', parseInt(process.versions.node) >= 18],
    ['Grok API key', !!(config.grok?.apiKey || process.env.GROK_API_KEY)],
    ['Gateway port configured', !!config.gateway?.port],
  ];
  for (const [name, ok] of checks) {
    console.log(`  ${ok ? chalk.green('✓') : chalk.hex('#84ff00')('✗')} ${name}`);
  }
  console.log();
  console.log(chalk.dim('  Model: ') + chalk.white(config.agent.model));
  console.log(chalk.dim('  Port:  ') + chalk.white(config.gateway?.port || 18789));
  console.log(chalk.dim('  Token: ') + G('$JOV'));
  console.log(chalk.dim('  CA:    ') + chalk.dim('9Pgz2xfquZy3quM4mNVt7qf8B1t9NNgd2ENHU7Hrjove'));
  console.log();
}
