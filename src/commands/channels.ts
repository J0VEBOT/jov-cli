// JOV channels — src/commands/channels.ts
import chalk from 'chalk';
const L = chalk.hex('#84ff00')('⚡');

export async function listChannels() { console.log(`${L} Connected channels:`); console.log(chalk.dim("  • WebChat (built-in) — always on")); console.log(chalk.dim("  Run: jovebot channels login <channel> to add more")); }
export async function loginChannel(channel: string) { console.log(`${L} Linking ${chalk.bold(channel)}...`); console.log(chalk.dim("  Channel pairing flow starting...")); }
export async function channelStatus() { console.log(`${L} Channel status:`); console.log(chalk.green("  ● WebChat") + chalk.dim(" — running")); }
