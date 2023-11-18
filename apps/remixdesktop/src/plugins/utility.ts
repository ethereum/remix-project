console.log('Starting utilities')
process.parentPort.postMessage('start utilities')
import { spawn } from 'node:child_process';
const ls = spawn('ls', ['-la'])
ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
  process.parentPort.postMessage(data.toString())
});

process.parentPort.postMessage(JSON.stringify(process.env))

const ls2 = spawn('yarn', ['-v'])
ls2.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
  process.parentPort.postMessage(data.toString())
});
ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
  process.parentPort.postMessage(data.toString())
})