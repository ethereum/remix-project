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
  browser
    .switchBrowserWindow('chrome-extension://poemojpkcjbpmcccohjnomjffeinlafe/home.html#initialize/welcome', 'MetaMask', (browser) => {
      browser.waitForElementPresent('.first-time-flow__button')
        .click('.first-time-flow__button')
        .waitForElementPresent('.select-action__select-button:nth-of-type(1) > .first-time-flow__button')
        .click('.select-action__select-button:nth-of-type(1) > .first-time-flow__button')
        .waitForElementPresent('.page-container__footer-button:nth-of-type(2)')
        .click('.page-container__footer-button:nth-of-type(2)')
        .waitForElementPresent('.first-time-flow__textarea')
        .setValue('.first-time-flow__textarea', passphrase)
        .setValue('*[autocomplete="new-password"]', password)
        .setValue('*[autocomplete="confirm-password"]', password)
        .click('.first-time-flow__checkbox')
        .click('.first-time-flow__button')
        .pause(5000)
        .click('.first-time-flow__button')
        .perform(() => {
          done()
        })
    })
}

module.exports = MetaMask
