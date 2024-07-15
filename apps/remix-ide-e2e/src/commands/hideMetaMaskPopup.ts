import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class HideMetaMaskPopup extends EventEmitter {
  command(this: NightwatchBrowser) {
    browser
      .waitForElementVisible({
        selector: 'button[data-testid="popover-close"]',
        locateStrategy: 'css selector',
        suppressNotFoundErrors: true,
        abortOnFailure: false,
        timeout: 10000
      })
      .isVisible({
        selector: 'button[data-testid="popover-close"]',
        locateStrategy: 'css selector',
        suppressNotFoundErrors: true,
        timeout: 3000
      }, (okVisible) => {
        console.log('okVisible', okVisible)
        if (!okVisible.value) {
          console.log('popover not found')
        } else {
          console.log('popover found... closing')
          browser.click('button[data-testid="popover-close"]')
        }
      })
      .waitForElementNotPresent({
        selector: 'button[data-testid="popover-close"]',
        locateStrategy: 'css selector',
        timeout: 3000
      })
  }
}

module.exports = HideMetaMaskPopup
