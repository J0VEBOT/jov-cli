import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

export const JOV_DIR = join(homedir(), '.jov');
export const CONFIG_PATH = join(JOV_DIR, 'jov.json');
export const CREDENTIALS_PATH = join(JOV_DIR, 'credentials');
export const WORKSPACE_PATH = join(JOV_DIR, 'workspace');
export const SKILLS_PATH = join(WORKSPACE_PATH, 'skills');

const DEFAULT_CONFIG = {
  agent: { model: 'grok-3', thinkingLevel: 'medium' },
  gateway: { port: 18789, bind: '127.0.0.1' },
  channels: { webchat: { enabled: true } },
  grok: { baseUrl: 'https://api.x.ai/v1' },
  security: { dmPolicy: 'pairing' },
};

export function ensureJovDir() {
  for (const d of [JOV_DIR, CREDENTIALS_PATH, WORKSPACE_PATH, SKILLS_PATH]) {
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
  }
}

export function loadConfig() {
  ensureJovDir();
  if (!existsSync(CONFIG_PATH)) {
    writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return { ...DEFAULT_CONFIG };
  }
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) };
  } catch { return { ...DEFAULT_CONFIG }; }
}

export function saveConfig(config) {
  ensureJovDir();
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function getConfigValue(key) {
  return key.split('.').reduce((o, k) => o?.[k], loadConfig());
}

export function setConfigValue(key, value) {
  const config = loadConfig();
  const keys = key.split('.');
  let obj = config;
  for (let i = 0; i < keys.length - 1; i++) { if (!obj[keys[i]]) obj[keys[i]] = {}; obj = obj[keys[i]]; }
  obj[keys[keys.length - 1]] = value;
  saveConfig(config);
}
