import EventEmitter from 'events'
import { NightwatchBrowser } from 'nightwatch'

class RenameFile extends EventEmitter {
  command (this: NightwatchBrowser, path: string, newFileName: string, renamedPath: string) {
    this.api.perform((done) => {
      renameFile(this.api, path, newFileName, renamedPath, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function renameFile (browser: NightwatchBrowser, path: string, newFileName: string, renamedPath: string, done: VoidFunction) {
  browser.execute(function (path: string) {
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
      .click('#menuitemrename')
      .perform((client, doneSetValue) => {
        browser.execute(function (path, addvalue) {
          document.querySelector('[data-path="' + path + '"]').innerHTML = addvalue
        }, [path, newFileName], () => {
          doneSetValue()
        })
      })
      .click('body') // blur
      .waitForElementVisible('#modal-footer-ok', 10000)
      .pause(2000)
      .click('#modal-footer-ok')
      .waitForElementNotPresent('[data-path="' + path + '"]')
      .waitForElementPresent('[data-path="' + renamedPath + '"]')
      .perform(() => {
        done()
      })
  })
}

module.exports = RenameFile