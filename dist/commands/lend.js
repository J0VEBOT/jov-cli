// jovebot lend — Jupiter Lend v1 API

import chalk from 'chalk';
import ora from 'ora';
import { jupFetch, jupPost, resolveMint, getDecimals, toSmallestUnit } from '../lib/jupiter.js';
import { loadConfig } from '../lib/config.js';

const G = chalk.hex('#84ff00');

export async function lendPools(opts) {
  const spinner = ora({ text: 'Fetching lending pools...', color: 'green' }).start();

  try {
    const data = await jupFetch('/lend/v1/earn/tokens');
    spinner.stop();

    const pools = Array.isArray(data) ? data : data.tokens || data.pools || [];

    console.log();
    console.log(G('  ⚡ Jupiter Lend — Available Pools'));
    console.log(chalk.dim('  ─'.repeat(28)));
    console.log();

    if (!pools.length) {
      console.log(chalk.dim('  No pools available.'));
      console.log();
      return;
    }

    console.log(
      '  ' + chalk.dim('Token'.padEnd(10)) +
      chalk.dim('APY'.padEnd(12)) +
      chalk.dim('TVL'.padEnd(16)) +
      chalk.dim('Mint')
    );
    console.log(chalk.dim('  ' + '─'.repeat(56)));

    for (const pool of pools) {
      const symbol = pool.symbol || pool.name || '?';
      const apy = pool.apy ? (pool.apy * 100).toFixed(2) + '%' : pool.apyPct ? pool.apyPct + '%' : 'N/A';
      const tvl = pool.tvl ? '$' + Number(pool.tvl).toLocaleString() : 'N/A';
      const mint = (pool.mint || pool.tokenMint || '').slice(0, 12) + '...';

      console.log(
        '  ' +
        chalk.white.bold(symbol.padEnd(10)) +
        G(apy.padEnd(12)) +
        chalk.white(tvl.padEnd(16)) +
        chalk.dim(mint)
      );
    }

    console.log();
    if (opts.json) console.log(JSON.stringify(pools, null, 2));

  } catch (err) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}

export async function lendDeposit(token, amount, opts) {
  const config = loadConfig();
  const wallet = opts.wallet || config.walletAddress || process.env.WALLET_ADDRESS;
  const tokenMint = resolveMint(token);
  const decimals = getDecimals(token);
  const amountSmallest = toSmallestUnit(amount, decimals);

  if (!wallet) {
    console.log(chalk.red('  No wallet address. Set: jovebot config --set walletAddress=YOUR_SOL_ADDRESS'));
    process.exit(1);
  }

  const spinner = ora({ text: `Preparing ${amount} ${token.toUpperCase()} deposit...`, color: 'green' }).start();

  try {
    const data = await jupPost('/lend/v1/earn/deposit', {
      owner: wallet,
      tokenMint,
      amount: amountSmallest,
    });

    spinner.succeed('Deposit transaction ready');
    console.log();
    console.log('  ' + chalk.dim('Token:') + '   ' + chalk.white.bold(token.toUpperCase()));
    console.log('  ' + chalk.dim('Amount:') + '  ' + G(amount));
    console.log('  ' + chalk.dim('Owner:') + '   ' + chalk.dim(wallet.slice(0, 8) + '...' + wallet.slice(-6)));
    console.log();

    if (data.transaction) {
      console.log(G('  Transaction ready to sign'));
      console.log(chalk.dim('  Sign with your wallet and send to Solana RPC.'));
    }

    console.log();
    if (opts.json) console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}

export async function lendPositions(opts) {
  const config = loadConfig();
  const wallet = opts.wallet || config.walletAddress || process.env.WALLET_ADDRESS;

  if (!wallet) {
    console.log(chalk.red('  No wallet address.'));
    process.exit(1);
  }

  const spinner = ora({ text: 'Fetching lending positions...', color: 'green' }).start();

  try {
    const data = await jupFetch(`/lend/v1/earn/positions?owner=${wallet}`);
    spinner.stop();

    const positions = Array.isArray(data) ? data : data.positions || [];

    console.log();
    console.log(G('  ⚡ Lending Positions'));
    console.log(chalk.dim('  ─'.repeat(28)));
    console.log();

    if (!positions.length) {
      console.log(chalk.dim('  No active lending positions.'));
      console.log();
      return;
    }

    for (const pos of positions) {
      console.log('  ' + chalk.white.bold(pos.symbol || pos.tokenMint?.slice(0, 8)));
      if (pos.amount) console.log('    ' + chalk.dim('deposited: ') + G(pos.amount));
      if (pos.earned) console.log('    ' + chalk.dim('earned: ') + G(pos.earned));
      console.log();
    }

    if (opts.json) console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}
