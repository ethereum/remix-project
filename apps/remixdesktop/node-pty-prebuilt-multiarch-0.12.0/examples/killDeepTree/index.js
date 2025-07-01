var os = require('os');
var pty = require('../..');

var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

var ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: __dirname,
  env: process.env
});

ptyProcess.onData((data) => process.stdout.write(data));

ptyProcess.write('start notepad\r');
ptyProcess.write('npm start\r');

// Kill the tree at the end
setTimeout(() => {
  console.log('Killing pty');
  ptyProcess.kill();
}, 10000);
