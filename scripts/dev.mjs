import { spawn } from 'node:child_process';
import { platform } from 'node:os';

const isWindows = platform() === 'win32';
const command = isWindows ? 'cmd.exe' : 'npm';

function run(commandLine, args) {
  const finalArgs = isWindows
    ? ['/d', '/s', '/c', commandLine, ...args]
    : [commandLine, ...args];

  return spawn(command, finalArgs, {
    stdio: 'inherit',
    env: { ...process.env }
  });
}

const server = run(isWindows ? 'npm run dev:server' : 'npm', isWindows ? [] : ['run', 'dev:server']);
const client = run(isWindows ? 'npm run dev:client -- --host 127.0.0.1' : 'npm', isWindows ? [] : ['run', 'dev:client', '--', '--host', '127.0.0.1']);

function stop() {
  server.kill();
  client.kill();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);

server.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    client.kill();
    process.exit(code);
  }
});

client.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    server.kill();
    process.exit(code);
  }
});
