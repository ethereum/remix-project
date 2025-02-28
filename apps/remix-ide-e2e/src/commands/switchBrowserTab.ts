import { NightwatchBrowser, NightwatchAPI } from 'nightwatch'
import EventEmitter from 'events'

/*
  Switches between browser tabs
*/

class SwitchBrowserTab extends EventEmitter {
  command(this: NightwatchBrowser, index: number): NightwatchBrowser {
    this.api.perform((browser: NightwatchAPI, done) => {
      const runtimeBrowser = browser.options.desiredCapabilities.browserName
      browser.windowHandles((result) => {
        console.log('switching to window', result)
        if (Array.isArray(result.value)) {
          if(runtimeBrowser === 'chrome') {
            index = index + 1
          }
          browser.switchWindow(result.value[index] || result.value[0])
        }
        done()
      })
      this.emit('complete')
    })
    return this
  }
}

module.exports = SwitchBrowserTab
