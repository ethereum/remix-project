import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ClickInstance extends EventEmitter {
  command (this: NightwatchBrowser, index: number): NightwatchBrowser {
    index = index + 2
    const selector = '.instance:nth-of-type(' + index + ') > div > button'

    this.api.waitForElementPresent(selector).waitForElementContainsText(selector, '', 60000).scrollAndClick(selector).perform(() => { this.emit('complete') })
    return this
  }
}

module.exports = ClickInstance
