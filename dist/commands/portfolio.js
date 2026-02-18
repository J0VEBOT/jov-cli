// jovebot portfolio — Jupiter Portfolio v1 API

import chalk from 'chalk';
import ora from 'ora';
import { jupFetch } from '../lib/jupiter.js';
import { loadConfig } from '../lib/config.js';

const G = chalk.hex('#84ff00');

export async function portfolio(address, opts) {
  const config = loadConfig();
  const wallet = address || config.walletAddress || process.env.WALLET_ADDRESS;

  if (!wallet) {
    console.log(chalk.red('  No wallet address. Pass one or: jovebot config --set walletAddress=YOUR_SOL_ADDRESS'));
    process.exit(1);
  }

  const spinner = ora({ text: 'Fetching portfolio...', color: 'green' }).start();

  try {
    const data = await jupFetch(`/portfolio/v1/positions/${wallet}`);
    spinner.stop();

    console.log();
    console.log(G('  ⚡ Portfolio'));
    console.log(chalk.dim('  wallet: ' + wallet.slice(0, 8) + '...' + wallet.slice(-6)));
    console.log(chalk.dim('  ─'.repeat(28)));
    console.log();

    const positions = data.positions || data.elements || data;

    if (!positions || (Array.isArray(positions) && !positions.length)) {
      console.log(chalk.dim('  No positions found.'));
      console.log();
      return;
    }

    let totalValue = 0;

    if (Array.isArray(positions)) {
      for (const pos of positions) {
        const type = pos.type || pos.elementType || 'unknown';
        const name = pos.name || pos.platformName || pos.platform || type;
        const value = pos.valueUsd || pos.value || 0;
        totalValue += Number(value);

        console.log('  ' + chalk.white.bold(name));
        console.log('    ' + chalk.dim('type: ') + chalk.white(type));
        if (value) console.log('    ' + chalk.dim('value: ') + G('$' + Number(value).toFixed(2)));

        if (pos.tokens) {
          for (const t of pos.tokens) {
            console.log('    ' + chalk.dim('• ') + chalk.white(t.symbol || t.mint?.slice(0, 8)) + ' ' + chalk.dim(t.amount || ''));
          }
        }
        console.log();
      }
    }

    if (totalValue > 0) {
      console.log(chalk.dim('  ─'.repeat(28)));
      console.log('  ' + chalk.dim('Total:') + ' ' + G.bold('$' + totalValue.toFixed(2)));
      console.log();
    }

    if (opts.json) console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    spinner.fail(chalk.red(err.message));
    if (err.status === 404) {
      console.log(chalk.dim('  Portfolio API is beta — may not cover all positions.'));
    }
    process.exit(1);
  }
}
