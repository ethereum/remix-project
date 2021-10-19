import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class AcceptAndRemember extends EventEmitter {
  command (this: NightwatchBrowser, remember:boolean, accept: boolean): NightwatchBrowser {
    this.api.perform((done) => {
      acceptAndRemember(this.api, remember, accept, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function acceptAndRemember (browser: NightwatchBrowser, remember: boolean, accept: boolean, callback: VoidFunction) {
  browser.useXpath().waitForElementVisible('//*[@data-id="modalDialogModalBody"]')
  if (remember) {
    browser.click('//*[@id="remember"]', () => {
      if (accept) {
        browser.click('//*[@id="modal-footer-ok"]')
      } else {
        browser.click('//*[@id="modal-footer-cancel"]')
      }
      browser.perform(function () { callback() })
    })
  }
}

module.exports = AcceptAndRemember
