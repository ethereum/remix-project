import { NightwatchBrowser } from "nightwatch"

const EventEmitter = require('events')

class RemoveFile extends EventEmitter {
  command (this: NightwatchBrowser, path: string): NightwatchBrowser {
    this.api.perform((done) => {
      removeFile(this.api, path, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function removeFile (browser: NightwatchBrowser, path: string, done: VoidFunction) {
  browser.execute(function (path) {
    function contextMenuClick (element) {
      const evt = element.ownerDocument.createEvent('MouseEvents')
      const RIGHT_CLICK_BUTTON_CODE = 2 // the same for FF and IE

      evt.initMouseEvent('contextmenu', true, true,
            element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,
            false, false, false, RIGHT_CLICK_BUTTON_CODE, null)
      if (Object.prototype.hasOwnProperty.call(document, 'createEventObject')) {
          // dispatch for IE
        return element.fireEvent('onclick', evt)
      } else {
          // dispatch for firefox + others
        return !element.dispatchEvent(evt)
      }
    }
    contextMenuClick(document.querySelector('[data-path="' + path + '"]'))
  }, [path], function () {
    browser
      .waitForElementVisible('#menuitemdelete', 2000)
      .click('#menuitemdelete')
      .pause(500)
      .waitForElementVisible('#modal-footer-ok', 2000)
      .click('#modal-footer-ok')
      .waitForElementNotPresent('[data-path="' + path + '"]')
      .perform(() => {
        done()
      })
  })
}

module.exports = RemoveFile
