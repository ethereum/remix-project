import EventEmitter from 'events'
import { NightwatchBrowser } from 'nightwatch'

class RenamePath extends EventEmitter {
  command(this: NightwatchBrowser, path: string, newFileName: string, renamedPath: string) {
    this.api.perform((done) => {
      renamePath(this.api, path, newFileName, renamedPath, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function renamePath(browser: NightwatchBrowser, path: string, newFileName: string, renamedPath: string, done: VoidFunction) {
  browser.execute(function (path: string) {
    function contextMenuClick(element) {
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
    try {
      browser
        .click('#menuitemrename')
        .sendKeys('[data-input-path="' + path + '"]', newFileName)
        .sendKeys('[data-input-path="' + path + '"]', browser.Keys.ENTER)
        .waitForElementNotPresent('[data-path="' + path + '"]')
        .waitForElementPresent('[data-path="' + renamedPath + '"]');
    } catch (error) {
      console.error('An error occurred:', error.message);
    } finally {
      done(); // Ensure done is called even if there's an error
    }
  })
}

module.exports = RenamePath
