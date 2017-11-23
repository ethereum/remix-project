# REMIX

[![Join the chat at https://gitter.im/ethereum/remix](https://badges.gitter.im/ethereum/remix.svg)](https://gitter.im/ethereum/remix?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
Ethereum IDE and tools for the web

## REMIX MODULES:


This repository contains 4 different modules:

### remix-core
Provides:

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

### remix-lib
Provides:

    {
        EventManager: EventManager,
        helpers: {
            trace: traceHelper,
            ui: uiHelper
        },
        vm: {
            Web3Providers: Web3Providers,
            DummyProvider: DummyProvider,
            Web3VMProvider: Web3VMProvider
        },
        SourceMappingDecoder: SourceMappingDecoder,
        SourceLocationTracker: SourceLocationTracker,
        init: init,
        util: util,
        AstWalker: AstWalker,
        global: global,
        ui: {
            styleGuide: styleGuide
        }
        }
    }

### remix-solidity
Provides:

    {
        InternalCallTree: InternalCallTree,
        SolidityProxy: SolidityProxy,
        localDecoder: localDecoder,
        stateDecoder: stateDecoder,
        CodeAnalysis: CodeAnalysis
    }
    
### remix-debugger
Provides:

    {
        ui: {
          Debugger: Debugger,
          VMdebugger: VMDebugger,
          BasicPanel: BasicPanel,
          TreeView: TreeView
        }
      }
    }

## REMIX WEBSITE:

Remix is avalaible at http://ethereum.github.io/remix. 

Note that this repository hosts a debugger module.
The Remix IDE repository is at https://github.com/ethereum/browser-solidity and an online version is at http://remix.ethereum.org.

You can use it either inside Mist or by connecting to geth or eth.
Note that connecting to Geth does not work through https.

You'll have to run your own node using the following parameters:

*DO NOT DO THIS IF geth/eth STORES PRIVATE KEYS* External system might be able to access your node through the RPC server.

Using Geth:

    geth --rpc --rpcapi 'web3,eth,debug' --rpcport 8545 --rpccorsdomain '*'

Using Eth:

    eth -j --rpccorsdomain '*'

geth will run the rpc server on http://localhost:8545, remix uses by default this url.

Remix will use this instance of Geth to retrieve the transaction and the associated trace.
This instance should **only** be used for debugging purposes. Never use features that could have an impact on your keys (do not unlock any keys, do not use this instance together with the wallet, do not activate the admin web3 API).

## INSTALLATION:

Brief instructions to build for linux(Todo add other platforms) we will add detailed instructions later

Install eth or geth, npm and node.js (see https://docs.npmjs.com/getting-started/installing-node), then do:

* `git clone https://github.com/ethereum/remix`
* `cd remix/remix-debugger`
* `npm install`
* `npm start`

open `remix/index.html` in your browser.

## TEST:

* For unit tests run `npm test`

* For local headless browser tests
  * run once to install selenium: `npm run selenium-install`
  * every time you want to run local browser tests, run: `npm run test-browser`

## DEVELOPING:

Run `npm run start_dev` and open `http://127.0.0.1:8080` in your browser.

Start developing and see your browser live reload when you save files

## REMIX First Step:

Once remix is connected to a node, you will be able to debug transactions.
There's two way of doing that:
 - using a block number and a transaction index.
 - using a transaction hash.

When loading the transaction succeed, the hash, from and to field will show up.
Then the vm trace is loaded.

The debugger itself contains several controls that allow stepping over the trace and seing the current state of a selected step.

#### Slider and Stepping action:

The slider allows to move quickly from a state to another.
Stepping actions are:
- Step Into Back
- Step Over Back
- Step Over Forward
- Step Into Forward
- Jump Next Call (this will select the next state that refers to a context changes - CALL, CALLCODE, DELEGATECALL, CREATE)

#### State Viewer:

The upper right panel contains basic informations about the current step:
- VMTraceStep: the index in the trace of the current step.
- Step
- Add memory
- Gas: gas used by this step
- Remaining gas: gas left
- Loaded address: the current code loaded, refers to the executing code.

The other 6 panels describe the current selected state:
 - Instructions list: list of all the instruction that defines the current executing code.
 - Stack
 - Storage Changes
 - Memory
 - Call Data$
 - Call Stack

## CODING STYLE:

Remix uses npm coding style: https://docs.npmjs.com/misc/coding-style
Please be sure your code is compliant with this coding standard before sending PR.
There's on the above page a bunch of links that propose integration with developer tools (Emacs, Atom, ...).
You can also run 'npm run test' to check your local repository against the coding style.
