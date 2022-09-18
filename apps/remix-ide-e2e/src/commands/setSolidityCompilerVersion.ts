import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class SetSolidityCompilerVersion extends EventEmitter {
  command(this: NightwatchBrowser, version: string): NightwatchBrowser {
    this.api
      .waitForElementVisible({
        selector: "//*[@id='versionSelector']",
        locateStrategy: 'xpath'
      })
      .waitForElementPresent({
        selector: `//option[@value='${version}']`,
        locateStrategy: 'xpath'
      })
      .click(`#compileTabView #versionSelector [value="${version}"]`)
      .saveScreenshot(`./reports/screenshots/${version}_1.png`)
      .waitForElementPresent({
        selector: `//span[@data-version='${version}']`,
        locateStrategy: 'xpath',
        timeout: 120000,
      }, 60000, 5000, false, (result) => {
        console.log('COMPILER RESULT', result)
        browser.captureBrowserConsoleLogs((logs) => {
          console.log('COMPILER LOGS', logs)
        })
      })
      .saveScreenshot(`./reports/screenshots/${version}.png`)
      .perform(() => {
        this.emit('complete')
      })
    return this
  }
}

module.exports = SetSolidityCompilerVersion
