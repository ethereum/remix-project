const EventEmitter = require('events')

class MetaMask extends EventEmitter {
  command () {
    this.api.perform((done) => {
      setupMetaMask(this.api, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function setupMetaMask (browser, done) {
  browser
  .keys(browser.Keys.ALT).keys(browser.Keys.SHIFT).keys('M')
  .pause(100000)
  .waitForElementPresent('.first-time-flow__button')
  .click('.first-time-flow__button')
  .waitForElementPresent('.select-action__select-button:nth-of-type(1) > .first-time-flow__button')
  .click('.select-action__select-button:nth-of-type(1) > .first-time-flow__button')
  .waitForElementPresent('.page-container__footer-button:nth-of-type(2)')
  .click('.page-container__footer-button:nth-of-type(2)')
  .waitForElementPresent('.first-time-flow__textarea')
  .setValue('.first-time-flow__textarea', 'explain uniform adapt basic blue onion rebel pull rice erase volcano couple')
  .setValue('*[autocomplete="new-password"]', 'remix_is_cool')
  .setValue('*[autocomplete="confirm-password"]', 'remix_is_cool')
  .click('.first-time-flow__checkbox')
  .pause(5000)
  .click('.first-time-flow__button')
  .perform(() => {
    done()
  })
}

module.exports = MetaMask
