var CmdLine = require('./src/cmdline/index.js')
var compilation = require('./compilation.json')

var solc = require('solc')
var fs = require('fs')

//var filename = 'test/sol/ballot.sol'
var filename = 'test/sol/simple_storage.sol'
//var filename = 'browser/ballot.sol'

var input_json = {
  language: 'Solidity',
  sources: {
    //"test/sol/ballot.sol": {content: fs.readFileSync('test/sol/ballot.sol').toString()}
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

input_json.sources[filename] = {content: fs.readFileSync(filename).toString()}

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

  let code = compilation.data.contracts[filename].SimpleStorage.evm.bytecode.object
  console.dir("deploying...")
  console.dir(code)
  _web3.eth.sendTransaction({data: "0x" + code, from: _web3.eth.accounts[0], gas: 800000}, cb)
}

let _web3 = cmd_line.debugger.debugger.web3
// var tx = "0x8c44e1b6bcb557512184f851502e43160f415e2e12b2b98ba12b96b699b85859"
// var tx = "0xae365458de8c6669eb146ce2ade4c7767c0edddaee98f5c1878c7c5e5510a0de"
// var tx = "0x04aa74287b3c52e2ecab1cb066d22116317155503681870c516c95cdb148fa28"
// var tx = "0x04aa74287b3c52e2ecab1cb066d22116317155503681870c516c95cdb148fa28"
// var tx = "0x28bd66d99bc45b3f8d959126a26b8c97092892e63fc8ed90eb1598ebedf600ef"
// var tx = "0x3a7355c59f95db494872f33890dbabaceae1ca5330db86db49d24a5c29cd829a"
// _web3.eth.getTransactionReceipt(tx, (err, data) => {
//   console.dir(err)
//   console.dir(data)

  deployContract((err, tx) => {
  cmd_line.startDebug(tx, filename)
  })
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


