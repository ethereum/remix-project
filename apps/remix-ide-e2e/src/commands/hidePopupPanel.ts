import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

interface PopupResult {
  popupState: string | null
  elementExists: boolean
}

class HidePopupPanel extends EventEmitter {
  command(this: NightwatchBrowser) {
    const TIMEOUT = 40000
    const SELECTOR = '*[data-id="popupPanelToggle"]'

    this
      .waitForElementPresent('body', 10000)
      .perform((done) => {
        this.execute<PopupResult>(function () {
          return {
            popupState: localStorage.getItem('did_show_popup_panel'),
            elementExists: document.querySelector('*[data-id="popupPanelToggle"]') !== null
          }
        }, [], function (result) {
          if (!result.value?.popupState) {
            this
              .waitForElementPresent(SELECTOR, TIMEOUT)
              .pause(1000)
              .waitForElementVisible(SELECTOR, TIMEOUT)
              .perform(() => {
                this.click(SELECTOR)
              })
              .pause(500)
          }
          done()
        }.bind(this))
      })
      .perform((done) => {
        done()
        this.emit('complete')
      })
      .perform((client, done) => {
        console.warn('Warning: Could not hide popup panel')
        this.emit('complete')
        done()
      })

    return this
  }
}

module.exports = HidePopupPanel