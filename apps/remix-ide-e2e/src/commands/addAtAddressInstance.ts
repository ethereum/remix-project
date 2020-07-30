import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from "events"

class addAtAddressInstance extends EventEmitter {
  command (this: NightwatchBrowser, address: string, isValidFormat: boolean, isValidChecksum: boolean): NightwatchBrowser {
    this.api.perform((done) => {
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
    browser.click('button[id^="runAndDeployAtAdressButton"]')
        .execute(function () {
          const ret = document.querySelector('div[class^="modal-body"] div').innerHTML
          const modal = document.querySelector('#modal-footer-ok') as HTMLElement
          
          modal.click()
          return ret
        }, [], function (result) {
          if (!isValidFormat) {
            browser.assert.equal(result.value, 'Invalid address.')
          } else if (!isValidChecksum) {
            browser.assert.equal(result.value, 'Invalid checksum address.')
          }
          callback()
        })
  })
}

module.exports = addAtAddressInstance
