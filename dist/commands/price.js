// jovebot price — Jupiter Price v3 API

import chalk from 'chalk';
import ora from 'ora';
import { jupFetch, resolveMint, MINTS } from '../lib/jupiter.js';

const G = chalk.hex('#84ff00');

export async function price(tokens, opts) {
  const mints = tokens.length
    ? tokens.map(t => ({ symbol: t.toUpperCase(), mint: resolveMint(t) }))
    : Object.entries(MINTS).map(([k, v]) => ({ symbol: k, mint: v }));

  const spinner = ora({ text: 'Fetching prices from Jupiter Price v3...', color: 'green' }).start();

  try {
    const ids = mints.map(m => m.mint).join(',');
    const data = await jupFetch(`/price/v3?ids=${ids}`);

    spinner.stop();
    console.log();
    console.log(G('  ⚡ Jupiter Market Prices'));
    console.log(chalk.dim('  ─'.repeat(28)));
    console.log();

    // Table header
    console.log(
      '  ' +
      chalk.dim('Token'.padEnd(10)) +
      chalk.dim('Price'.padEnd(18)) +
      chalk.dim('Confidence')
    );
    console.log(chalk.dim('  ' + '─'.repeat(42)));

    for (const { symbol, mint } of mints) {
      const entry = data.data?.[mint];
      if (!entry || !entry.price) {
        console.log(`  ${chalk.white(symbol.padEnd(10))}${chalk.dim('unavailable')}`);
        continue;
      }

      const p = parseFloat(entry.price);
      const conf = entry.confidenceLevel || 'unknown';
      const confColor = conf === 'high' ? chalk.green : conf === 'medium' ? chalk.yellow : chalk.red;

      let priceStr;
      if (p >= 1000) priceStr = '$' + p.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      else if (p >= 1) priceStr = '$' + p.toFixed(2);
      else priceStr = '$' + p.toFixed(6);

      console.log(
        '  ' +
        chalk.white.bold(symbol.padEnd(10)) +
        G(priceStr.padEnd(18)) +
        confColor(conf)
      );
    }

    console.log();

    if (opts.json) {
      console.log(JSON.stringify(data.data, null, 2));
    }

    console.log(chalk.dim('  Source: api.jup.ag/price/v3 · ' + new Date().toISOString().slice(0, 19) + 'Z'));
    console.log();
  } catch (err) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}
