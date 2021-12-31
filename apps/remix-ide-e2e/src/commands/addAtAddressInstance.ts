import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class addAtAddressInstance extends EventEmitter {
  command (this: NightwatchBrowser, address: string, isValidFormat: boolean, isValidChecksum: boolean): NightwatchBrowser {
    this.api.perform((done: VoidFunction) => {
      addInstance(this.api, address, isValidFormat, isValidChecksum, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function addInstance (browser: NightwatchBrowser, address: string, isValidFormat: boolean, isValidChecksum: boolean, callback: VoidFunction) {
  browser.clickLaunchIcon('udapp').clearValue('.ataddressinput').setValue('.ataddressinput', address, function () {
    if (!isValidFormat || !isValidChecksum) browser.assert.elementPresent('button[id^="runAndDeployAtAdressButton"]:disabled')
    else {
      browser.click('button[id^="runAndDeployAtAdressButton"]')
        .execute(function () {
          const modal = document.querySelector('[data-id="fileSystem-modal-footer-ok-react"]') as HTMLElement
          modal.click()
        })
    }
    callback()
  })
}

module.exports = addAtAddressInstance
