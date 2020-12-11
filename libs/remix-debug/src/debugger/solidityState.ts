const EventManager = require('../eventManager')
const stateDecoder = require('../solidity-decoder/stateDecoder')
const StorageViewer = require('../storage/storageViewer')

export class DebuggerSolidityState {

  event
  storageResolver
  stepManager
  traceManager
  codeManager
  solidityProxy
  stateVariablesByAddresses
  tx

  constructor (tx, _stepManager, _traceManager, _codeManager, _solidityProxy) {
    this.event = new EventManager()
    this.storageResolver = null
    this.stepManager = _stepManager
    this.traceManager = _traceManager
    this.codeManager = _codeManager
    this.solidityProxy = _solidityProxy
    this.stateVariablesByAddresses = {}
    this.tx = tx
  }

  init (index) {
    let decodeTimeout = null
    if (index < 0) {
      return this.event.trigger('solidityStateMessage', ['invalid step index'])
    }

    if (this.stepManager.currentStepIndex !== index) return
    if (!this.solidityProxy.loaded()) {
      return this.event.trigger('solidityStateMessage', ['invalid step index'])
    }

    if (!this.storageResolver) {
      return
    }
    if (decodeTimeout) {
      window.clearTimeout(decodeTimeout)
    }
    this.event.trigger('solidityStateUpdating')
    decodeTimeout = setTimeout(() => {
      // necessary due to some states that can crash the debugger
      try {
        this.decode(index)
      } catch (err) {
        console.dir('====> error')
        console.dir(err)
      }
    }, 500)
  }

  reset () {
    this.stateVariablesByAddresses = {}
  }

  decode (index) {
    try {
      const address = this.traceManager.getCurrentCalledAddressAt(this.stepManager.currentStepIndex)
      if (this.stateVariablesByAddresses[address]) {
        return this.extractStateVariables(this.stateVariablesByAddresses[address], address)
      }
      this.solidityProxy.extractStateVariablesAt(index).then((stateVars) => {
        this.stateVariablesByAddresses[address] = stateVars
        this.extractStateVariables(stateVars, address)
      }).catch((_error) => {
        this.event.trigger('solidityState', [{}])
      })
    } catch (error) {
      return this.event.trigger('solidityState', [{}])
    }
  }

  extractStateVariables (stateVars, address) {
    const storageViewer = new StorageViewer({ stepIndex: this.stepManager.currentStepIndex, tx: this.tx, address: address }, this.storageResolver, this.traceManager)
    stateDecoder.decodeState(stateVars, storageViewer).then((result) => {
      this.event.trigger('solidityStateMessage', [''])
      if (result.error) {
        return this.event.trigger('solidityStateMessage', [result.error])
      }
      this.event.trigger('solidityState', [result])
    })
  }
}
