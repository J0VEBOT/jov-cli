// JOV update — src/commands/update.ts
import chalk from 'chalk';
const L = chalk.hex('#84ff00')('⚡');

export async function update(opts: any) { console.log(`${L} Checking for updates (${opts.channel})...`); console.log(chalk.dim("  npm update -g jovebot")); }
