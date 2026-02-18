import chalk from 'chalk';
import ora from 'ora';
import { loadConfig } from '../config.js';

const G = chalk.hex('#84ff00');
const L = G('⚡');

export async function agent(opts) {
  if (!opts.message) { console.log(`${L} No message. Use: jovebot agent -m "your message"`); process.exit(1); }

  const config = loadConfig();
  const apiKey = config.grok?.apiKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  const model = opts.model || config.agent.model || 'grok-3';
  const baseUrl = config.grok?.baseUrl || 'https://api.x.ai/v1';

  if (!apiKey) {
    console.log(G('  No Grok API key configured.'));
    console.log(chalk.dim('  Set: jovebot config --set grok.apiKey=xai-KEY'));
    console.log(chalk.dim('  Or:  GROK_API_KEY=xai-KEY jovebot agent -m "..."'));
    process.exit(1);
  }

  const spinner = ora({ text: `${model} thinking...`, color: 'green' }).start();
  try {
    const r = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model, temperature: 0.7,
        messages: [
          { role: 'system', content: 'You are J0VEBOT ⚡ — an autonomous Jupiter agent on Solana. You have 15 Jupiter APIs: Ultra Swap, Lend, Perps, Trigger, Recurring, Token, Price, Portfolio, Predictions, Send, Studio, Lock, Routing, RFQ. Sharp, precise, lethal. $JOV token. Contract: 9Pgz2xfquZy3quM4mNVt7qf8B1t9NNgd2ENHU7Hrjove.' },
          { role: 'user', content: opts.message },
        ],
      }),
    });
    if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(`API ${r.status}: ${e.error?.message || r.statusText}`); }
    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content || '(no response)';
    spinner.stop();
    console.log();
    console.log(`${L} ${chalk.bold.hex('#84ff00')('J0VEBOT')} ${chalk.dim(`(${model})`)}`);
    console.log(chalk.dim('─'.repeat(50)));
    console.log();
    console.log(reply);
    console.log();
    if (data.usage) console.log(chalk.dim(`  tokens: ${data.usage.prompt_tokens}→${data.usage.completion_tokens} (${data.usage.total_tokens})`));
    console.log();
  } catch (e) { spinner.fail(chalk.hex('#84ff00')(e.message)); process.exit(1); }
}
