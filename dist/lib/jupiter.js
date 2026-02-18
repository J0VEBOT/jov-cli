// J0VEBOT — Jupiter API Client
// Direct wrapper for all Jupiter REST APIs

import { loadConfig } from './config.js';
try { await import('dotenv/config'); } catch {}

const BASE = 'https://api.jup.ag';

export class JupiterAPIError extends Error {
  constructor(status, code, retryable, message) {
    super(message);
    this.name = 'JupiterAPIError';
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

export function getHeaders() {
  const config = loadConfig();
  const apiKey = config.jupiterApiKey || process.env.JUPITER_API_KEY;
  if (!apiKey) throw new Error('No Jupiter API key. Run: jovebot config --set jupiterApiKey=YOUR-KEY');
  return { 'x-api-key': apiKey, 'Content-Type': 'application/json' };
}

export async function jupFetch(path, init) {
  const headers = getHeaders();
  const url = path.startsWith('http') ? path : `${BASE}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: { ...headers, ...init?.headers },
  });

  if (res.status === 429) {
    throw new JupiterAPIError(429, 'RATE_LIMITED', true, 'Rate limited — wait 10s and retry');
  }

  if (!res.ok) {
    const raw = await res.text();
    let body = { message: raw || `HTTP_${res.status}` };
    try { body = raw ? JSON.parse(raw) : body; } catch {}
    throw new JupiterAPIError(res.status, body.code || res.status, false, body.message || body.error || raw);
  }

  return res.json();
}

export async function jupPost(path, data) {
  return jupFetch(path, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Retry wrapper with exponential backoff
export async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      const retryable = err.retryable || err.status === 429 || err.status === 503 ||
        (typeof err.code === 'number' && err.code < 0);
      if (!retryable || i === maxRetries) throw err;
      const delay = Math.min(baseDelay * Math.pow(2, i) + Math.random() * 500, 10000);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// Common mint addresses
export const MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  WBTC: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
  WETH: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
  JitoSOL: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
  mSOL: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
};

// Resolve token symbol to mint address
export function resolveMint(token) {
  const upper = token.toUpperCase();
  if (MINTS[upper]) return MINTS[upper];
  // If it looks like a mint address already (base58, 32+ chars)
  if (token.length >= 32) return token;
  throw new Error(`Unknown token: ${token}. Use mint address or known symbol (SOL, USDC, USDT, JUP, WBTC, WETH)`);
}

// Format lamports/smallest unit to human readable
export function formatAmount(amount, decimals = 9) {
  return (Number(amount) / Math.pow(10, decimals)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals > 6 ? 4 : 2,
  });
}

// Token decimals lookup
export const DECIMALS = {
  SOL: 9, USDC: 6, USDT: 6, JUP: 6, WBTC: 8, WETH: 8,
};

export function getDecimals(symbol) {
  return DECIMALS[symbol.toUpperCase()] || 9;
}

export function toSmallestUnit(amount, decimals) {
  return Math.floor(Number(amount) * Math.pow(10, decimals)).toString();
}
