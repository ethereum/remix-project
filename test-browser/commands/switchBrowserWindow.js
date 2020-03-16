const EventEmitter = require('events')

class SwitchBrowserWindow extends EventEmitter {
  command (url, windowName) {
    this.api.perform((done) => {
      switchWindow(this.api, url, windowName, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function switchWindow (browser, url, windowName, callback) {
  browser.execute(function (url, windowName) {
    window.open(url, windowName, 'width=2560, height=1440')
  }, [url, windowName], function () {
    browser.switchWindow(windowName)
    .assert.urlContains(url)
    callback()
  })
}

module.exports = SwitchBrowserWindow
