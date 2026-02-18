// J0VEBOT Config — ~/.jov/config.json

import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

export const JOV_DIR = join(homedir(), '.jov');
export const CONFIG_PATH = join(JOV_DIR, 'config.json');

const DEFAULTS = {
  jupiterApiKey: null,
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  walletPath: null,
  defaultSlippage: 50,
  model: 'grok-3',
  gateway: { port: 18789, bind: '127.0.0.1' },
};

export function ensureDir() {
  if (!existsSync(JOV_DIR)) mkdirSync(JOV_DIR, { recursive: true });
}

export function loadConfig() {
  ensureDir();
  if (!existsSync(CONFIG_PATH)) {
    writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULTS, null, 2));
    return { ...DEFAULTS };
  }
  try {
    return { ...DEFAULTS, ...JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) };
  } catch { return { ...DEFAULTS }; }
}

export function saveConfig(config) {
  ensureDir();
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function getVal(key) {
  return key.split('.').reduce((o, k) => o?.[k], loadConfig());
}

export function setVal(key, value) {
  const c = loadConfig();
  const keys = key.split('.');
  let o = c;
  for (let i = 0; i < keys.length - 1; i++) { if (!o[keys[i]]) o[keys[i]] = {}; o = o[keys[i]]; }
  o[keys[keys.length - 1]] = value;
  saveConfig(c);
}
