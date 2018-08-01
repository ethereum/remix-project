'use strict'
var TxBrowser = require('./TxBrowser')
var StepManager = require('./StepManager')
var remixLib = require('remix-lib')
var TraceManager = remixLib.trace.TraceManager
var VmDebugger = require('./VmDebugger')
var init = remixLib.init
var executionContext = remixLib.execution.executionContext
var EventManager = remixLib.EventManager
var yo = require('yo-yo')
var csjs = require('csjs-inject')
var Web3Providers = remixLib.vm.Web3Providers
var DummyProvider = remixLib.vm.DummyProvider
var CodeManager = remixLib.code.CodeManager
var remixDebug = require('remix-debug')
var SolidityProxy = remixDebug.SolidityDecoder.SolidityProxy
var InternalCallTree = remixDebug.SolidityDecoder.InternalCallTree

var css = csjs`
  .statusMessage {
    margin-left: 15px;
  }
  .innerShift {
    padding: 2px;
    margin-left: 10px;
  }
`

function Ethdebugger (opts) {
  this.opts = opts || {}
  if (!this.opts.compilationResult) this.opts.compilationResult = () => { return null }

  var self = this
  this.event = new EventManager()

  this.currentStepIndex = -1
  this.tx
  this.statusMessage = ''

  this.view
  this.web3Providers = new Web3Providers()
  this.addProvider('DUMMYWEB3', new DummyProvider())
  this.switchProvider('DUMMYWEB3')
  this.traceManager = new TraceManager()
  this.codeManager = new CodeManager(this.traceManager)
  this.solidityProxy = new SolidityProxy(this.traceManager, this.codeManager)

  var callTree = new InternalCallTree(this.event, this.traceManager, this.solidityProxy, this.codeManager, { includeLocalVariables: true })
  this.callTree = callTree // TODO: currently used by browser solidity, we should improve the API

  this.event.register('indexChanged', this, function (index) {
    self.codeManager.resolveStep(index, self.tx)
  })

  this.txBrowser = new TxBrowser(this)
  this.txBrowser.event.register('newTxLoading', this, function () {
    self.unLoad()
  })
  this.txBrowser.event.register('newTraceRequested', this, function (blockNumber, txIndex, tx) {
    console.dir('newTraceRequestd')
    console.dir(arguments)
    self.startDebugging(blockNumber, txIndex, tx)
  })
  this.txBrowser.event.register('unloadRequested', this, function (blockNumber, txIndex, tx) {
    self.unLoad()
  })
  this.stepManager = new StepManager(this, this.traceManager)
  this.stepManager.event.register('stepChanged', this, function (stepIndex) {
    self.stepChanged(stepIndex)
  })
  this.vmDebugger = new VmDebugger(this, this.traceManager, this.codeManager, this.solidityProxy, callTree)

  this.codeManager.event.register('changed', this, (code, address, instIndex) => {
    this.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, this.currentStepIndex, this.solidityProxy.contracts, (error, sourceLocation) => {
      if (!error) {
        this.event.trigger('sourceLocationChanged', [sourceLocation])
      }
    })
  })
}

Ethdebugger.prototype.setManagers = function () {
  this.traceManager = new TraceManager({web3: this.web3})
  this.codeManager = new CodeManager(this.traceManager)
  this.solidityProxy = new SolidityProxy(this.traceManager, this.codeManager)
  this.storageResolver = null
  var callTree = new InternalCallTree(this.event, this.traceManager, this.solidityProxy, this.codeManager, { includeLocalVariables: true })
  this.callTree = callTree // TODO: currently used by browser solidity, we should improve the API
  this.vmDebugger = new VmDebugger(this, this.traceManager, this.codeManager, this.solidityProxy, callTree)

  this.callTree = new InternalCallTree(this.event, this.traceManager, this.solidityProxy, this.codeManager, { includeLocalVariables: true })
}

Ethdebugger.prototype.setBreakpointManager = function (breakpointManager) {
  this.breakpointManager = breakpointManager
}

Ethdebugger.prototype.web3 = function () {
  return global.web3
}

Ethdebugger.prototype.addProvider = function (type, obj) {
  this.web3Providers.addProvider(type, obj)
  this.event.trigger('providerAdded', [type])
}

Ethdebugger.prototype.updateWeb3Reference = function () {
  if (!this.txBrowser) return
  this.txBrowser.web3 = this.web3
}

Ethdebugger.prototype.switchProvider = function (type) {
  var self = this
  this.web3Providers.get(type, function (error, obj) {
    if (error) {
      console.log('provider ' + type + ' not defined')
    } else {
      self.web3 = obj
      self.setManagers()
      self.updateWeb3Reference()
      executionContext.detectNetwork((error, network) => {
        if (error || !network) {
          global.web3Debug = obj
        } else {
          var webDebugNode = init.web3DebugNode(network.name)
          global.web3Debug = !webDebugNode ? obj : webDebugNode
        }
        self.updateWeb3Reference()
      })
      self.event.trigger('providerChanged', [type])
    }
  })
}

Ethdebugger.prototype.setCompilationResult = function (compilationResult) {
  if (compilationResult && compilationResult.sources && compilationResult.contracts) {
    this.solidityProxy.reset(compilationResult)
  } else {
    this.solidityProxy.reset({})
  }
}

Ethdebugger.prototype.debug = function (tx) {
  this.setCompilationResult(this.opts.compilationResult())
  if (tx instanceof Object) {
    this.txBrowser.load(tx.hash)
  } else if (tx instanceof String) {
    this.txBrowser.load(tx)
  }
}

Ethdebugger.prototype.render = function () {
  var view = yo`<div>
        <div class="${css.innerShift}">
          ${this.txBrowser.render()}
          ${this.vmDebugger.renderHead()}
          ${this.stepManager.render()}
        </div>
        <div class="${css.statusMessage}" >${this.statusMessage}</div>
        ${this.vmDebugger.render()}
     </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

Ethdebugger.prototype.unLoad = function () {
  this.traceManager.init()
  this.codeManager.clear()
  this.stepManager.reset()
  this.event.trigger('traceUnloaded')
}

Ethdebugger.prototype.stepChanged = function (stepIndex) {
  this.currentStepIndex = stepIndex
  this.event.trigger('indexChanged', [stepIndex])
}

Ethdebugger.prototype.startDebugging = function (blockNumber, txIndex, tx) {
  console.dir('startDebugging')
  console.dir(arguments)
  if (this.traceManager.isLoading) {
    return
  }
  this.setCompilationResult(this.opts.compilationResult())
  this.statusMessage = 'Loading trace...'
  yo.update(this.view, this.render())
  console.log('loading trace...')
  this.tx = tx
  var self = this
  console.dir('resolving a trace with tx: ')
  console.dir(tx)
  this.traceManager.resolveTrace(tx, function (error, result) {
    console.log('trace loaded ' + result)
    if (result) {
      self.statusMessage = ''
      yo.update(self.view, self.render())
      self.event.trigger('newTraceLoaded', [self.traceManager.trace])
      if (self.breakpointManager && self.breakpointManager.hasBreakpoint()) {
        self.breakpointManager.jumpNextBreakpoint(0, false)
      }
    } else {
      self.statusMessage = error ? error.message : 'Trace not loaded'
      yo.update(self.view, self.render())
    }
  })
}

module.exports = Ethdebugger
