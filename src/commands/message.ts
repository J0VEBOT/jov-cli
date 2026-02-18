// JOV message — src/commands/message.ts
import chalk from 'chalk';
const L = chalk.hex('#84ff00')('⚡');

export async function sendMessage(opts: any) { console.log(`${L} Message sending via ${opts.channel || "whatsapp"}...`); console.log(chalk.dim("  Channel integration coming soon. Configure with: jovebot channels login")); }
