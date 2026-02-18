import chalk from 'chalk';
import { existsSync, readdirSync } from 'fs';
import { SKILLS_PATH } from '../config.js';

const G = chalk.hex('#84ff00');
const L = G('⚡');

export async function listSkills() {
  console.log();
  console.log(`${L} Installed skills:`);
  if (existsSync(SKILLS_PATH)) {
    const dirs = readdirSync(SKILLS_PATH);
    if (dirs.length) { dirs.forEach(d => console.log(`  ${chalk.green('●')} ${d}`)); }
    else { console.log(chalk.dim('  (none installed)')); }
  } else { console.log(chalk.dim('  (none installed)')); }
  console.log();
  console.log(chalk.dim('  Install J0VEBOT agent skills:'));
  console.log(chalk.white('    npx add-skill J0VEBOT/agent-skills'));
  console.log();
}

export async function installSkill(name) {
  console.log(`${L} Installing skill: ${chalk.bold(name)}...`);
  console.log(chalk.dim('  For J0VEBOT skills: npx add-skill J0VEBOT/agent-skills'));
}
