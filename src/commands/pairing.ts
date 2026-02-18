// JOV pairing — src/commands/pairing.ts
import chalk from 'chalk';
const L = chalk.hex('#84ff00')('⚡');

export async function approvePairing(channel: string, code: string) { console.log(`${L} Approving pairing: ${channel} / ${code}`); }
export async function listPairings() { console.log(`${L} No pending pairing requests.`); }
