import { NightwatchBrowser } from 'nightwatch'
import EventEmitter from 'events'

class ModalFooterOKClick extends EventEmitter {
  command (this: NightwatchBrowser, id?: string): NightwatchBrowser {
    const clientId = id ? `*[data-id="${id}-modal-footer-ok-react"]` : '#modal-footer-ok'
    this.api.waitForElementVisible(clientId).perform((client, done) => {
      this.api.execute(function (clientId) {
        const elem = document.querySelector(clientId) as HTMLElement

        elem.click()
      }, [clientId], () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

module.exports = ModalFooterOKClick
