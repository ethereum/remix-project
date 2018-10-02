var exec = require('child_process').exec
var stdout = require('stdout')

module.exports = function () {
  var vyperServer = run('./node_modules/.bin/nopenv vyper-serve', [])
  function kill () {
    if (vyperServer) {
      console.log('stopping vyper compiler')
      vyperServer.kill()
    }
  }
  return kill
}

function run (app, args) {
  var proc
  try {
    proc = exec(app, args)
    proc.on('error', (err) => {
      console.log('\x1b[31m%s\x1b[0m', '[ERR] can\'t start ' + app + '. seems not installed')
      console.log(err)
    })
    proc.on('exit', function (code, signal) {
      console.log('child process exited with ' +
                  `code ${code} and signal ${signal}`)
    })
    proc.on('message', function (msg) {
      console.log(`from ${app} : ${msg}`)
    })
    proc.stdout.pipe(stdout())
  } catch (e) {
    console.log(e)
  }
  return proc
}
