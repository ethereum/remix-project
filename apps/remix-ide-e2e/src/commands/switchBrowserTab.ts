import { NightwatchBrowser } from "nightwatch"

const EventEmitter = require('events')

/*
  Switches between browser tabs
*/

export class SwitchBrowserTab extends EventEmitter {
  command (this: NightwatchBrowser, index: number): NightwatchBrowser {
    this.api.perform((browser: NightwatchBrowser, done) => {
      browser.windowHandles((result) => {
        browser.switchWindow(result.value[index])
        done()
      })
      this.emit('complete')
    })
    return this
  }
}
