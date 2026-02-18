#!/usr/bin/env node
import('../dist/cli.js').catch(e => {
  console.error('J0VEBOT:', e.message);
  process.exit(1);
});
