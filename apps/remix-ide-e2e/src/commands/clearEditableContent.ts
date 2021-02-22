import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class clearEditablecontent extends EventEmitter {
  command (this: NightwatchBrowser, cssSelector: string): NightwatchBrowser {
    this.api.perform((done) => {
      clearContent(this.api, cssSelector, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function clearContent (browser: NightwatchBrowser, cssSelector: string, callback: VoidFunction) {
  browser.execute(function (cssSelector) {
    const selection = window.getSelection()
    const range = document.createRange()

    range.selectNodeContents(document.querySelector(cssSelector))
    selection.removeAllRanges()
    selection.addRange(range)
  }, [cssSelector], function () {
    browser.sendKeys(cssSelector, browser.Keys.BACK_SPACE)
      .pause(5000)
    callback()
  })
}

module.exports = clearEditablecontent
