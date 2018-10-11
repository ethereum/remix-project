var CmdLine = require('./src/cmdline/index.js')

var compilation = require('./compilation.json')

var cmd_line = new CmdLine()
cmd_line.connect("http", "http://localhost:8545")
cmd_line.loadCompilationResult(compilation)
cmd_line.initDebugger()

var deployContract = function (cb) {
  let _web3 = cmd_line.debugger.debugger.web3

  let blockNumber = null
  let txNumber = null
  let tx = null

  let code = compilation.data.contracts['browser/ballot.sol'].Ballot.evm.bytecode.object
  _web3.eth.sendTransaction({data: "0x" + code, from: _web3.eth.accounts[0], gas: 800000}, cb)
}

deployContract((err, tx) => {
  cmd_line.startDebug(tx, "browser/ballot.sol")
})

const repl = require('repl')

const r = repl.start({
  prompt: '> ',
  eval: (cmd, context, filename, cb) => {
    let command = cmd.trim()
    if (command === 'next' || command === 'n') {
      cmd_line.debugger.step_manager.stepOverForward(true)
    }
    if (command === 'previous' || command === 'p' || command === 'prev') {
      cmd_line.debugger.step_manager.stepOverBack(true)
    }
    if (command === 'step' || command === 's') {
      cmd_line.debugger.step_manager.stepIntoForward(true)
    }
    if (command === 'stepback' || command === 'sb') {
      cmd_line.debugger.step_manager.stepIntoBack(true)
    }
    if (command === 'exit' || command === 'quit') {
      process.exit(0)
    }
    if (command === 'var local' || command === 'v l' || command === 'vl') {
      cmd_line.displayLocals()
    }
    if (command === 'var global' || command === 'v g' || command === 'vg') {
      cmd_line.displayGlobals()
    }
    if (command.split(' ')[0] === 'jump') {
      let stepIndex = parseInt(command.split(' ')[1], 10)
      cmd_line.debugger.step_manager.jumpTo(stepIndex)
    }
    cb(null, '');
  }
});

