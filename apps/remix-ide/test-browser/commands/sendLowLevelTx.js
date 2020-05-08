const EventEmitter = require('events')
class sendLowLevelTx extends EventEmitter {
  command (address, value, callData) {
    console.log('low level transact to ', address, value, callData)
    this.api.waitForElementVisible(`#instance${address} #deployAndRunLLTxSendTransaction`, 1000)
        .clearValue(`#instance${address} #deployAndRunLLTxCalldata`)
        .setValue(`#instance${address} #deployAndRunLLTxCalldata`, callData)
        .waitForElementVisible('#value')
        .clearValue('#value')
        .setValue('#value', value)
        .scrollAndClick(`#instance${address} #deployAndRunLLTxSendTransaction`)
        .perform(() => {
          this.emit('complete')
        })
    return this
  }
}

module.exports = sendLowLevelTx
