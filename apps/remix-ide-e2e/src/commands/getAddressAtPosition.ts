import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class GetAddressAtPosition extends EventEmitter {
  command (this: NightwatchBrowser, index: number, cb: (pos: string) => void): NightwatchBrowser {
    this.api.perform((done) => {
      getAddressAtPosition(this.api, index, (pos) => {
        done()
        cb(pos)
        this.emit('complete')
      })
    })
    return this
  }
}

function getAddressAtPosition (browser: NightwatchBrowser, index: number, callback: (pos: string) => void) {
  browser.waitForElementPresent('*[data-shared="universalDappUiInstance"]')
    .execute(function (index) {
      const deployedContracts = document.querySelectorAll('*[data-shared="universalDappUiInstance"]')
      const id = deployedContracts[index].getAttribute('id')

      return id.replace('instance', '')
    }, [index], function (result) {
      const pos = typeof result.value === 'string' ? result.value : null

      callback(pos)
    })
}

module.exports = GetAddressAtPosition
