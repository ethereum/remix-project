import { NightwatchBrowser, NightwatchAPI } from 'nightwatch'
import EventEmitter from 'events'

/*
  Switches between browser tabs
*/

class SwitchBrowserTab extends EventEmitter {
  command(this: NightwatchBrowser, index: number): NightwatchBrowser {
    this.api.perform((browser: NightwatchAPI, done) => {
      browser.windowHandles((result) => {
        console.log('switching to window', result)
        if (Array.isArray(result.value)) {
          browser.switchWindow(result.value[result.value[index] ? index : 0])
        }
        done()
      })
      this.emit('complete')
    })
    return this
  }
}

module.exports = SwitchBrowserTab
