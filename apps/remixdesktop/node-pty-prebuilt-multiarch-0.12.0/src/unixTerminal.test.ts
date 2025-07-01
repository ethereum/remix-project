/**
 * Copyright (c) 2017, Daniel Imms (MIT License).
 * Copyright (c) 2018, Microsoft Corporation (MIT License).
 */

import { UnixTerminal } from './unixTerminal';
import * as assert from 'assert';
import * as cp from 'child_process';
import * as path from 'path';
import * as tty from 'tty';
import * as fs from 'fs';
import { constants } from 'os';
import { pollUntil } from './testUtils.test';
import { pid } from 'process';

const FIXTURES_PATH = path.normalize(path.join(__dirname, '..', 'fixtures', 'utf8-character.txt'));

if (process.platform !== 'win32') {
  describe('UnixTerminal', () => {
    describe('Constructor', () => {
      it('should set a valid pts name', () => {
        const term = new UnixTerminal('/bin/bash', [], {});
        let regExp: RegExp | undefined;
        if (process.platform === 'linux') {
          // https://linux.die.net/man/4/pts
          regExp = /^\/dev\/pts\/\d+$/;
        }
        if (process.platform === 'darwin') {
          // https://developer.apple.com/legacy/library/documentation/Darwin/Reference/ManPages/man4/pty.4.html
          regExp = /^\/dev\/tty[p-sP-S][a-z0-9]+$/;
        }
        if (regExp) {
          assert.ok(regExp.test(term.ptsName), '"' + term.ptsName + '" should match ' + regExp.toString());
        }
        assert.ok(tty.isatty(term.fd));
      });
    });

    describe('PtyForkEncodingOption', () => {
      it('should default to utf8', (done) => {
        const term = new UnixTerminal('/bin/bash', [ '-c', `cat "${FIXTURES_PATH}"` ]);
        term.on('data', (data) => {
          assert.strictEqual(typeof data, 'string');
          assert.strictEqual(data, '\u00E6');
          done();
        });
      });
      it('should return a Buffer when encoding is null', (done) => {
        const term = new UnixTerminal('/bin/bash', [ '-c', `cat "${FIXTURES_PATH}"` ], {
          encoding: null
        });
        term.on('data', (data) => {
          assert.strictEqual(typeof data, 'object');
          assert.ok(data instanceof Buffer);
          assert.strictEqual(0xC3, data[0]);
          assert.strictEqual(0xA6, data[1]);
          done();
        });
      });
      it('should support other encodings', (done) => {
        const text = 'test æ!';
        const term = new UnixTerminal(undefined, ['-c', 'echo "' + text + '"'], {
          encoding: 'base64'
        });
        let buffer = '';
        term.onData((data) => {
          assert.strictEqual(typeof data, 'string');
          buffer += data;
        });
        term.onExit(() => {
          assert.strictEqual(Buffer.alloc(8, buffer, 'base64').toString().replace('\r', '').replace('\n', ''), text);
          done();
        });
      });
    });

    describe('open', () => {
      let term: UnixTerminal;

      afterEach(() => {
        if (term) {
          term.slave!.destroy();
          term.master!.destroy();
        }
      });

      it('should open a pty with access to a master and slave socket', (done) => {
        term = UnixTerminal.open({});

        let slavebuf = '';
        term.slave!.on('data', (data) => {
          slavebuf += data;
        });

        let masterbuf = '';
        term.master!.on('data', (data) => {
          masterbuf += data;
        });

        pollUntil(() => {
          if (masterbuf === 'slave\r\nmaster\r\n' && slavebuf === 'master\n') {
            done();
            return true;
          }
          return false;
        }, 200, 10);

        term.slave!.write('slave\n');
        term.master!.write('master\n');
      });
    });
    describe('close', () => {
      const term = new UnixTerminal('node');
      it('should exit when terminal is destroyed programmatically', (done) => {
        term.on('exit', (code, signal) => {
          assert.strictEqual(code, 0);
          assert.strictEqual(signal, constants.signals.SIGHUP);
          done();
        });
        term.destroy();
      });
    });
    describe('signals in parent and child', () => {
      it('SIGINT - custom in parent and child', done => {
        // this test is cumbersome - we have to run it in a sub process to
        // see behavior of SIGINT handlers
        const data = `
        var pty = require('./lib/index');
        process.on('SIGINT', () => console.log('SIGINT in parent'));
        var ptyProcess = pty.spawn('node', ['-e', 'process.on("SIGINT", ()=>console.log("SIGINT in child"));setTimeout(() => null, 300);'], {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: process.env.HOME,
          env: process.env
        });
        ptyProcess.on('data', function (data) {
          console.log(data);
        });
        setTimeout(() => null, 500);
        console.log('ready', ptyProcess.pid);
        `;
        const buffer: string[] = [];
        const p = cp.spawn('node', ['-e', data]);
        let sub = '';
        p.stdout.on('data', (data) => {
          if (!data.toString().indexOf('ready')) {
            sub = data.toString().split(' ')[1].slice(0, -1);
            setTimeout(() => {
              process.kill(parseInt(sub), 'SIGINT');  // SIGINT to child
              p.kill('SIGINT');                       // SIGINT to parent
            }, 200);
          } else {
            buffer.push(data.toString().replace(/^\s+|\s+$/g, ''));
          }
        });
        p.on('close', () => {
          // handlers in parent and child should have been triggered
          assert.strictEqual(buffer.indexOf('SIGINT in child') !== -1, true);
          assert.strictEqual(buffer.indexOf('SIGINT in parent') !== -1, true);
          done();
        });
      });
      it('SIGINT - custom in parent, default in child', done => {
        // this tests the original idea of the signal(...) change in pty.cc:
        // to make sure the SIGINT handler of a pty child is reset to default
        // and does not interfere with the handler in the parent
        const data = `
        var pty = require('./lib/index');
        process.on('SIGINT', () => console.log('SIGINT in parent'));
        var ptyProcess = pty.spawn('node', ['-e', 'setTimeout(() => console.log("should not be printed"), 300);'], {
          name: 'xterm-color',
          cols: 80,
          rows: 30,
          cwd: process.env.HOME,
          env: process.env
        });
        ptyProcess.on('data', function (data) {
          console.log(data);
        });
        setTimeout(() => null, 500);
        console.log('ready', ptyProcess.pid);
        `;
        const buffer: string[] = [];
        const p = cp.spawn('node', ['-e', data]);
        let sub = '';
        p.stdout.on('data', (data) => {
          if (!data.toString().indexOf('ready')) {
            sub = data.toString().split(' ')[1].slice(0, -1);
            setTimeout(() => {
              process.kill(parseInt(sub), 'SIGINT');  // SIGINT to child
              p.kill('SIGINT');                       // SIGINT to parent
            }, 200);
          } else {
            buffer.push(data.toString().replace(/^\s+|\s+$/g, ''));
          }
        });
        p.on('close', () => {
          // handlers in parent and child should have been triggered
          assert.strictEqual(buffer.indexOf('should not be printed') !== -1, false);
          assert.strictEqual(buffer.indexOf('SIGINT in parent') !== -1, true);
          done();
        });
      });
      it('SIGHUP default (child only)', done => {
        const term = new UnixTerminal('node', [ '-e', `
        console.log('ready');
        setTimeout(()=>console.log('timeout'), 200);`
        ]);
        let buffer = '';
        term.on('data', (data) => {
          if (data === 'ready\r\n') {
            term.kill();
          } else {
            buffer += data;
          }
        });
        term.on('exit', () => {
          // no timeout in buffer
          assert.strictEqual(buffer, '');
          done();
        });
      });
      it('SIGUSR1 - custom in parent and child', done => {
        let pHandlerCalled = 0;
        const handleSigUsr = function(h: any): any {
          return function(): void {
            pHandlerCalled += 1;
            process.removeListener('SIGUSR1', h);
          };
        };
        process.on('SIGUSR1', handleSigUsr(handleSigUsr));

        const term = new UnixTerminal('node', [ '-e', `
        process.on('SIGUSR1', () => {
          console.log('SIGUSR1 in child');
        });
        console.log('ready');
        setTimeout(()=>null, 200);`
        ]);
        let buffer = '';
        term.on('data', (data) => {
          if (data === 'ready\r\n') {
            process.kill(process.pid, 'SIGUSR1');
            term.kill('SIGUSR1');
          } else {
            buffer += data;
          }
        });
        term.on('exit', () => {
          // should have called both handlers and only once
          assert.strictEqual(pHandlerCalled, 1);
          assert.strictEqual(buffer, 'SIGUSR1 in child\r\n');
          done();
        });
      });
    });
    describe('spawn', () => {
      if (process.platform === 'darwin') {
        it('should return the name of the process', (done) => {
          const term = new UnixTerminal('/bin/echo');
          assert.strictEqual(term.process, '/bin/echo');
          term.on('exit', () => done());
          term.destroy();
        });
        it('should return the name of the sub process', (done) => {
          const data = `
          var pty = require('./lib/index');
          var ptyProcess = pty.spawn('zsh', ['-c', 'python3'], {
            env: process.env
          });
          ptyProcess.on('data', function (data) {
            if (ptyProcess.process === 'Python') {
              console.log('title', ptyProcess.process);
            }
          });
          setTimeout(() => null, 500);
          console.log('ready', ptyProcess.pid);
          `;
          const p = cp.spawn('node', ['-e', data]);
          let sub = '';
          let pid = '';
          p.stdout.on('data', (data) => {
            if (!data.toString().indexOf('title')) {
              sub = data.toString().split(' ')[1].slice(0, -1);
              setTimeout(() => {
                process.kill(parseInt(pid), 'SIGINT');
                p.kill('SIGINT');
              }, 200);
            } else if (!data.toString().indexOf('ready')) {
              pid = data.toString().split(' ')[1].slice(0, -1);
            }
          });
          p.on('exit', () => {
            assert.notStrictEqual(pid, '');
            assert.strictEqual(sub, 'Python');
            done();
          });
        });
        it('should close on exec', (done) => {
          const data = `
          var pty = require('./lib/index');
          var ptyProcess = pty.spawn('node', ['-e', 'setTimeout(() => console.log("hello from terminal"), 300);']);
          ptyProcess.on('data', function (data) {
            console.log(data);
          });
          setTimeout(() => null, 500);
          console.log('ready', ptyProcess.pid);
          `;
          const buffer: string[] = [];
          const readFd = fs.openSync(FIXTURES_PATH, 'r');
          const p = cp.spawn('node', ['-e', data], {
            stdio: ['ignore', 'pipe', 'pipe', readFd]
          });
          let sub = '';
          p.stdout!.on('data', (data) => {
            if (!data.toString().indexOf('ready')) {
              sub = data.toString().split(' ')[1].slice(0, -1);
              try {
                fs.statSync(`/proc/${sub}/fd/${readFd}`);
                done('not reachable');
              } catch (error) {
                // @ts-ignore
                assert.notStrictEqual(error.message.indexOf('ENOENT'), -1);
              }
              setTimeout(() => {
                process.kill(parseInt(sub), 'SIGINT');  // SIGINT to child
                p.kill('SIGINT');                       // SIGINT to parent
              }, 200);
            } else {
              buffer.push(data.toString().replace(/^\s+|\s+$/g, ''));
            }
          });
          p.on('close', () => {
            done();
          });
        });
      }
      it('should handle exec() errors', (done) => {
        const term = new UnixTerminal('/bin/bogus.exe', []);
        term.on('exit', (code, signal) => {
          assert.strictEqual(code, 1);
          done();
        });
      });
      it('should handle chdir() errors', (done) => {
        const term = new UnixTerminal('/bin/echo', [], { cwd: '/nowhere' });
        term.on('exit', (code, signal) => {
          assert.strictEqual(code, 1);
          done();
        });
      });
      it('should not leak child process', (done) => {
        const count = cp.execSync('ps -ax | grep node | wc -l');
        const term = new UnixTerminal('node', [ '-e', `
          console.log('ready');
          setTimeout(()=>console.log('timeout'), 200);`
        ]);
        term.on('data', async (data) => {
          if (data === 'ready\r\n') {
            process.kill(term.pid, 'SIGINT');
            await setTimeout(() => null, 1000);
            const newCount = cp.execSync('ps -ax | grep node | wc -l');
            assert.strictEqual(count.toString(), newCount.toString());
            done();
          }
        });
      });
    });
  });
}
