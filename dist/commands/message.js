import chalk from 'chalk';
const G = chalk.hex('#84ff00');
export async function sendMessage(opts) {
  console.log(G('⚡') + ` Sending to ${opts.to} via ${opts.channel || 'whatsapp'}...`);
  console.log(chalk.dim('  Message: ') + opts.message);
}
