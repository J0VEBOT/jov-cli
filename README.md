# ⚡ J0VEBOT — Jupiter API CLI

All 15 Jupiter APIs in your terminal. Swap, lend, DCA, limit orders, price feeds, portfolio, token search — one command each.

```
npm install -g jovebot
```

## Quick Start

```bash
# Set your Jupiter API key (from portal.jup.ag)
jovebot config --set jupiterApiKey=YOUR_KEY

# Set your wallet address
jovebot config --set walletAddress=YOUR_SOL_ADDRESS

# Check everything works
jovebot doctor
```

## Commands

### Price — Jupiter Price v3

```bash
jovebot price                    # All major tokens
jovebot price SOL ETH BTC       # Specific tokens
jovebot price JUPyiwrYJF...     # By mint address
jovebot price --json             # Raw JSON output
```

### Swap — Jupiter Ultra API

```bash
jovebot swap SOL USDC 2.0                    # Swap 2 SOL → USDC
jovebot swap USDC SOL 100 --slippage 100     # 1% slippage
jovebot swap SOL USDC 1 --dry-run            # Quote only, don't execute
jovebot quote SOL USDC 5                     # Quick quote (no wallet needed)
```

### Lend — Jupiter Lend v1

```bash
jovebot lend pools                           # List available pools + APY
jovebot lend deposit USDC 1000               # Deposit 1000 USDC
jovebot lend positions                       # View your positions
```

### Limit Orders — Jupiter Trigger v1

```bash
jovebot trigger create USDC SOL 150 1.0      # Buy 1 SOL at $150
jovebot trigger list                          # List open orders
```

### DCA — Jupiter Recurring v1

```bash
jovebot dca create USDC SOL 1000 10 daily    # $100/day into SOL for 10 days
jovebot dca list                              # List active DCA orders
```

### Tokens — Jupiter Tokens v2

```bash
jovebot tokens search JUP                    # Search by name/symbol
jovebot tokens search EPjFWdd5...            # Search by mint
jovebot tokens trending                      # Top trending (24h)
jovebot tokens trending --interval 1h        # Last hour
jovebot tokens trending --category toptraded # Most traded
```

### Portfolio — Jupiter Portfolio v1

```bash
jovebot portfolio                            # Your positions (uses config wallet)
jovebot portfolio DtDrw8KufB4w...            # Specific wallet
```

### Config

```bash
jovebot config                               # Show current config
jovebot config --set jupiterApiKey=xai-...   # Set API key
jovebot config --set walletAddress=DtDrw...  # Set wallet
jovebot config --set rpcUrl=https://...      # Set RPC
jovebot config --get jupiterApiKey           # Get specific value
jovebot config --path                        # Print config file path
jovebot config --edit                        # Open in editor
```

### Doctor

```bash
jovebot doctor    # Check config, API connectivity, Node version
```

## Global Options

Every command supports:

- `--json` — Raw JSON output (pipe to `jq`, scripts, etc.)
- `--wallet <address>` — Override wallet for this command
- `-h, --help` — Command-specific help

## Configuration

Config stored at `~/.jov/config.json`:

```json
{
  "jupiterApiKey": "your-key-from-portal.jup.ag",
  "walletAddress": "your-solana-address",
  "rpcUrl": "https://api.mainnet-beta.solana.com",
  "defaultSlippage": 50
}
```

Or use environment variables:

```bash
export JUPITER_API_KEY=your-key
export WALLET_ADDRESS=your-address
export SOLANA_RPC_URL=https://your-rpc.com
```

## Jupiter APIs Covered

| Command | Jupiter API | Docs |
|---------|------------|------|
| `price` | Price v3 | [dev.jup.ag/docs/price](https://dev.jup.ag/docs/price) |
| `swap` | Ultra Swap v1 | [dev.jup.ag/docs/ultra](https://dev.jup.ag/docs/ultra) |
| `quote` | Ultra Swap v1 | [dev.jup.ag/docs/ultra](https://dev.jup.ag/docs/ultra) |
| `lend` | Lend v1 | [dev.jup.ag/docs/lend](https://dev.jup.ag/docs/lend) |
| `trigger` | Trigger v1 | [dev.jup.ag/docs/trigger](https://dev.jup.ag/docs/trigger) |
| `dca` | Recurring v1 | [dev.jup.ag/docs/recurring](https://dev.jup.ag/docs/recurring) |
| `tokens` | Tokens v2 | [dev.jup.ag/docs/tokens](https://dev.jup.ag/docs/tokens) |
| `portfolio` | Portfolio v1 | [dev.jup.ag/docs/portfolio](https://dev.jup.ag/docs/portfolio) |

## Security

- **No private keys stored** — wallet address only (public key)
- **No auto-signing** — transactions are prepared but require external signing
- **API key stored locally** at `~/.jov/config.json` (not sent anywhere except Jupiter)

## Requirements

- Node.js >= 18
- Jupiter API key from [portal.jup.ag](https://portal.jup.ag/)

## Links

- **Website**: [j0ve.bot](https://j0ve.bot)
- **GitHub**: [github.com/J0VEBOT/jov-cli](https://github.com/J0VEBOT/jov-cli)
- **Token**: $JOV on Solana
- **CA**: `9Pgz2xfquZy3quM4mNVt7qf8B1t9NNgd2ENHU7Hrjove`

## License

MIT
