const EventEmitter = require('events')

class ClickElement extends EventEmitter {
  command (cssSelector, index = 0) {
    this.api.perform((done) => {
      _clickElement(this.api, cssSelector, index, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function _clickElement (browser, cssSelector, index, cb) {
  browser.waitForElementPresent(cssSelector)
  .execute(function (cssSelector, index) {
    document.querySelectorAll(cssSelector)[index].click()
  }, [cssSelector, index], function () {
    cb()
  })
}

module.exports = ClickElement
