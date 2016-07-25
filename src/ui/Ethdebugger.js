'use strict'
var TxBrowser = require('./TxBrowser')
var StepManager = require('./StepManager')
var TraceManager = require('../trace/traceManager')
var VmDebugger = require('./VmDebugger')
var Sticker = require('./Sticker')
var style = require('./styles/basicStyles')
var util = require('../helpers/global')
var EventManager = require('../lib/eventManager')
var yo = require('yo-yo')
var init = require('../helpers/init')
var ui = require('../helpers/ui')
var Web3Provider = require('../web3Provider/web3Provider')

function Ethdebugger (_web) {
  util.extend(this, new EventManager())
  this.currentStepIndex = -1
  this.tx
  this.statusMessage = ''

  this.view
  this.displayConnectionSetting = true

  this.web3 = new Web3Provider()
  if (_web) {
    this.setProvider('EXTERNAL', _web)
  } else {
    this.setProvider('EXTERNAL', init.loadWeb3())
  }

  this.traceManager = new TraceManager(this.web3)

  var self = this
  this.txBrowser = new TxBrowser(this.web3, this.displayConnectionSetting)
  this.txBrowser.register('newTxLoading', this, function () {
    self.unLoad()
  })
  this.txBrowser.register('newTraceRequested', this, function (blockNumber, txIndex, tx) {
    self.startDebugging(blockNumber, txIndex, tx)
  })
  this.txBrowser.register('unloadRequested', this, function (blockNumber, txIndex, tx) {
    self.unLoad()
  })
  this.stepManager = new StepManager(this, this.traceManager)
  this.stepManager.register('stepChanged', this, function (stepIndex) {
    self.stepChanged(stepIndex)
  })
  this.vmDebugger = new VmDebugger(this, this.traceManager, this.web3)
  this.sticker = new Sticker(this, this.traceManager, this.web3)
}

Ethdebugger.prototype.setProvider = function (type, obj) {
  if (type === 'EXTERNAL') {
    init.extendWeb3(obj)
    this.web3.initWeb3(obj)
    this.displayConnectionSetting = true
  } else if (type === 'VM') {
    this.web3.initVM(obj)
    this.displayConnectionSetting = false
  }
}

Ethdebugger.prototype.getWeb3Provider = function () {
  return this.web3
}

Ethdebugger.prototype.changeProvider = function (type) {
  this.web3.switchTo(type, function (error, result) {
    if (error) {
      console.log('provider ' + type + ' not defined')
    }
  })
}

Ethdebugger.prototype.debug = function (tx) {
  this.txBrowser.load(tx.hash)
}

Ethdebugger.prototype.render = function () {
  var view = yo`<div style=${ui.formatCss(style.font)}>
        <h1 style=${ui.formatCss(style.container)}>VM Debugger</h1>
        <div style='display:inline-block'>
          ${this.txBrowser.render()}
          ${this.stepManager.render()}
        </div>
        <div style='display:inline-block'>
          ${this.sticker.render()}
        </div>
        <div style=${ui.formatCss(style.statusMessage)} >${this.statusMessage}</div>
        ${this.vmDebugger.render()}
     </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

Ethdebugger.prototype.unLoad = function () {
  this.traceManager.init()
  this.stepManager.reset()
  this.trigger('traceUnloaded')
}

Ethdebugger.prototype.stepChanged = function (stepIndex) {
  this.currentStepIndex = stepIndex
  this.trigger('indexChanged', [stepIndex])
}

Ethdebugger.prototype.startDebugging = function (blockNumber, txIndex, tx) {
  if (this.traceManager.isLoading) {
    return
  }
  this.statusMessage = 'Loading trace...'
  yo.update(this.view, this.render())
  console.log('loading trace...')
  this.tx = tx
  var self = this
  this.traceManager.resolveTrace(tx, function (error, result) {
    console.log('trace loaded ' + result + ' ' + error)
    if (result) {
      self.statusMessage = ''
      yo.update(self.view, self.render())
      self.trigger('newTraceLoaded')
    } else {
      self.statusMessage = error
      yo.update(self.view, self.render())
    }
  })
}

module.exports = Ethdebugger
