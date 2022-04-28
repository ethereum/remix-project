import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class sendLowLevelTx extends EventEmitter {
  command (this: NightwatchBrowser, address: string, value: string, callData: string): NightwatchBrowser {
    console.log('low level transact to ', address, value, callData)
    this.api.waitForElementVisible(`#instance${address} #deployAndRunLLTxSendTransaction`, 1000)
      .clearValue(`#instance${address} #deployAndRunLLTxCalldata`)
      .sendKeys(`#instance${address} #deployAndRunLLTxCalldata`, ['_', this.api.Keys.BACK_SPACE, callData])
      .waitForElementVisible('#value')
      .clearValue('#value')
      .sendKeys('#value', ['1', this.api.Keys.BACK_SPACE, value])
      .pause(2000)
      .scrollAndClick(`#instance${address} #deployAndRunLLTxSendTransaction`)
      .perform(() => {
        this.emit('complete')
      })
    return this
  }
}

module.exports = sendLowLevelTx
