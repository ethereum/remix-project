var CmdLine = require('./src/cmdline/index.js')
var compilation = require('./compilation.json')

var solc = require('solc')
var fs = require('fs')

var filename = 'test/sol/simple_storage.sol'
var short_filename = "simple_storage.sol"

var input_json = {
  language: 'Solidity',
  sources: {
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      '*': {
        '': [ 'legacyAST' ],
        '*': [ 'abi', 'metadata', 'devdoc', 'userdoc', 'evm.legacyAssembly', 'evm.bytecode', 'evm.deployedBytecode', 'evm.methodIdentifiers', 'evm.gasEstimates' ]
      }
    }
  }
}

input_json.sources[short_filename] = {content: fs.readFileSync(filename).toString()}

console.dir(input_json)

console.log("compiling...")

let compilationData = JSON.parse(solc.compileStandardWrapper(JSON.stringify(input_json)))
console.dir(Object.keys(compilationData))
var compilation = {}
compilation.data = compilationData
compilation.source = { sources: input_json.sources }
console.dir(compilation)
console.dir(compilation.data.errors)

var cmd_line = new CmdLine()
cmd_line.connect("http", "http://localhost:8545")
cmd_line.loadCompilationResult(compilation)
cmd_line.initDebugger()

var deployContract = function (cb) {
  let _web3 = cmd_line.debugger.debugger.web3

  let blockNumber = null
  let txNumber = null
  let tx = null

  let code = compilation.data.contracts[short_filename].SimpleStorage.evm.bytecode.object
  console.dir("deploying...")
  console.dir(code)
  _web3.eth.sendTransaction({data: "0x" + code, from: _web3.eth.accounts[0], gas: 800000}, cb)
}

let _web3 = cmd_line.debugger.debugger.web3
var tx = "0xf510c4f0b1d9ee262d7b9e9e87b4262f275fe029c2c733feef7dfa1e2b1e32aa"

//  deployContract((err, tx) => {
  cmd_line.startDebug(tx, short_filename)

cmd_line.events.on("source", () => {
  cmd_line.getSource().forEach(console.dir)
})
 // })
//})

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

module.exports = cmd_line


