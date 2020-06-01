# `remix-debug`

remix-debug wrap other remix-* libraries and can be used to debug Ethereum transactions.

+ [Installation](#installation)
+ [Development](#development)

## Installation


```bash
npm install remix-debug
```

## Development

```javascript
var Debugger = require('remix-debug').EthDebugger
var BreakpointManager = require('remix-debug').BreakpointManager

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
  
  debugger.extractLocalsAt(23, (null, locals) => {})
  
})
```

## Library

Provides:

```javascript
{
    code: {
        CodeManager: CodeManager,
        BreakpointManager: BreakpointManager
    },
    storage: {
        StorageViewer: StorageViewer,
        StorageResolver: StorageResolver
    },
    trace: {
        TraceManager: TraceManager
    }
}
```
      

TraceManager is a convenient way to access a VM Trace and resolve some value from it.

`TraceManager()` :

`function resolveTrace(stepIndex, tx)`

`function init(stepIndex, tx)`

`function inRange(stepIndex, tx)`

`function isLoaded(stepIndex, tx)`

`function getLength(stepIndex, tx)`

`function accumulateStorageChanges(stepIndex, tx)`

`function getAddresses(stepIndex, tx)`

`function getCallDataAt(stepIndex, tx)`

`function getCallStackAt(stepIndex, tx)`

`function getStackAt(stepIndex, tx)`

`function getLastCallChangeSince(stepIndex, tx)`

`function getCurrentCalledAddressAt(stepIndex, tx)`

`function getContractCreationCode(stepIndex, tx)`

`function getMemoryAt(stepIndex, tx)`

`function getCurrentPC(stepIndex, tx)`

`function getReturnValue(stepIndex, tx)`

`function getCurrentStep(stepIndex, tx)`

`function getMemExpand(stepIndex, tx)`

`function getStepCost(stepIndex, tx)`

`function getRemainingGas(stepIndex, tx)`

`function getStepCost(stepIndex, tx)`

`function isCreationStep(stepIndex, tx)`

`function findStepOverBack(stepIndex, tx)`

`function findStepOverForward(stepIndex, tx)`

`function findStepOverBack(stepIndex, tx)`

`function findNextCall(stepIndex, tx)`

`function findStepOut(stepIndex, tx)`

`function checkRequestedStep(stepIndex, tx)`

`function waterfall(stepIndex, tx)`


- - - -

`CodeManager(_traceManager)` :

`function getCode(stepIndex, tx)` :
Resolve the code of the given @arg stepIndex and trigger appropriate event

`function resolveStep(address, cb)` :
Retrieve the code located at the given @arg address

`function getFunctionFromStep(stepIndex, sourceMap, ast)` :
Retrieve the called function for the current vm step

`function getInstructionIndex(address, step, callback)` :
Retrieve the instruction index of the given @arg step

`function getFunctionFromPC(address, pc, sourceMap, ast)` :
Retrieve the called function for the given @arg pc and @arg address

- - - -

`BreakpointManager(_ethdebugger, _locationToRowConverter)` :

`function jumpNextBreakpoint(defaultToLimit)` :
start looking for the next breakpoint

`function jumpPreviousBreakpoint(defaultToLimit)` :
start looking for the previous breakpoint

`function jump(direction, defaultToLimit)` :
start looking for the previous or next breakpoint

`function hasBreakpointAtLine((fileIndex, line)` :
check the given pair fileIndex/line against registered breakpoints

`function hasBreakpoint()` :
return true if current manager has breakpoint

`function add(sourceLocation)` :
add a new breakpoint to the manager

`function remove(sourceLocation)` :
remove a breakpoint from the manager

- - - -

`StorageViewer(_context, _storageResolver, _traceManager)` :

`function storageRange(defaultToLimit)` :
return the storage for the current context (address and vm trace index)

`function storageSlot(defaultToLimit)` :
return a slot value for the current context (address and vm trace index)

`function isComplete(direction, defaultToLimit)` :
return True if the storage at @arg address is complete

`function initialMappingsLocation((fileIndex, line)` :
return all the possible mappings locations for the current context (cached) do not return state changes during the current transaction

`function mappingsLocation()` :
return all the possible mappings locations for the current context (cached) and current mapping slot. returns state changes during the current transaction

`function extractMappingsLocationChanges(sourceLocation)` :
retrieve mapping location changes from the storage changes.

- - - -

`StorageResolver()` :

`function storageRange(tx, stepIndex, address, callback)` :
return the storage for the current context (address and vm trace index)

`function initialPreimagesMappings(tx, stepIndex, address, callback)` :
return a slot value for the current context (address and vm trace index)

`function storageSlot(slot, tx, stepIndex, address, callback)` :
return True if the storage at @arg address is complete

`function isComplete(address)` :
return all the possible mappings locations for the current context (cached) do not return state changes during the current transaction

