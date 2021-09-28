import { NightwatchBrowser } from 'nightwatch'

const EventEmitter = require('events')

class RemoveFile extends EventEmitter {
  command (this: NightwatchBrowser, path: string, workspace: string): NightwatchBrowser {
    this.api.perform((done) => {
      removeFile(this.api, path, workspace, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function removeFile (browser: NightwatchBrowser, path: string, workspace: string, done: VoidFunction) {
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
      .waitForElementVisible('#menuitemdelete', 60000)
      .click('#menuitemdelete')
      .pause(2000)
      .perform(() => {
        console.log(path, 'to remove')
        browser.waitForElementVisible('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
          .click('[data-id="fileSystemModalDialogModalFooter-react"] .modal-ok')
          .waitForElementNotPresent('[data-path="' + path + '"]')
        done()
      })
  })
}

module.exports = RemoveFile
