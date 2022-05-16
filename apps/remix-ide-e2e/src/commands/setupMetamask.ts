import { NightwatchBrowser } from 'nightwatch'

const EventEmitter = require('events')

class MetaMask extends EventEmitter {
  command (this: NightwatchBrowser, passphrase: string, password: string): NightwatchBrowser {
    this.api.perform((done) => {
      setupMetaMask(this.api, passphrase, password, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function setupMetaMask (browser: NightwatchBrowser, passphrase: string, password: string, done: VoidFunction) {
  const pass = passphrase.split(' ')
  browser
    .switchBrowserWindow('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#initialize/welcome', 'MetaMask', () => {
      browser.waitForElementPresent('.first-time-flow__button')
        .click('.first-time-flow__button')
        .waitForElementPresent('.select-action__select-button:nth-of-type(1) > .first-time-flow__button')
        .click('.select-action__select-button:nth-of-type(1) > .first-time-flow__button')
        .waitForElementPresent('.page-container__footer-button:nth-of-type(2)')
        .click('.page-container__footer-button:nth-of-type(2)')
        .waitForElementPresent('#import-srp__srp-word-0')
        .setValue('#import-srp__srp-word-0', pass[0])
        .setValue('#import-srp__srp-word-1', pass[1])
        .setValue('#import-srp__srp-word-2', pass[2])
        .setValue('#import-srp__srp-word-3', pass[3])
        .setValue('#import-srp__srp-word-4', pass[4])
        .setValue('#import-srp__srp-word-5', pass[5])
        .setValue('#import-srp__srp-word-6', pass[6])
        .setValue('#import-srp__srp-word-7', pass[7])
        .setValue('#import-srp__srp-word-8', pass[8])
        .setValue('#import-srp__srp-word-9', pass[9])
        .setValue('#import-srp__srp-word-10', pass[10])
        .setValue('#import-srp__srp-word-11', pass[11])
        .pause(1000)
        .setValue('#password', password)
        .setValue('#confirm-password', password)
        .click('#create-new-vault__terms-checkbox')
        .click('.create-new-vault__submit-button')
        .pause(5000)
        .click('.first-time-flow__button')
        .pause(2000)
        .click('.popover-header__button')
        .perform(() => {
          done()
        })
    })
}

module.exports = MetaMask
