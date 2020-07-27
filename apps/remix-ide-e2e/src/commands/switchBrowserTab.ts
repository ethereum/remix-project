import { NightwatchBrowser } from "nightwatch"

const EventEmitter = require('events')

/*
  Switches between browser tabs
*/

class SwitchBrowserTab extends EventEmitter {
  command (this: NightwatchBrowser, index: number) {
    this.api.perform((browser: NightwatchBrowser, done: VoidFunction) => {
      browser.windowHandles((result) => {
        browser.switchWindow(result.value[index])
        done()
      })
      this.emit('complete')
    })
    return this
  }
}

module.exports = SwitchBrowserTab
