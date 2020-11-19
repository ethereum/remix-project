/* eslint-disable */
const { spawn } = require('child_process')
const commands = process.argv
let filePath = '', env = ''

commands.forEach(val => {
    if (val.indexOf('--filePath') !== -1) filePath = val.split('=')[1]
    else if (val.indexOf('--env') !== -1) env = val.split('=')[1]
})

const bash = spawn('apps/remix-ide-e2e/script.sh', [env, filePath]);

bash.stdout.on('data', (data) => {
  console.log(data.toString())
})

bash.stderr.on('data', (data) => {
  console.log(data.toString())
})

bash.on('exit', (code) => {
  console.log(`Process exited with code ${code}`)
  if (parseInt(code) === 1) {
    throw new Error('Failed with error code 1')
  }
})