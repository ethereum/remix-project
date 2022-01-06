import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class addAtAddressInstance extends EventEmitter {
  command (this: NightwatchBrowser, address: string, isValidFormat: boolean, isValidChecksum: boolean, isAbi = true): NightwatchBrowser {
    this.api.perform((done: VoidFunction) => {
      addInstance(this.api, address, isValidFormat, isValidChecksum, isAbi, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function addInstance (browser: NightwatchBrowser, address: string, isValidFormat: boolean, isValidChecksum: boolean, isAbi: boolean, callback: VoidFunction) {
  browser.clickLaunchIcon('udapp').clearValue('.ataddressinput').setValue('.ataddressinput', address, function () {
    if (!isValidFormat || !isValidChecksum) browser.assert.elementPresent('button[id^="runAndDeployAtAdressButton"]:disabled')
    else if (isAbi) {
      browser.click('button[id^="runAndDeployAtAdressButton"]')
        .waitForElementPresent('[data-id="udappNotify-modal-footer-ok-react"]')
        .execute(function () {
          const modal = document.querySelector('[data-id="udappNotify-modal-footer-ok-react"]') as any

          modal.click()
        })
    } else {
      browser.click('button[id^="runAndDeployAtAdressButton"]')
    }
    callback()
  })
}

module.exports = addAtAddressInstance
