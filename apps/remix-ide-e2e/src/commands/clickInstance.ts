import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ClickInstance extends EventEmitter {
  command (this: NightwatchBrowser, index: number): NightwatchBrowser {
    const selector = `[data-id="universalDappUiTitleExpander${index}"]`

    this.api.waitForElementPresent(selector).waitForElementContainsText(selector, '', 60000).scrollAndClick(selector).perform(() => { this.emit('complete') })
    return this
  }
}

module.exports = ClickInstance
