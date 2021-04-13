import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class debugTransaction extends EventEmitter {
  command (this: NightwatchBrowser, index = 0): NightwatchBrowser {
    this.api.perform((done) => {
      checkStyle(this.api, index, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function checkStyle (browser: NightwatchBrowser, index: number, callback: VoidFunction) {
  browser.pause(5000).execute(function (index: number) {
    const debugBtn = document.querySelectorAll('*[data-shared="txLoggerDebugButton"]')[index] as HTMLInputElement

    debugBtn && debugBtn.click()
  }, [index], function () {
    browser.waitForElementVisible('*[data-id="buttonNavigatorJumpPreviousBreakpoint"]', 60000).perform(() => callback())
  })
}

module.exports = debugTransaction
