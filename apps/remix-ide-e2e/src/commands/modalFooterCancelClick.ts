import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from "events"

class ModalFooterOKClick extends EventEmitter {
  command (this: NightwatchBrowser): NightwatchBrowser {
    this.api.waitForElementVisible('#modal-footer-cancel').perform((client, done) => {
      this.api.execute(function () {
        const elem = document.querySelector('#modal-footer-cancel') as HTMLElement
        
        elem.click()
      }, [], () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

module.exports = ModalFooterOKClick
