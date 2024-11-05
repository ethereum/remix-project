import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class HidePopupPanel extends EventEmitter {
  command(this: NightwatchBrowser) {
    browser
      .perform((done) => {
        browser.execute(function () {
          return localStorage.getItem('did_show_popup_panel')
        }, [], function (result) {
          if (!result.value) {
            browser.waitForElementVisible('*[data-id="aiStatusButton"]')
            .click('*[data-id="aiStatusButton"]')
          }
          done()
        })
      })
      .perform((done) => {
        done()
        this.emit('complete')
      })
  }
}

module.exports = HidePopupPanel
