import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class HidePopupPanel extends EventEmitter {
  command(this: NightwatchBrowser) {
    const TIMEOUT = 40000
    const SELECTOR = '*[data-id="popupPanelToggle"]'

    browser
      .waitForElementPresent('body', 10000)
      .perform((done) => {
        browser.execute(function () {
          return {
            popupState: localStorage.getItem('did_show_popup_panel'),
            elementExists: document.querySelector('*[data-id="popupPanelToggle"]') !== null
          }
        }, [], function (result) {
          if (!result.value.popupState) {
            browser
              .waitForElementPresent(SELECTOR, TIMEOUT)
              .pause(1000)
              .waitForElementVisible(SELECTOR, TIMEOUT)
              .perform(() => {
                browser.click(SELECTOR)
              })
              .pause(500)
          }
          done()
        })
      })
      .perform((done) => {
        done()
        this.emit('complete')
      })
      .catch((error) => {
        console.warn('Warning: Could not hide popup panel:', error.message)
        this.emit('complete')
      })
  }
}

module.exports = HidePopupPanel
