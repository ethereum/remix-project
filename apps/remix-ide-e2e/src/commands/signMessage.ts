import { NightwatchBrowser } from "nightwatch"

const EventEmitter = require('events')

class SelectContract extends EventEmitter {
  command (this: NightwatchBrowser, msg: string, callback: (hash: { value: string }, signature: { value: string }) => void): NightwatchBrowser {
    this.api.perform((done) => {
      signMsg(this.api, msg, (hash, signature) => {
        callback(hash, signature)
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function signMsg (browser: NightwatchBrowser, msg: string, cb: (hash: { value: string }, signature: { value: string }) => void) {
  let hash, signature
  browser
      .waitForElementPresent('i[id="remixRunSignMsg"]')
      .click('i[id="remixRunSignMsg"]')
      .waitForElementVisible('textarea[id="prompt_text"]')
      .setValue('textarea[id="prompt_text"]', msg, () => {
        browser.modalFooterOKClick().perform(
          (client, done) => {
            browser.waitForElementVisible('span[id="remixRunSignMsgHash"]').getText('span[id="remixRunSignMsgHash"]', (v) => { hash = v; done() })
          }
        )
        .perform(
          (client, done) => {
            browser.waitForElementVisible('span[id="remixRunSignMsgSignature"]').getText('span[id="remixRunSignMsgSignature"]', (v) => { signature = v; done() })
          }
        )
        .modalFooterOKClick()
        .perform(
          () => {
            cb(hash, signature)
          }
        )
      })
}

module.exports = SelectContract
