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
          result.value.forEach((handle, i) => {
            browser.switchWindow(handle);
            browser.getTitle((title) => {
              console.log(`🪟 Tab ${i}: Title → ${title}`);
            });
            browser.getCurrentUrl((url) => {
              console.log(`🌐 Tab ${i}: URL   → ${url}`);
            });
          });
      
          const targetHandle = result.value[index] || result.value[0];
          browser.switchWindow(targetHandle);
        }
        done()
      })
      this.emit('complete')
    })
    return this
  }
}

module.exports = SwitchBrowserTab
