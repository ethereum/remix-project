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
      .waitForElementPresent({
        selector: `//*[@data-id='compilerloaded' and @data-version='${version}']`,
        locateStrategy: 'xpath',
        timeout: 120000
      })
      .perform(() => {
        this.emit('complete')
      })
    return this
  }
}

module.exports = SetSolidityCompilerVersion
