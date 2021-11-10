import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class clearTransactions extends EventEmitter {
  command (this: NightwatchBrowser): NightwatchBrowser {
    this.api.clickLaunchIcon('udapp').waitForElementPresent('*[data-id="universalDappUiUdappClose"]').click('*[data-id="universalDappUiUdappClose"]').perform((done) => {
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = clearTransactions
