// jovebot trigger — Jupiter Trigger v1 (Limit Orders)
// jovebot dca — Jupiter Recurring v1 (DCA)

import chalk from 'chalk';
import ora from 'ora';
import { jupFetch, jupPost, resolveMint, getDecimals, toSmallestUnit, formatAmount } from '../lib/jupiter.js';
import { loadConfig } from '../lib/config.js';

const G = chalk.hex('#84ff00');

// ═══ TRIGGER (Limit Orders) ═══

export async function triggerCreate(inputToken, outputToken, inputAmount, targetPrice, opts) {
  const config = loadConfig();
  const wallet = opts.wallet || config.walletAddress || process.env.WALLET_ADDRESS;

  if (!wallet) {
    console.log(chalk.red('  No wallet address.'));
    process.exit(1);
  }

  const inputMint = resolveMint(inputToken);
  const outputMint = resolveMint(outputToken);
  const inDec = getDecimals(inputToken);
  const outDec = getDecimals(outputToken);
  const makingAmount = toSmallestUnit(inputAmount, inDec);
  const takingAmount = toSmallestUnit(parseFloat(inputAmount) * parseFloat(targetPrice), outDec);

  const spinner = ora({ text: 'Creating limit order...', color: 'green' }).start();

  try {
    const data = await jupPost('/trigger/v1/createOrder', {
      maker: wallet,
      payer: wallet,
      inputMint,
      outputMint,
      makingAmount,
      takingAmount,
      expiredAt: opts.expiry || null,
      feeBps: 0,
    });

    spinner.succeed('Limit order created');
    console.log();
    console.log(G('  ⚡ Trigger Order'));
    console.log(chalk.dim('  ─'.repeat(28)));
    console.log();
    console.log('  ' + chalk.dim('Sell:') + '   ' + chalk.white.bold(inputAmount + ' ' + inputToken.toUpperCase()));
    console.log('  ' + chalk.dim('Buy:') + '    ' + G(formatAmount(takingAmount, outDec) + ' ' + outputToken.toUpperCase()));
    console.log('  ' + chalk.dim('Rate:') + '   ' + chalk.white('1 ' + inputToken.toUpperCase() + ' = ' + targetPrice + ' ' + outputToken.toUpperCase()));
    console.log();

    if (data.transaction) {
      console.log(G('  Transaction ready to sign'));
      console.log(chalk.dim('  requestId: ' + (data.requestId || 'N/A')));
    }
    console.log();

    if (opts.json) console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}

export async function triggerList(opts) {
  const config = loadConfig();
  const wallet = opts.wallet || config.walletAddress || process.env.WALLET_ADDRESS;

  if (!wallet) {
    console.log(chalk.red('  No wallet address.'));
    process.exit(1);
  }

  const spinner = ora({ text: 'Fetching open orders...', color: 'green' }).start();

  try {
    const data = await jupFetch(`/trigger/v1/getTriggerOrders?maker=${wallet}`);
    spinner.stop();

    const orders = data.orders || data || [];

    console.log();
    console.log(G('  ⚡ Open Limit Orders'));
    console.log(chalk.dim('  ─'.repeat(28)));
    console.log();

    if (!orders.length) {
      console.log(chalk.dim('  No open orders.'));
      console.log();
      return;
    }

    for (const [i, o] of orders.entries()) {
      console.log('  ' + chalk.dim(`${i + 1}.`) + ' ' + chalk.white(o.inputMint?.slice(0, 8) + ' → ' + o.outputMint?.slice(0, 8)));
      console.log('     ' + chalk.dim('making: ') + chalk.white(o.makingAmount) + chalk.dim(' taking: ') + G(o.takingAmount));
      if (o.status) console.log('     ' + chalk.dim('status: ') + chalk.white(o.status));
      console.log();
    }

    if (opts.json) console.log(JSON.stringify(orders, null, 2));

  } catch (err) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}

// ═══ DCA (Recurring) ═══

export async function dcaCreate(inputToken, outputToken, totalAmount, numOrders, interval, opts) {
  const config = loadConfig();
  const wallet = opts.wallet || config.walletAddress || process.env.WALLET_ADDRESS;

  if (!wallet) {
    console.log(chalk.red('  No wallet address.'));
    process.exit(1);
  }

  const inputMint = resolveMint(inputToken);
  const outputMint = resolveMint(outputToken);
  const inDec = getDecimals(inputToken);
  const amountSmallest = toSmallestUnit(totalAmount, inDec);
  const orders = parseInt(numOrders) || 4;
  const perOrder = (parseFloat(totalAmount) / orders).toFixed(2);

  const spinner = ora({ text: 'Creating DCA order...', color: 'green' }).start();

  try {
    const data = await jupPost('/recurring/v1/createOrder', {
      maker: wallet,
      payer: wallet,
      inputMint,
      outputMint,
      amount: amountSmallest,
      params: {
        time: {
          numOrders: orders,
          interval: interval || 'daily',
        }
      },
    });

    spinner.succeed('DCA order created');
    console.log();
    console.log(G('  ⚡ Recurring DCA Order'));
    console.log(chalk.dim('  ─'.repeat(28)));
    console.log();
    console.log('  ' + chalk.dim('Total:') + '    ' + chalk.white.bold(totalAmount + ' ' + inputToken.toUpperCase()));
    console.log('  ' + chalk.dim('Orders:') + '   ' + chalk.white(orders));
    console.log('  ' + chalk.dim('Per fill:') + ' ' + G(perOrder + ' ' + inputToken.toUpperCase()));
    console.log('  ' + chalk.dim('Output:') + '   ' + chalk.white(outputToken.toUpperCase()));
    console.log('  ' + chalk.dim('Interval:') + ' ' + chalk.white(interval || 'daily'));
    console.log();

    if (data.transaction) {
      console.log(G('  Transaction ready to sign'));
      console.log(chalk.dim('  requestId: ' + (data.requestId || 'N/A')));
    }
    console.log();

    if (opts.json) console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}

export async function dcaList(opts) {
  const config = loadConfig();
  const wallet = opts.wallet || config.walletAddress || process.env.WALLET_ADDRESS;

  if (!wallet) {
    console.log(chalk.red('  No wallet address.'));
    process.exit(1);
  }

  const spinner = ora({ text: 'Fetching DCA orders...', color: 'green' }).start();

  try {
    const data = await jupFetch(`/recurring/v1/getRecurringOrders?maker=${wallet}`);
    spinner.stop();

    const orders = data.orders || data || [];

    console.log();
    console.log(G('  ⚡ Active DCA Orders'));
    console.log(chalk.dim('  ─'.repeat(28)));
    console.log();

    if (!orders.length) {
      console.log(chalk.dim('  No active DCA orders.'));
      console.log();
      return;
    }

    for (const [i, o] of orders.entries()) {
      console.log('  ' + chalk.dim(`${i + 1}.`) + ' ' + chalk.white(o.inputMint?.slice(0, 8) + ' → ' + o.outputMint?.slice(0, 8)));
      if (o.filledOrders) console.log('     ' + chalk.dim('filled: ') + G(o.filledOrders + '/' + o.totalOrders));
      if (o.status) console.log('     ' + chalk.dim('status: ') + chalk.white(o.status));
      console.log();
    }

    if (opts.json) console.log(JSON.stringify(orders, null, 2));

  } catch (err) {
    spinner.fail(chalk.red(err.message));
    process.exit(1);
  }
}
