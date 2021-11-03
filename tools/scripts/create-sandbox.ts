import * as cp from 'child_process';
import { join } from 'path';
import { copyFileSync, existsSync, ensureDirSync } from 'fs-extra';
import { rmSync, writeFileSync } from 'fs';

const rootPath = join(__dirname, '../../');

async function spawnLocalRegistry(): Promise<cp.ChildProcess> {
  cp.execSync('npx kill-port 4872');
  return new Promise((resolve, reject) => {
    const process = cp.spawn('npx', ['nx', 'serve', 'verdaccio-instance'], {
      cwd: rootPath,
    });
    process.stderr.on('data', (data) => {
      console.log(data?.toString());
      if (data.toString().includes('http address')) {
        resolve(process);
      }
    });
    process.stdout.on('data', (data) => {
      console.log(data?.toString());
      if (data.toString().includes('http address')) {
        resolve(process);
      }
    });

    process.on('exit', () => {
      reject();
    });
  });
}

function publishAllPackages() {
  cp.execSync('npx nx run-many --target publish --all', {
    cwd: rootPath,
    stdio: 'inherit',
  });
}

rmSync(join(rootPath, './tmp'), { recursive: true });
const sandboxPath = join(rootPath, './tmp/sandbox');
ensureDirSync(sandboxPath);

async function main() {
  console.log('Spawning local registry');
  const registry = await spawnLocalRegistry();
  process.on('exit', () => {
    registry.kill();
  });
  console.log('Created local registry');
  copyFileSync(join(rootPath, '.npmrc.local'), join(sandboxPath, '/.npmrc'));
  publishAllPackages();
  writeFileSync(
    join(sandboxPath, 'package.json'),
    JSON.stringify({
      version: '0.1.0',
      dependencies: {
        '@test-stackblitz-action/package-a': '0.0.1',
      },
    })
  );
  cp.execSync('npm i', { cwd: sandboxPath, stdio: 'inherit' });
  console.log('Sandbox environment created at', sandboxPath);
}

main();
