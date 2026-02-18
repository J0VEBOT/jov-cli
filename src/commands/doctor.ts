// JOV doctor — src/commands/doctor.ts
import chalk from 'chalk';
const L = chalk.hex('#84ff00')('⚡');

import { existsSync } from "fs";
import { CONFIG_PATH, JOV_DIR, loadConfig } from "../config.js";
export async function doctor() { console.log(`${L} JOV Doctor`); console.log(); const checks = [ ["JOV directory", existsSync(JOV_DIR)], ["Config file", existsSync(CONFIG_PATH)], ["Node >= 22", parseInt(process.versions.node) >= 22], ["Grok API key", !!loadConfig().grok?.apiKey], ]; for (const [name, ok] of checks) { console.log(`  ${ok ? chalk.green("✓") : chalk.hex('#84ff00')("✗")} ${name}`); } console.log(); }
