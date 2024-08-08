const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const isWindows = process.platform === 'win32';
const isMac = process.platform === 'darwin';

const executableName = isWindows ? 'product-analyzer-cli.exe' : 'product-analyzer-cli';
const nodePath = process.execPath;

// Copy the node executable
if (isWindows) {
  execSync(`copy "${nodePath}" ${executableName}`, { stdio: 'inherit' });
} else {
  execSync(`cp "${nodePath}" ${executableName}`, { stdio: 'inherit' });
}

// Remove signature if on macOS
if (isMac) {
  execSync(`codesign --remove-signature ${executableName}`, {
    stdio: 'inherit',
  });
}

// Inject the blob
const postjectCommand = isMac
  ? `npx postject ${executableName} NODE_SEA_BLOB product-analyzer-cli.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 --macho-segment-name NODE_SEA`
  : `npx postject ${executableName} NODE_SEA_BLOB product-analyzer-cli.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2`;

execSync(postjectCommand, { stdio: 'inherit' });

// Re-sign if on macOS
if (isMac) {
  execSync(`codesign --sign - ${executableName}`, { stdio: 'inherit' });
}

console.log(`Single executable application created: ${executableName}`);

// Clean up the blob file
fs.unlinkSync('product-analyzer-cli.blob');
