// TODO: this file shoudl be removed at some point
var CmdLine = require('./src/cmdline/index')
// var compilation = require('./compilation.json')

var solc = require('solc')
var fs = require('fs')

var filename = 'test/sol/simple_storage.sol'
var shortFilename = 'simple_storage.sol'

var inputJson = {
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
        '': [ 'ast' ],
        '*': [ 'abi', 'metadata', 'devdoc', 'userdoc', 'evm.legacyAssembly', 'evm.bytecode', 'evm.deployedBytecode', 'evm.methodIdentifiers', 'evm.gasEstimates' ]
      }
    }
  }
}

inputJson.sources[shortFilename] = {content: fs.readFileSync(filename).toString()}

console.dir(inputJson)

console.log('compiling...')

let compilationData = JSON.parse(solc.compileStandardWrapper(JSON.stringify(inputJson)))
console.dir(Object.keys(compilationData))
var compilation = {}
compilation['data'] = compilationData
compilation['source'] = { sources: inputJson.sources }
console.dir(compilation)
console.dir(compilation['data'].errors)

var cmdLine = new CmdLine()
cmdLine.connect('http', 'http://localhost:8545')
cmdLine.loadCompilationResult(compilation)
cmdLine.initDebugger()

// var deployContract = function (cb) {
//   let _web3 = cmdLine.debugger.debugger.web3
//
//   let blockNumber = null
//   let txNumber = null
//   let tx = null
//
//   let code = compilation.data.contracts[shortFilename].SimpleStorage.evm.bytecode.object
//   console.dir('deploying...')
//   console.dir(code)
//   _web3.eth.sendTransaction({data: '0x' + code, from: _web3.eth.accounts[0], gas: 800000}, cb)
// }

// let _web3 = cmdLine.debugger.debugger.web3
var tx = '0xf510c4f0b1d9ee262d7b9e9e87b4262f275fe029c2c733feef7dfa1e2b1e32aa'

//  deployContract((err, tx) => {
cmdLine.startDebug(tx, shortFilename)

cmdLine.events.on('source', () => {
  cmdLine.getSource().forEach(console.dir)
})
 // })
// })

const repl = require('repl')

repl.start({
  prompt: '> ',
  eval: (cmd, context, filename, cb) => {
    let command = cmd.trim()
    if (command === 'next' || command === 'n') {
      cmdLine.stepOverForward(true)
    }
    if (command === 'previous' || command === 'p' || command === 'prev') {
      cmdLine.stepOverBack(true)
    }
    if (command === 'step' || command === 's') {
      cmdLine.stepIntoForward(true)
    }
    if (command === 'stepback' || command === 'sb') {
      cmdLine.stepIntoBack(true)
    }
    if (command === 'exit' || command === 'quit') {
      process.exit(0)
    }
    if (command === 'var local' || command === 'v l' || command === 'vl') {
      cmdLine.displayLocals()
    }
    if (command === 'var global' || command === 'v g' || command === 'vg') {
      cmdLine.displayGlobals()
    }
    if (command.split(' ')[0] === 'jump') {
      let stepIndex = parseInt(command.split(' ')[1], 10)
      cmdLine.jumpTo(stepIndex)
    }
    cb(null, '')
  }
})

module.exports = cmdLine

