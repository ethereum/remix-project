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
  browser.click(`${selector} option[value="${contractName}"]`).perform(() => callback())
}

module.exports = SelectContract
