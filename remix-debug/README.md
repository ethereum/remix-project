# `remix-debug`

remix-debug is a libraries which wrap other remix-* libraries to make debugging thereum transactions easier.

+ [Installation](#installation)
+ [Development](#development)
+ [First steps](#firststeps)
+ [Tests](#tests)

## Installation

Make sure Node is [installed on your setup](https://docs.npmjs.com/getting-started/installing-node), and that a [local `geth`/`eth` node is running](../README.md#how-to-use).

```bash
npm install remix-debug
```

## Development

```bash
var Debugger = require('remix-debug').EthDebugger
var BreakpointManager = require('remix-debug').EthDebugger

var debugger = new Debugger({
  compilationResult: () => {
    return compilationResult // that helps resolving source location
  }
})

debugger.addProvider(web3, 'web3')
debugger.switchProvider('web3')

var breakPointManager = new remixCore.code.BreakpointManager(this.debugger, (sourceLocation) => {
    // return offsetToLineColumn
})
debugger.setBreakpointManager(breakPointManager)
breakPointManager.add({fileName, row})
breakPointManager.add({fileName, row})

debugger.debug(<tx_hash>)

// this.traceManager.getCurrentCalledAddressAt

debugger.event.register('newTraceLoaded', () => {
  // start doing basic stuff like retrieving step details
  debugger.traceManager.getCallStackAt(34, (error, callstack) => {})
})

debugger.callTree.register('callTreeReady', () => {
  // start doing more complex stuff like resolvng local variables
  breakPointManager.jumpNextBreakpoint(true)
  
  var storageView = debugger.storageViewAt(38, <contract address>, 
  storageView.storageSlot(0, (error, storage) => {})
  storageView.storageRange(error, storage) => {}) // retrieve 0 => 1000 slots

  debugger.extractStateAt(23, (error, state) => {
    debugger.decodeStateAt(23, state, (error, decodedState) => {})
  })
  
  debugger.sourceLocationFromVMTraceIndex(<contract address>, 23, (error, location) => {
    debugger.decodeLocalsAt(23, location, (error, decodedlocals) => {})
  })
  
  debugger.extractLocalsAt(23, (null, locals) => {}
```
