const EventEmitter = require('events')

class SwitchFile extends EventEmitter {
  command (name) {
    this.api.perform((done) => {
      switchFile(this.api, name, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function switchFile (browser, name, done) {
  browser.clickLaunchIcon('settings').clickLaunchIcon('fileExplorers')
      .click('li[key="' + name + '"]')
      .pause(2000)
      .perform(() => {
        done()
      })
}

module.exports = SwitchFile
