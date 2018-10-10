
// options
// * executionContext
// * offsetToLineColumnConverter
// *** disable for now
// * compiler
// ** lastCompilationResult

var remixLib = require('remix-lib')
//var executionContext = remixLib.execution.executionContext

var Debugger = require('./src/debugger/debugger.js')

var compilation = {
}

compilation.lastCompilationResult = require('./compilation.json')

// connecting to a node
// var Web3 = require('web3')
// web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
// global.my_web3 = web3

// with vm
var ContextManager = require('./contextManager.js')
var contextManager = new ContextManager()

_debugger = new Debugger({
  //web3: web3,
	web3: contextManager.getWeb3(),
  //executionContext: executionContext,
  //offsetToLineColumnConverter: this.registry.get('offsettolinecolumnconverter').api,
  compiler: compilation
})

// with vm
contextManager.event.register('providerChanged', () => {
	_debugger.updateWeb3(contextManager.getWeb3())
})

contextManager.initProviders()

contextManager.switchProvider('vm')

_debugger.event.register('debuggerStatus', function (isActive) {
  console.dir("debugger status")
  console.dir(isActive)
});

_debugger.event.register('newSourceLocation', function (lineColumnPos, rawLocation) {
  console.dir("newSourceLocation")
});

_debugger.event.register('debuggerUnloaded', function() {
  console.dir("debugger unloaded")
});

let _web3 = _debugger.debugger.web3
// let web3 = _debugger.debugger.executionContext.web3()



let blockNumber = null
let txNumber = null
let tx = null

// let code = compilation.lastCompilationResult.data.contracts['browser/ballot.sol'].Ballot.evm.bytecode.object
// _web3.eth.sendTransaction({data: "0x" + code, from: _web3.eth.accounts[0], gas: 800000}, (err, txHash) => {
//   console.dir(err)
//   console.dir(txHash)
// 
//   txNumber = txHash
// 
//   _debugger.debug(blockNumber, txNumber, tx, () => {
//     console.dir('debugger started')
//   })
// 
// })

//_debugger.debug(blockNumber, txNumber, tx, () => {
//  console.dir('debugger started')
//})

//_debugger.debugger.web3.eth.accounts()

console.dir("done!")

module.exports = _debugger
