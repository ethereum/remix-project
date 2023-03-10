import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ContractsAreCompiled extends EventEmitter {
  command(this: NightwatchBrowser, contracts: string[]): NightwatchBrowser {
    this.api.perform((done) => {
      contractsAreCompiled
        (this.api, contracts, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function contractsAreCompiled(browser: NightwatchBrowser, contracts: string[], callback: VoidFunction) {
  browser
    .clickLaunchIcon('solidity')
    .waitForElementPresent('*[data-id="compiledContracts"] option', 60000)
    .perform(async (done) => {
      for (const index in contracts) {
        await browser.waitForElementPresent({
          selector: `//*[@data-id="compiledContracts" and contains(.,'${contracts[index]}')]`,
          locateStrategy: 'xpath'
        })
      }
      done()
      callback()
    })
}

module.exports = ContractsAreCompiled
