// JOV daemon — src/daemon.ts
import { platform } from 'os';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { JOV_DIR } from './config.js';

export async function installDaemon(port: number): Promise<void> {
  const os = platform();

  if (os === 'darwin') {
    await installLaunchd(port);
  } else if (os === 'linux') {
    await installSystemd(port);
  } else {
    throw new Error(`Daemon install not supported on ${os}. Use: jovebot gateway --daemon`);
  }
}

async function installLaunchd(port: number) {
  const jovPath = execSync('which jovebot || echo jovebot', { encoding: 'utf-8' }).trim();
  const plistPath = join(process.env.HOME || '~', 'Library/LaunchAgents/ai.jov.gateway.plist');

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>ai.jov.gateway</string>
  <key>ProgramArguments</key>
  <array>
    <string>${jovPath}</string>
    <string>gateway</string>
    <string>--port</string>
    <string>${port}</string>
  </array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>${JOV_DIR}/gateway.log</string>
  <key>StandardErrorPath</key><string>${JOV_DIR}/gateway.err.log</string>
</dict>
</plist>`;

  const dir = dirname(plistPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(plistPath, plist);
  execSync(`launchctl load -w "${plistPath}"`);
}

async function installSystemd(port: number) {
  const jovPath = execSync('which jovebot || echo jovebot', { encoding: 'utf-8' }).trim();
  const unitDir = join(process.env.HOME || '~', '.config/systemd/user');
  const unitPath = join(unitDir, 'jov-gateway.service');

  const unit = `[Unit]
Description=JOV Gateway
After=network.target

[Service]
ExecStart=${jovPath} gateway --port ${port}
Restart=always
RestartSec=5

[Install]
WantedBy=default.target
`;

  if (!existsSync(unitDir)) mkdirSync(unitDir, { recursive: true });
  writeFileSync(unitPath, unit);
  execSync('systemctl --user daemon-reload');
  execSync('systemctl --user enable jov-gateway');
  execSync('systemctl --user start jov-gateway');
}
