// JOV config — src/config.ts
// Manages ~/.jov/jovebot.json

import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

export const JOV_DIR = join(homedir(), '.jov');
export const CONFIG_PATH = join(JOV_DIR, 'jov.json');
export const CREDENTIALS_PATH = join(JOV_DIR, 'credentials');
export const WORKSPACE_PATH = join(JOV_DIR, 'workspace');
export const SKILLS_PATH = join(WORKSPACE_PATH, 'skills');

export interface JovConfig {
  agent: {
    model: string;
    thinkingLevel?: 'off' | 'low' | 'medium' | 'high';
    workspace?: string;
  };
  gateway?: {
    port?: number;
    bind?: string;
    auth?: {
      mode?: 'none' | 'password' | 'token';
      password?: string;
      token?: string;
    };
  };
  channels?: {
    whatsapp?: {
      enabled?: boolean;
      allowFrom?: string[];
      groups?: Record<string, { requireMention?: boolean }>;
    };
    telegram?: {
      enabled?: boolean;
      botToken?: string;
      groups?: Record<string, { requireMention?: boolean }>;
      allowFrom?: string[];
    };
    discord?: {
      enabled?: boolean;
      token?: string;
      dm?: { policy?: 'pairing' | 'open'; allowFrom?: string[] };
      guilds?: Record<string, unknown>;
    };
    slack?: {
      enabled?: boolean;
      botToken?: string;
      appToken?: string;
      dm?: { policy?: 'pairing' | 'open'; allowFrom?: string[] };
    };
    signal?: {
      enabled?: boolean;
    };
    webchat?: {
      enabled?: boolean;
    };
  };
  grok?: {
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  };
  security?: {
    dmPolicy?: 'pairing' | 'open';
    sandbox?: {
      mode?: 'off' | 'non-main' | 'all';
    };
  };
}

const DEFAULT_CONFIG: JovConfig = {
  agent: {
    model: 'grok-3',
    thinkingLevel: 'medium',
  },
  gateway: {
    port: 18789,
    bind: '127.0.0.1',
  },
  channels: {
    webchat: { enabled: true },
  },
  grok: {
    baseUrl: 'https://api.x.ai/v1',
  },
  security: {
    dmPolicy: 'pairing',
  },
};

export function ensureJovDir(): void {
  if (!existsSync(JOV_DIR)) mkdirSync(JOV_DIR, { recursive: true });
  if (!existsSync(CREDENTIALS_PATH)) mkdirSync(CREDENTIALS_PATH, { recursive: true });
  if (!existsSync(WORKSPACE_PATH)) mkdirSync(WORKSPACE_PATH, { recursive: true });
  if (!existsSync(SKILLS_PATH)) mkdirSync(SKILLS_PATH, { recursive: true });
}

export function loadConfig(): JovConfig {
  ensureJovDir();
  if (!existsSync(CONFIG_PATH)) {
    writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return { ...DEFAULT_CONFIG };
  }
  try {
    const raw = readFileSync(CONFIG_PATH, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: JovConfig): void {
  ensureJovDir();
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function getConfigValue(key: string): unknown {
  const config = loadConfig();
  return key.split('.').reduce((obj: any, k) => obj?.[k], config);
}

export function setConfigValue(key: string, value: unknown): void {
  const config = loadConfig();
  const keys = key.split('.');
  let obj: any = config;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!obj[keys[i]]) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;
  saveConfig(config);
}
