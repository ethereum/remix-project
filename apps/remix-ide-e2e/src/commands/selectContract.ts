import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

const selector = '.udapp_contractNames'

class SelectContract extends EventEmitter {
  command (this: NightwatchBrowser, contractName: string): NightwatchBrowser {
    this.api.waitForElementVisible(selector).perform((done) => {
      selectContract(this.api, contractName, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function selectContract (browser: NightwatchBrowser, contractName: string, callback: VoidFunction) {
  browser.clickLaunchIcon('settings').clickLaunchIcon('udapp')
  .pause(10000)
  .setValue('#runTabView select[class^="contractNames"]', contractName).perform(() => {
    callback()
  })
}

module.exports = SelectContract
