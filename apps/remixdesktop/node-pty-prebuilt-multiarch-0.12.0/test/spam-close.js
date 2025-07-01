// This test creates a pty periodically, spamming it with echo calls and killing it shortly after.
// It's a test case for https://github.com/microsoft/node-pty/issues/375, the script will hang
// when it show this bug instead of continuing to create more processes.

var os = require('os');
var pty = require('..');

var isWindows = os.platform() === 'win32';
var shell = isWindows ? 'cmd.exe' : 'bash';

let i = 0;

setInterval(() => {
  console.log(`creating pty ${++i}`);
  var ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 26,
    cwd: isWindows ? process.env.USERPROFILE : process.env.HOME,
    env: Object.assign({ TEST: "Environment vars work" }, process.env),
    useConpty: true
  });

  ptyProcess.onData(data => console.log(`  data: ${data.replace(/\x1b|\n|\r/g, '_')}`));

  setInterval(() => {
    ptyProcess.write('echo foo\r'.repeat(50));
  }, 10);
  setTimeout(() => {
    console.log(`  killing ${ptyProcess.pid}...`);
    ptyProcess.kill();
  }, 100);
}, 1200);
