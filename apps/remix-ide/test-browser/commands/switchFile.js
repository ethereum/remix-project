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

// click on fileExplorer can toggle it. We go through settings to be sure FE is open
function switchFile (browser, name, done) {
  browser.clickLaunchIcon('settings').clickLaunchIcon('fileExplorers')
      .waitForElementVisible('li[key="' + name + '"]')
      .click('li[key="' + name + '"]')
      .pause(2000)
      .perform(() => {
        done()
      })
}

module.exports = SwitchFile
