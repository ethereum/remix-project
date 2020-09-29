import EventEmitter from 'events'
import { NightwatchBrowser } from 'nightwatch'

class checkElementStyle extends EventEmitter {
  command (this: NightwatchBrowser, cssSelector: string, styleProperty: string, expectedResult: string): NightwatchBrowser {
    this.api.perform((done) => {
      checkStyle(this.api, cssSelector, styleProperty, expectedResult, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function checkStyle (browser: NightwatchBrowser, cssSelector: string, styleProperty: string, expectedResult: string, callback: VoidFunction) {
  browser.execute(function (cssSelector, styleProperty) {
    return window.getComputedStyle(document.querySelector(cssSelector)).getPropertyValue(styleProperty)
  }, [cssSelector, styleProperty], function (result) {
    const value = result.value

    if (typeof value === 'string') {
      browser.assert.equal(value.trim().toLowerCase(), expectedResult.toLowerCase())
    } else {
      browser.assert.fail('Failed with error info :', result.value.toString())
    }
    callback()
  })
}

module.exports = checkElementStyle
