'use strict'

import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  '@disabled': true,
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },
  'Should activate delegation and make a transaction to the authority address #group1': function (browser: NightwatchBrowser) {
    let addressDelegate
    browser
      .pinGrid('vm-pectra', true)
      .clickLaunchIcon('udapp')
      .switchEnvironment('vm-pectra')
      .addFile('delegate.sol', { content: delegate })
      .clickLaunchIcon('solidity')
      .setSolidityCompilerVersion('soljson-v0.8.24+commit.e11b9ed9.js')
      .clickLaunchIcon('solidity')
      .verifyContracts(['TestDelegate'])
      .clickLaunchIcon('udapp')
      .selectContract('Simple7702Account')
      .createContract('')
      .perform((done) => {
        browser.getAddressAtPosition(0, (address) => {
          addressDelegate = delegate
        })
      })
      .click('*[data-id="create-delegation-authorization"]')
      .setValue('*[data-id="create-delegation-authorization-input"]', addressDelegate)
      .modalFooterOKClick('udapp')
      .waitForElementContainsText('*[data-id="terminalJournal"]', 'This account will be running the code located at')
      .clickInstance(1)
      .clickFunction('entryPoint - call (not payable)')
      .verifyCallReturnValue('0x5B38Da6a701c568545dCfcB03FcB875f56beddC4', ['0:address: 0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108'])
  } 
}

const delegate = `import "https://github.com/eth-infinitism/account-abstraction/blob/v0.8.0/contracts/accounts/Simple7702Account.sol";`
