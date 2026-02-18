import chalk from 'chalk';
const G = chalk.hex('#84ff00');
export async function listNodes() { console.log(G('⚡') + ' Connected nodes: local (this machine)'); }
