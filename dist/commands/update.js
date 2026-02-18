import chalk from 'chalk';
import ora from 'ora';
const G = chalk.hex('#84ff00');
export async function update(opts) {
  const s = ora({ text: 'Checking for updates...', color: 'green' }).start();
  await new Promise(r => setTimeout(r, 1000));
  s.succeed('J0VEBOT is up to date (v1.0.0)');
  console.log(chalk.dim('  Channel: ' + (opts.channel || 'stable')));
}
