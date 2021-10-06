import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ClickElement extends EventEmitter {
  command (this: NightwatchBrowser, cssSelector: string, index = 0, opt = { forceSelectIfUnselected: false }): NightwatchBrowser {
    this.api.perform((done) => {
      _clickElement(this.api, cssSelector, index, opt.forceSelectIfUnselected, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function _clickElement (browser: NightwatchBrowser, cssSelector: string, index: number, forceSelectIfUnselected: boolean, cb: VoidFunction) {
  browser.waitForElementPresent(cssSelector)
    .execute(function (cssSelector: string, index: number, forceSelectIfUnselected: boolean) {
      const elem = document.querySelectorAll(cssSelector)[index] as HTMLElement
      if (forceSelectIfUnselected) {
        if (!(elem as any).checked) elem.click()
      } else elem.click()
    }, [cssSelector, index, forceSelectIfUnselected], function () {
      cb()
    })
}

module.exports = ClickElement
