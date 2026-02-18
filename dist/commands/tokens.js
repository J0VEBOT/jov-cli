// jovebot tokens — Jupiter Tokens v2 API

import chalk from 'chalk';
import ora from 'ora';
import { jupFetch } from '../lib/jupiter.js';

const G = chalk.hex('#84ff00');

export async function tokenSearch(query, opts) {
  const spinner = ora({ text: `Searching tokens: ${query}`, color: 'green' }).start();

  try {
    const data = await jupFetch(`/tokens/v2/search?query=${encodeURIComponent(query)}`);
    spinner.stop();

    const tokens = Array.isArray(data) ? data : data.tokens || [];

    console.log();
    console.log(G(`  ⚡ Token Search: "${query}"`));
    console.log(chalk.dim('  ─'.repeat(28)));
    console.log();

    if (!tokens.length) {
      console.log(chalk.dim('  No tokens found.'));
      console.log();
      return;
    }

    for (const t of tokens.slice(0, opts.limit || 10)) {
      const verified = t.tags?.includes('verified') || t.verified;
      const tag = verified ? chalk.green(' ✓') : (t.audit?.isSus ? chalk.red(' ⚠ SUS') : '');
      console.log('  ' + chalk.white.bold(t.symbol || '?') + tag + chalk.dim(' — ' + (t.name || 'unknown')));
      console.log('  ' + chalk.dim('mint: ') + chalk.yellow(t.address || t.mint));
      if (t.organicScore !== undefined) {
        console.log('  ' + chalk.dim('organic: ') + (t.organicScore > 50 ? chalk.green : chalk.yellow)(t.organicScore));
      }
      if (t.decimals !== undefined) {
        console.log('  ' + chalk.dim('decimals: ') + chalk.white(t.decimals));
      }
      console.log();
    }

    if (opts.json) console.log(JSON.stringify(tokens, null, 2));

  } catch (err) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}

export async function tokenTrending(opts) {
  const interval = opts.interval || '24h';
  const category = opts.category || 'toptrending';
  const spinner = ora({ text: `Fetching ${category} (${interval})...`, color: 'green' }).start();

  try {
    const data = await jupFetch(`/tokens/v2/${category}/${interval}`);
    spinner.stop();

    const tokens = Array.isArray(data) ? data : data.tokens || [];

    console.log();
    console.log(G(`  ⚡ ${category} — ${interval}`));
    console.log(chalk.dim('  ─'.repeat(28)));
    console.log();

    for (const [i, t] of tokens.slice(0, opts.limit || 15).entries()) {
      const verified = t.tags?.includes('verified') || t.verified;
      const tag = verified ? chalk.green(' ✓') : '';
      console.log('  ' + chalk.dim(`${(i + 1).toString().padStart(2)}.`) + ' ' + chalk.white.bold(t.symbol || '?') + tag);
      console.log('     ' + chalk.dim(t.address || t.mint));
    }

    console.log();
  } catch (err) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}
