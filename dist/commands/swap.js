// jovebot swap — Jupiter Ultra Swap API

import chalk from 'chalk';
import ora from 'ora';
import { jupFetch, jupPost, withRetry, resolveMint, getDecimals, toSmallestUnit, formatAmount } from '../lib/jupiter.js';
import { loadConfig } from '../lib/config.js';

const G = chalk.hex('#84ff00');

export async function swap(from, to, amount, opts) {
  const config = loadConfig();
  const inputMint = resolveMint(from);
  const outputMint = resolveMint(to);
  const decimals = getDecimals(from);
  const outputDecimals = getDecimals(to);
  const amountSmallest = toSmallestUnit(amount, decimals);
  const taker = opts.wallet || config.walletAddress || process.env.WALLET_ADDRESS;

  console.log();
  console.log(G('  ⚡ Jupiter Ultra Swap'));
  console.log(chalk.dim('  ─'.repeat(28)));
  console.log();

  if (!taker) {
    console.log(chalk.red('  No wallet address configured.'));
    console.log(chalk.dim('  Set with: jovebot config --set walletAddress=YOUR_SOL_ADDRESS'));
    console.log(chalk.dim('  Or pass:  --wallet YOUR_SOL_ADDRESS'));
    process.exit(1);
  }

  // 1. Fetch order
  const spinner = ora({ text: 'Fetching order from Ultra API...', color: 'green' }).start();

  try {
    const orderUrl = `/ultra/v1/order?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountSmallest}&taker=${taker}`;
    if (opts.slippage) orderUrl += `&slippageBps=${opts.slippage}`;

    const order = await withRetry(() => jupFetch(orderUrl));

    if (order.error) throw new Error(order.error);

    spinner.succeed('Order received');

    console.log();
    console.log('  ' + chalk.dim('requestId:') + ' ' + chalk.yellow(order.requestId));
    console.log('  ' + chalk.dim('inAmount:') + '  ' + chalk.white(formatAmount(order.inAmount || amountSmallest, decimals) + ' ' + from.toUpperCase()));

    const outAmt = order.outAmount || order.outputAmount;
    if (outAmt) {
      console.log('  ' + chalk.dim('outAmount:') + ' ' + G(formatAmount(outAmt, outputDecimals) + ' ' + to.toUpperCase()));
    }

    // Show route info if available
    if (order.routePlan) {
      console.log('  ' + chalk.dim('route:') + '     ' + chalk.white(order.routePlan.length + ' hop(s)'));
    }

    // Dry run mode — don't execute
    if (opts.dryRun) {
      console.log();
      console.log(chalk.yellow('  ⚠ Dry run — not executing. Remove --dry-run to execute.'));
      console.log();
      if (opts.json) console.log(JSON.stringify(order, null, 2));
      return;
    }

    // 2. Sign transaction
    if (!order.transaction) {
      console.log();
      console.log(chalk.dim('  Transaction payload:'));
      console.log(JSON.stringify(order, null, 2));
      console.log();
      console.log(chalk.yellow('  ⚠ To execute: sign the transaction with your wallet and POST to /ultra/v1/execute'));
      console.log(chalk.dim('  This CLI does not sign transactions for security. Use a signing agent or SDK.'));
      console.log();
      return;
    }

    // If we have a transaction, show signing instructions
    console.log();
    console.log(G('  Transaction ready to sign'));
    console.log(chalk.dim('  Base64 payload: ') + chalk.dim(order.transaction.slice(0, 40) + '...'));
    console.log();
    console.log(chalk.dim('  To execute:'));
    console.log(chalk.white('    1. Deserialize the base64 VersionedTransaction'));
    console.log(chalk.white('    2. Sign with your wallet keypair'));
    console.log(chalk.white('    3. POST signed tx + requestId to /ultra/v1/execute'));
    console.log();

    if (opts.json) {
      console.log(JSON.stringify(order, null, 2));
    }

  } catch (err) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}

// Quote-only mode (no wallet needed)
export async function quote(from, to, amount, opts) {
  const inputMint = resolveMint(from);
  const outputMint = resolveMint(to);
  const decimals = getDecimals(from);
  const outputDecimals = getDecimals(to);
  const amountSmallest = toSmallestUnit(amount, decimals);

  const spinner = ora({ text: 'Fetching quote...', color: 'green' }).start();

  try {
    // Use a dummy taker for quote-only
    const dummyTaker = '11111111111111111111111111111111';
    const url = `/ultra/v1/order?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amountSmallest}&taker=${dummyTaker}`;
    const order = await jupFetch(url);

    spinner.stop();
    console.log();
    console.log(G('  ⚡ Jupiter Quote'));
    console.log(chalk.dim('  ─'.repeat(28)));
    console.log();

    const outAmt = order.outAmount || order.outputAmount;
    console.log('  ' + chalk.dim('Input:') + '    ' + chalk.white.bold(amount + ' ' + from.toUpperCase()));
    if (outAmt) {
      console.log('  ' + chalk.dim('Output:') + '   ' + G.bold(formatAmount(outAmt, outputDecimals) + ' ' + to.toUpperCase()));

      // Calculate effective rate
      const inNum = parseFloat(amount);
      const outNum = Number(outAmt) / Math.pow(10, outputDecimals);
      if (inNum > 0) {
        console.log('  ' + chalk.dim('Rate:') + '     ' + chalk.white('1 ' + from.toUpperCase() + ' = ' + (outNum / inNum).toFixed(4) + ' ' + to.toUpperCase()));
      }
    }

    if (order.priceImpactPct) {
      const impact = parseFloat(order.priceImpactPct);
      const impactColor = impact < 1 ? chalk.green : impact < 3 ? chalk.yellow : chalk.red;
      console.log('  ' + chalk.dim('Impact:') + '   ' + impactColor(impact.toFixed(2) + '%'));
    }

    console.log();

    if (opts.json) console.log(JSON.stringify(order, null, 2));

  } catch (err) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}
