// JOV config — src/commands/config.ts
import chalk from 'chalk';
const L = chalk.hex('#84ff00')('⚡');

import { loadConfig, CONFIG_PATH, setConfigValue, getConfigValue } from "../config.js";
export async function config(opts: any) { if (opts.path) { console.log(CONFIG_PATH); return; } if (opts.get) { console.log(getConfigValue(opts.get)); return; } if (opts.set) { const [k,v] = opts.set.split("="); setConfigValue(k, v); console.log(`${L} Set ${chalk.bold(k)} = ${v}`); return; } const c = loadConfig(); console.log(`${L} JOV Configuration (${chalk.dim(CONFIG_PATH)}):`); console.log(JSON.stringify(c, null, 2)); }
