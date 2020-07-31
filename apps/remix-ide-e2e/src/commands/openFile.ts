import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class OpenFile extends EventEmitter {
  command (this: NightwatchBrowser, name: string) {
    this.api.perform((done) => {
      openFile(this.api, name, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

// click on fileExplorer can toggle it. We go through settings to be sure FE is open
function openFile (browser: NightwatchBrowser, name: string, done: VoidFunction) {
  browser.clickLaunchIcon('settings').clickLaunchIcon('fileExplorers')
      .waitForElementVisible('li[key="' + name + '"]')
      .click('li[key="' + name + '"]')
      .pause(2000)
      .perform(() => {
        done()
      })
}

module.exports = OpenFile
