const EventEmitter = require('events')

class checkElementStyle extends EventEmitter {
  command (cssSelector, styleProperty, expectedResult) {
    this.api.perform((done) => {
      checkStyle(this.api, cssSelector, styleProperty, expectedResult, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function checkStyle (browser, cssSelector, styleProperty, expectedResult, callback) {
  browser.execute(function (cssSelector, styleProperty) {
    return window.getComputedStyle(document.querySelector(cssSelector)).getPropertyValue(styleProperty)
  }, [cssSelector, styleProperty], function (result) {
    const value = result.value

    browser.assert.equal(value.trim(), expectedResult)
    callback()
  })
}

module.exports = checkElementStyle
