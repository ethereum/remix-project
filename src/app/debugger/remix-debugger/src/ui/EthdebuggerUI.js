'use strict'
var TxBrowser = require('./TxBrowser')
var StepManager = require('./StepManager')
var VmDebugger = require('./VmDebugger')

var yo = require('yo-yo')
var csjs = require('csjs-inject')

var remixLib = require('remix-lib')
// var TraceManager = remixLib.trace.TraceManager
var init = remixLib.init
var executionContext = remixLib.execution.executionContext
var EventManager = remixLib.EventManager
// var Web3Providers = remixLib.vm.Web3Providers
// var DummyProvider = remixLib.vm.DummyProvider
// var CodeManager = remixLib.code.CodeManager

// var remixDebug = require('remix-debug')
// var SolidityProxy = remixDebug.SolidityDecoder.SolidityProxy
// var InternalCallTree = remixDebug.SolidityDecoder.InternalCallTree

var css = csjs`
  .statusMessage {
    margin-left: 15px;
  }
  .innerShift {
    padding: 2px;
    margin-left: 10px;
  }
`

function EthdebuggerUI (opts) {
  this.opts = opts || {}
  this.debugger = opts.debugger

  if (!this.opts.compilationResult) this.opts.compilationResult = () => { return null }

  var self = this
  this.event = new EventManager()

  this.currentStepIndex = -1
  this.tx
  this.statusMessage = ''

  this.view

  this.event.register('indexChanged', this, function (index) {
    self.debugger.codeManager.resolveStep(index, self.tx)
  })

  executionContext.event.register('contextChanged', this, function () {
    self.updateWeb3Reference()
  })

  setTimeout(function () {
    self.updateWeb3Reference()
  }, 10000)

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

}

EthdebuggerUI.prototype.setManagers = function () {
  // const self = this
  // this.traceManager = new TraceManager({web3: this.web3})
  // this.codeManager = new CodeManager(this.traceManager)
  // this.solidityProxy = new SolidityProxy(this.traceManager, this.codeManager)
  // this.storageResolver = null
  // var callTree = new InternalCallTree(this.event, this.traceManager, this.solidityProxy, this.codeManager, { includeLocalVariables: true })
  // this.callTree = callTree // TODO: currently used by browser solidity, we should improve the API
  // this.vmDebugger = new VmDebugger(this, this.traceManager, this.codeManager, this.solidityProxy, callTree)

  // this.callTree = new InternalCallTree(this.event, this.traceManager, this.solidityProxy, this.codeManager, { includeLocalVariables: true })
  // this.txBrowser = new TxBrowser(this)
  // this.txBrowser.event.register('newTxLoading', this, function () {
  //  self.unLoad()
  // })
  // this.txBrowser.event.register('newTraceRequested', this, function (blockNumber, txIndex, tx) {
  //  console.dir('newTraceRequestd')
  //  console.dir(arguments)
  //  self.startDebugging(blockNumber, txIndex, tx)
  // })
  // this.txBrowser.event.register('unloadRequested', this, function (blockNumber, txIndex, tx) {
  //  self.unLoad()
  // })
  // this.stepManager = new StepManager(this, this.traceManager)
  // this.stepManager.event.register('stepChanged', this, function (stepIndex) {
  //  self.stepChanged(stepIndex)
  // })
  // this.vmDebugger = new VmDebugger(this, this.traceManager, this.codeManager, this.solidityProxy, callTree)

  // this.codeManager.event.register('changed', this, (code, address, instIndex) => {
  //  this.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, this.currentStepIndex, this.solidityProxy.contracts, (error, sourceLocation) => {
  //    if (!error) {
  //      this.event.trigger('sourceLocationChanged', [sourceLocation])
  //    }
  //  })
  // })
}

EthdebuggerUI.prototype.setBreakpointManager = function (breakpointManager) {
  this.breakpointManager = breakpointManager
}

EthdebuggerUI.prototype.get_web3 = function () {
  return this.web3
}

EthdebuggerUI.prototype.addProvider = function (type, obj) {
  this.web3Providers.addProvider(type, obj)
  this.event.trigger('providerAdded', [type])
}

EthdebuggerUI.prototype.updateWeb3Reference = function () {
  if (!this.txBrowser) return
  this.txBrowser.web3 = this.debugger.web3
}

EthdebuggerUI.prototype.switchProvider = function (type) {
  var self = this
  this.web3Providers.get(type, function (error, obj) {
    if (error) {
      console.log('provider ' + type + ' not defined')
    } else {
      self.web3 = obj
      // self.setManagers()
      self.updateWeb3Reference()
      executionContext.detectNetwork((error, network) => {
        if (error || !network) {
          self.web3Debug = obj
          self.web3 = obj
        } else {
          var webDebugNode = init.web3DebugNode(network.name)
          self.web3Debug = !webDebugNode ? obj : webDebugNode
          self.web3 = !webDebugNode ? obj : webDebugNode
        }
        self.updateWeb3Reference()
      })
      self.event.trigger('providerChanged', [type])
    }
  })
}

EthdebuggerUI.prototype.setCompilationResult = function (compilationResult) {
  if (compilationResult && compilationResult.sources && compilationResult.contracts) {
    this.debugger.solidityProxy.reset(compilationResult)
  } else {
    this.debugger.solidityProxy.reset({})
  }
}

EthdebuggerUI.prototype.debug = function (tx) {
  this.setCompilationResult(this.opts.compilationResult())
  if (tx instanceof Object) {
    this.txBrowser.load(tx.hash)
  } else if (tx instanceof String) {
    this.txBrowser.load(tx)
  }
}

EthdebuggerUI.prototype.render = function () {
  this.browserView = yo`<div class="${css.innerShift}">
          ${this.txBrowser.render()}
        </div>`
  var view = yo`<div>
        ${this.browserView}
        <div class="${css.statusMessage}" >${this.statusMessage}</div>
     </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

EthdebuggerUI.prototype.unLoad = function () {
  // this.debugger.traceManager.init()
  // this.debugger.codeManager.clear()
  // this.debugger.stepManager.reset()
  this.debugger.unLoad()
  this.event.trigger('traceUnloaded')
}

EthdebuggerUI.prototype.stepChanged = function (stepIndex) {
  this.currentStepIndex = stepIndex
  this.event.trigger('indexChanged', [stepIndex])
}

EthdebuggerUI.prototype.startDebugging = function (blockNumber, txIndex, tx) {
  const self = this
  console.dir('startDebugging')
  console.dir(arguments)
  if (this.debugger.traceManager.isLoading) {
    return
  }

  console.log('loading trace...')
  this.tx = tx
  // this.tx.hash = txIndex

  // this.debugger.setCompilationResult(this.opts.compilationResult())
  // this.setCompilationResult(this.opts.compilationResult())

  // this.debugger.addProvider('web3', executionContext.web3())
  // this.debugger.switchProvider('web3')

  this.stepManager = new StepManager(this, this.debugger.traceManager)
  this.stepManager.event.register('stepChanged', this, function (stepIndex) {
    self.stepChanged(stepIndex)
  })

  this.debugger.codeManager.event.register('changed', this, (code, address, instIndex) => {
    self.debugger.callTree.sourceLocationTracker.getSourceLocationFromVMTraceIndex(address, this.currentStepIndex, this.debugger.solidityProxy.contracts, (error, sourceLocation) => {
      if (!error) {
        self.event.trigger('sourceLocationChanged', [sourceLocation])
      }
    })
  })

  this.vmDebugger = new VmDebugger(this, this.debugger.traceManager, this.debugger.codeManager, this.debugger.solidityProxy, this.debugger.callTree)
  this.browserView.appendChild(this.stepManager.render())
  this.view.appendChild(this.vmDebugger.render())

  this.debugger.debug(tx)

  // console.dir(this.vmDebugger.render())
  // console.dir(this.view)

  self.debugger.event.register('newTraceLoaded', function () {
    // self.
  })

  console.dir('resolving a trace with tx: ')
  console.dir(tx)
  //  this.debugger.traceManager.resolveTrace(tx, function (error, result) {
  //    console.log('trace loaded ' + result)
  //    if (result) {
  //      self.statusMessage = ''
  //      yo.update(self.view, self.render())
  //      self.debugger.event.trigger('newTraceLoaded', [self.debugger.traceManager.trace])
  //      // if (self.breakpointManager && self.breakpointManager.hasBreakpoint()) {
  //      //  self.breakpointManager.jumpNextBreakpoint(0, false)
  //      // }
  //    } else {
  //      self.statusMessage = error ? error.message : 'Trace not loaded'
  //      yo.update(self.view, self.render())
  //    }
  //  })
}

module.exports = EthdebuggerUI
