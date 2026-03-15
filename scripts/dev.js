require('dotenv').config({ path: '.env.local' });

const { spawn } = require('child_process');

const port = process.env.PORT || '3001';

spawn(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'dev:next', '--', '-p', port],
  { stdio: 'inherit' },
);