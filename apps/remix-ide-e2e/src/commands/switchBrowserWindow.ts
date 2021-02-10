import { NightwatchBrowser, NightwatchCallbackResult } from 'nightwatch'

const EventEmitter = require('events')

class SwitchBrowserWindow extends EventEmitter {
  command (this: NightwatchBrowser, url: string, windowName: string, cb: (browser: NightwatchBrowser, window?: NightwatchCallbackResult<Window>) => void): NightwatchBrowser {
    this.api.perform((done) => {
      switchWindow(this.api, url, windowName, cb)
      done()
      this.emit('complete')
    })
    return this
  }
}

function switchWindow (browser: NightwatchBrowser, url: string, windowName: string, cb: (browser: NightwatchBrowser, window: NightwatchCallbackResult<Window>) => void) {
  browser.execute(function (windowName) {
    return window.open('', windowName, 'width=2560, height=1440')
  }, [windowName], (newWindow) => {
    browser.switchWindow(windowName)
      .url(url)
      .pause(5000)
      .assert.urlContains(url)
    if (cb) cb(browser, newWindow)
  })
}

module.exports = SwitchBrowserWindow
