import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class SetSolidityCompilerVersion extends EventEmitter {
  command(this: NightwatchBrowser, version: string): NightwatchBrowser {
    this.api
      .waitForElementVisible({
        selector: "//*[@id='versionSelector']",
        locateStrategy: 'xpath'
      })
      .click({
        selector: "//*[@id='versionSelector']",
        locateStrategy: 'xpath'
      })
      .waitForElementVisible(`[data-id="dropdown-item-${version}"]`)
      .click(`[data-id="dropdown-item-${version}"]`)
      .perform(() => {
        this.emit('complete')
      })
    return this
  }
}

module.exports = SetSolidityCompilerVersion
