import chalk from 'chalk';
const G = chalk.hex('#84ff00');
export async function approvePairing(channel, code) { console.log(G('⚡') + ` Pairing approved: ${channel} (${code})`); }
export async function listPairings() { console.log(G('⚡') + ' No pending pairing requests'); }
