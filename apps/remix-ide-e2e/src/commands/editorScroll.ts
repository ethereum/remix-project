import { NightwatchBrowser } from "nightwatch"
import EventEmitter from "events"

// fix for editor scroll
class ScrollEditor extends EventEmitter {
  command (this: NightwatchBrowser, direction: 'up' | 'down', numberOfTimes: number): NightwatchBrowser {
    const browser = this.api

    browser.waitForElementPresent('.ace_text-input')
    for (let i = 0; i < numberOfTimes; i++) {
      if (direction.toLowerCase() === 'up') browser.sendKeys('.ace_text-input', browser.Keys.ARROW_UP)
      if (direction.toLowerCase() === 'down') browser.sendKeys('.ace_text-input', browser.Keys.ARROW_DOWN)
    }
    browser.perform((done) => {
      done()
      this.emit('complete')
    })
    return this
  }
}

module.exports = ScrollEditor
