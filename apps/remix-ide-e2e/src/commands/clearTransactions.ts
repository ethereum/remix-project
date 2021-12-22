import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class clearTransactions extends EventEmitter {
  command (this: NightwatchBrowser): NightwatchBrowser {
    const browser = this
    this.api.clickLaunchIcon('udapp').element('css selector', '*[data-id="universalDappUiUdappClose"]', function (visible: any) {
      if (visible.status && visible.status === -1) {
        browser.api.perform((done) => {
          done()
          browser.emit('complete')
        })
      } else {
        browser.api.pause(500).click('*[data-id="universalDappUiUdappClose"]').perform((done) => {
          done()
          browser.emit('complete')
        })
      }
    })
    return this
  }
}

module.exports = clearTransactions
