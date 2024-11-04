import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class HideMetaMaskPopup extends EventEmitter {
  command(this: NightwatchBrowser) {
    browser
      .perform((done) => {
        browser.execute(function () {
          function addStyle(styleString) {
            const style = document.createElement('style')
            style.textContent = styleString
            document.head.append(style)
          }
          addStyle(`
          #popover-content {
            display:none !important
          } 
          .popover-container {
            display:none !important;
          }
        `)
        }, [], done())
      })
      .perform((done) => {
        done()
        this.emit('complete')
      })
  }
}

module.exports = HideMetaMaskPopup
