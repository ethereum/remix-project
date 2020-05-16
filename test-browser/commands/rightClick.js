const EventEmitter = require('events')

class RightClick extends EventEmitter {
  command (cssSelector) {
    this.api.perform((done) => {
      rightClick(this.api, cssSelector, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function rightClick (browser, cssSelector, callback) {
  browser.execute(function (cssSelector) {
    const element = document.querySelector(cssSelector)
    const evt = element.ownerDocument.createEvent('MouseEvents')
    const RIGHT_CLICK_BUTTON_CODE = 2

    evt.initMouseEvent('contextmenu', true, true,
          element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,
          false, false, false, RIGHT_CLICK_BUTTON_CODE, null)
    if (document.createEventObject) {
        // dispatch for IE
      return element.fireEvent('onclick', evt)
    } else {
        // dispatch for firefox + others
      return !element.dispatchEvent(evt)
    }
  }, [cssSelector], function () {
    callback()
  })
}

module.exports = RightClick
