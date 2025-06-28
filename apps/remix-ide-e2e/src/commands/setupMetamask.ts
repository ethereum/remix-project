import { NightwatchBrowser } from 'nightwatch'

const EventEmitter = require('events')

class MetaMask extends EventEmitter {
  command(this: NightwatchBrowser, passphrase: string, password: string): NightwatchBrowser {
    this.api.perform((done) => {
      setupMetaMask(this.api, passphrase, password, () => {
        done()
        this.emit('complete')
      })
    })
    return this
  }
}

function setupMetaMask(browser: NightwatchBrowser, passphrase: string, password: string, done: VoidFunction) {
  //passphrase = 'asset chalk glimpse inch wall tomorrow fatal major crater omit tiny sun'
  const words = passphrase.split(' ')
  console.log('setup metamask')
  browser
    .switchBrowserTab('MetaMask')
    .saveScreenshot('./reports/screenshots/metamask_setup.png')
    .waitForElementVisible('input[data-testid="onboarding-terms-checkbox"]')
    .click('input[data-testid="onboarding-terms-checkbox"]')
    .waitForElementVisible('button[data-testid="onboarding-import-wallet"]')
    .click('button[data-testid="onboarding-import-wallet"]')
    .waitForElementVisible('button[data-testid="metametrics-i-agree"]')
    .click('button[data-testid="metametrics-i-agree"]')
    .waitForElementVisible('input[data-testid="import-srp__srp-word-0"]')
    .setValue('input[data-testid="import-srp__srp-word-0"]', words[0]) // import account
    .setValue('input[data-testid="import-srp__srp-word-1"]', words[1]) // import account
    .setValue('input[data-testid="import-srp__srp-word-2"]', words[2]) // import account
    .setValue('input[data-testid="import-srp__srp-word-3"]', words[3]) // import account
    .setValue('input[data-testid="import-srp__srp-word-4"]', words[4]) // import account
    .setValue('input[data-testid="import-srp__srp-word-5"]', words[5]) // import account
    .setValue('input[data-testid="import-srp__srp-word-6"]', words[6]) // import account
    .setValue('input[data-testid="import-srp__srp-word-7"]', words[7]) // import account
    .setValue('input[data-testid="import-srp__srp-word-8"]', words[8]) // import account
    .setValue('input[data-testid="import-srp__srp-word-9"]', words[9]) // import account
    .setValue('input[data-testid="import-srp__srp-word-10"]', words[10]) // import account
    .setValue('input[data-testid="import-srp__srp-word-11"]', words[11]) // import account
    .click('button[data-testid="import-srp-confirm"]')
    .waitForElementVisible('input[data-testid="create-password-new"]')
    .setValue('input[data-testid="create-password-new"]', password)
    .setValue('input[data-testid="create-password-confirm"]', password)
    .click('input[data-testid="create-password-terms"]')
    .click('button[data-testid="create-password-import"]')
    .waitForElementVisible('button[data-testid="onboarding-complete-done"]')
    .click('button[data-testid="onboarding-complete-done"]')
    .waitForElementVisible('button[data-testid="pin-extension-next"]')
    .click('button[data-testid="pin-extension-next"]')
    .waitForElementVisible('button[data-testid="pin-extension-done"]')
    .click('button[data-testid="pin-extension-done"]')
    .pause(10000)
    .saveScreenshot('./reports/screenshots/metamask.png')
    .waitForElementVisible('[data-testid="network-display"]') 
    .saveScreenshot('./reports/screenshots/metamask_3.png')
    .click('[data-testid="network-display"]')
    .click('.mm-modal-content label.toggle-button--off') // show test networks
    .waitForElementVisible('div[data-testid="Sepolia"]')
    .click('div[data-testid="Sepolia"]') // switch to sepolia
    .waitForElementVisible({
      selector: '//*[@data-testid="network-display" and contains(., "Sepolia")]',
      locateStrategy: 'xpath'
    })
    .waitForElementVisible({
      selector: '//*[@class="eth-overview__balance" and contains(., "SepoliaETH")]',
      locateStrategy: 'xpath'
    })
    .saveScreenshot('./reports/screenshots/metamask_4.png')
    .perform(() => {
      console.log('MetaMask setup complete')
      browser.getCurrentUrl((url) => {
        console.log('MetaMask URL:', url)
        browser.globals.extensionUrl = url.value
        console.log(browser.globals)
        browser.closeWindow()
        done()
      })
    })
}

module.exports = MetaMask
