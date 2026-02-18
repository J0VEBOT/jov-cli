#!/usr/bin/env node

// J0VEBOT — CLI wrapper for all Jupiter APIs
// https://j0ve.bot | $JOV | 9Pgz2xfquZy3quM4mNVt7qf8B1t9NNgd2ENHU7Hrjove

import { Command } from 'commander';
import chalk from 'chalk';

const G = chalk.hex('#84ff00');

const banner = `
${G('  ╔══════════════════════════════════════════════╗')}
${G('  ║')}  ${G('⚡')}  ${G.bold('J0VEBOT')} — Jupiter API CLI                ${G('║')}
${G('  ║')}     All 15 Jupiter APIs in your terminal      ${G('║')}
${G('  ╚══════════════════════════════════════════════╝')}
`;

const program = new Command();

program
  .name('jovebot')
  .description(`${G('⚡')} J0VEBOT — CLI wrapper for all Jupiter APIs`)
  .version('1.0.0', '-v, --version')
  .addHelpText('before', banner);

// ═══ PRICE ═══
program
  .command('price')
  .description('Fetch real-time token prices (Jupiter Price v3)')
  .argument('[tokens...]', 'Token symbols or mint addresses (default: all major)')
  .option('--json', 'Output raw JSON')
  .action(async (tokens, opts) => {
    const { price } = await import('./commands/price.js');
    await price(tokens, opts);
  });

// ═══ SWAP ═══
program
  .command('swap')
  .description('Swap tokens via Jupiter Ultra API')
  .argument('<from>', 'Input token (e.g. SOL)')
  .argument('<to>', 'Output token (e.g. USDC)')
  .argument('<amount>', 'Amount to swap')
  .option('--slippage <bps>', 'Slippage tolerance in bps', '50')
  .option('--wallet <address>', 'Wallet address')
  .option('--dry-run', 'Fetch order but do not execute')
  .option('--json', 'Output raw JSON')
  .action(async (from, to, amount, opts) => {
    const { swap } = await import('./commands/swap.js');
    await swap(from, to, amount, opts);
  });

// ═══ QUOTE ═══
program
  .command('quote')
  .description('Get a swap quote without executing (no wallet needed)')
  .argument('<from>', 'Input token')
  .argument('<to>', 'Output token')
  .argument('<amount>', 'Amount')
  .option('--json', 'Output raw JSON')
  .action(async (from, to, amount, opts) => {
    const { quote } = await import('./commands/swap.js');
    await quote(from, to, amount, opts);
  });

// ═══ TOKENS ═══
const tokenCmd = program.command('tokens').description('Search and browse tokens (Jupiter Tokens v2)');

tokenCmd
  .command('search')
  .description('Search tokens by name, symbol, or mint address')
  .argument('<query>', 'Search query')
  .option('--limit <n>', 'Max results', '10')
  .option('--json', 'Output raw JSON')
  .action(async (query, opts) => {
    const { tokenSearch } = await import('./commands/tokens.js');
    await tokenSearch(query, opts);
  });

tokenCmd
  .command('trending')
  .description('Show trending tokens')
  .option('--interval <t>', '5m|1h|6h|24h', '24h')
  .option('--category <c>', 'toptrending|toptraded|toporganicscore', 'toptrending')
  .option('--limit <n>', 'Max results', '15')
  .option('--json', 'Output raw JSON')
  .action(async (opts) => {
    const { tokenTrending } = await import('./commands/tokens.js');
    await tokenTrending(opts);
  });

// ═══ PORTFOLIO ═══
program
  .command('portfolio')
  .description('View wallet positions (Jupiter Portfolio v1)')
  .argument('[address]', 'Wallet address (uses config if omitted)')
  .option('--json', 'Output raw JSON')
  .action(async (address, opts) => {
    const { portfolio } = await import('./commands/portfolio.js');
    await portfolio(address, opts);
  });

// ═══ LEND ═══
const lendCmd = program.command('lend').description('Deposit, withdraw, and view lending pools (Jupiter Lend v1)');

lendCmd
  .command('pools')
  .description('List available lending pools')
  .option('--json', 'Output raw JSON')
  .action(async (opts) => {
    const { lendPools } = await import('./commands/lend.js');
    await lendPools(opts);
  });

lendCmd
  .command('deposit')
  .description('Deposit tokens to earn yield')
  .argument('<token>', 'Token symbol (e.g. USDC)')
  .argument('<amount>', 'Amount to deposit')
  .option('--wallet <address>', 'Wallet address')
  .option('--json', 'Output raw JSON')
  .action(async (token, amount, opts) => {
    const { lendDeposit } = await import('./commands/lend.js');
    await lendDeposit(token, amount, opts);
  });

lendCmd
  .command('positions')
  .description('View your lending positions')
  .option('--wallet <address>', 'Wallet address')
  .option('--json', 'Output raw JSON')
  .action(async (opts) => {
    const { lendPositions } = await import('./commands/lend.js');
    await lendPositions(opts);
  });

// ═══ TRIGGER (Limit Orders) ═══
const triggerCmd = program.command('trigger').description('Limit orders (Jupiter Trigger v1)');

triggerCmd
  .command('create')
  .description('Create a limit order')
  .argument('<input>', 'Token to sell (e.g. USDC)')
  .argument('<output>', 'Token to buy (e.g. SOL)')
  .argument('<amount>', 'Amount of input token')
  .argument('<price>', 'Target price (output per 1 input)')
  .option('--wallet <address>', 'Wallet address')
  .option('--expiry <iso>', 'Expiry datetime (ISO)')
  .option('--json', 'Output raw JSON')
  .action(async (input, output, amount, price, opts) => {
    const { triggerCreate } = await import('./commands/trigger.js');
    await triggerCreate(input, output, amount, price, opts);
  });

triggerCmd
  .command('list')
  .description('List open limit orders')
  .option('--wallet <address>', 'Wallet address')
  .option('--json', 'Output raw JSON')
  .action(async (opts) => {
    const { triggerList } = await import('./commands/trigger.js');
    await triggerList(opts);
  });

// ═══ DCA (Recurring) ═══
const dcaCmd = program.command('dca').description('Dollar-cost averaging (Jupiter Recurring v1)');

dcaCmd
  .command('create')
  .description('Create a DCA order')
  .argument('<input>', 'Token to sell (e.g. USDC)')
  .argument('<output>', 'Token to buy (e.g. SOL)')
  .argument('<total>', 'Total amount')
  .argument('[orders]', 'Number of orders', '4')
  .argument('[interval]', 'Interval: daily|weekly|biweekly|monthly', 'daily')
  .option('--wallet <address>', 'Wallet address')
  .option('--json', 'Output raw JSON')
  .action(async (input, output, total, orders, interval, opts) => {
    const { dcaCreate } = await import('./commands/trigger.js');
    await dcaCreate(input, output, total, orders, interval, opts);
  });

dcaCmd
  .command('list')
  .description('List active DCA orders')
  .option('--wallet <address>', 'Wallet address')
  .option('--json', 'Output raw JSON')
  .action(async (opts) => {
    const { dcaList } = await import('./commands/trigger.js');
    await dcaList(opts);
  });

// ═══ CONFIG ═══
program
  .command('config')
  .description('View or edit J0VEBOT configuration')
  .option('--set <key=value>', 'Set a config value')
  .option('--get <key>', 'Get a config value')
  .option('--path', 'Print config file path')
  .option('--edit', 'Open in editor')
  .action(async (opts) => {
    const { config } = await import('./commands/config.js');
    await config(opts);
  });

// ═══ DOCTOR ═══
program
  .command('doctor')
  .description('Diagnose J0VEBOT installation and API connectivity')
  .action(async () => {
    const { doctor } = await import('./commands/config.js');
    await doctor();
  });

program.parse();

if (!process.argv.slice(2).length) {
  console.log(banner);
  program.outputHelp();
}
