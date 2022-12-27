import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ClickLaunchIcon extends EventEmitter {
  command (this: NightwatchBrowser, icon: string): NightwatchBrowser {
    console.log(icon)
    this.api
    .useXpath()
    .assert.visible(`//*[@id="verticalIconsKind${icon}"]`)
    // .waitForElementVisible('#icon-panel div[plugin="' + icon + '"]')
    .click(`//*[@id="verticalIconsKind${icon}"]`)
    .useCss()
    // .click('#icon-panel div[plugin="' + icon + '"]')
    .perform((done) => {
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = ClickLaunchIcon
