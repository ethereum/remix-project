const EventEmitter = require('events')

/*
  Switches between browser tabs
*/

class SwitchBrowserTab extends EventEmitter {
  command (index) {
    this.api.perform((browser, done) => {
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
