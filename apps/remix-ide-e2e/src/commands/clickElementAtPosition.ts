import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ClickElement extends EventEmitter {
  command (this: NightwatchBrowser, cssSelector: string, index = 0): NightwatchBrowser {
    this.api.perform((done) => {
      _clickElement(this.api, cssSelector, index, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function _clickElement (browser: NightwatchBrowser, cssSelector: string, index: number, cb: VoidFunction) {
  browser.waitForElementPresent(cssSelector)
    .execute(function (cssSelector: string, index: number) {
      const elem = document.querySelectorAll(cssSelector)[index] as HTMLElement

      elem.click()
    }, [cssSelector, index], function () {
      cb()
    })
}

module.exports = ClickElement
