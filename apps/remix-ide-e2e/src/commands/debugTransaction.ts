import { NightwatchBrowser } from "nightwatch"
import EventEmitter from "events"

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
  browser.pause(2000).execute(function (index: number) {
    const debugBtn = document.querySelectorAll('*[data-shared="txLoggerDebugButton"]')[index] as HTMLInputElement

    debugBtn.click()
  }, [index], function () {
    callback()
  })
}

module.exports = debugTransaction
