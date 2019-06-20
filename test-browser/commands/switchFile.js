const EventEmitter = require('events')

class SwitchFile extends EventEmitter {
  command (contractName) {
    this.api.perform((done) => {
      switchFile(this.api, contractName, () => {
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
