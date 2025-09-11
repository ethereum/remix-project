import { NightwatchBrowser } from 'nightwatch'

const tests = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    browser.hideToolTips()
    done()
  },
  'open default template': function (browser: NightwatchBrowser) {
    browser
      .waitForElementVisible('*[data-id="remixIdeIconPanel"]', 60000)
      .waitForElementVisible('button[data-id="landingPageImportFromTemplate"]')
      .click('button[data-id="landingPageImportFromTemplate"]')
      .waitForElementPresent('*[data-id="create-remixDefault"]')
      .scrollAndClick('*[data-id="create-remixDefault"]')
      .pause(3000)
      .windowHandles(function (result) {
        console.log(result.value)
        browser.hideToolTips()
          .switchWindow(result.value[1])
          .waitForElementVisible('*[data-id="treeViewLitreeViewItemtests"]')
          .click('*[data-id="treeViewLitreeViewItemtests"]')
          .waitForElementVisible('*[data-id="treeViewLitreeViewItemcontracts"]')
          .click('*[data-id="treeViewLitreeViewItemcontracts"]')
          .waitForElementVisible('[data-id="treeViewLitreeViewItemcontracts/1_Storage.sol"]')
          .openFile('contracts/1_Storage.sol')
          .waitForElementVisible('*[id="editorView"]', 60000)
          .getEditorValue((content) => {
            browser.assert.ok(content.includes('function retrieve() public view returns (uint256){'))
          })
      })
  },
  'connect to Wallet': function (browser: NightwatchBrowser) {
    browser
      .clickLaunchIcon('udapp')
      .waitForElementVisible('[data-id="settingsSelectEnvOptions"]')
      .click('[data-id="settingsSelectEnvOptions"] button')
      .waitForElementVisible(`[data-id="dropdown-item-desktopHost"]`)
      .click('[data-id="dropdown-item-desktopHost"]') // close the dropdown
      .waitForElementVisible({
        locateStrategy: 'xpath',
        selector: '//*[@data-id="settingsNetworkEnv" and contains(.,"1337")]',
      })
      .clickLaunchIcon('solidity')
      .click('*[data-id="compilerContainerCompileBtn"]')
      .pause(2000)
      .clickLaunchIcon('udapp')
      .waitForElementVisible('*[data-id="Deploy - transact (not payable)"]', 60000) // wait for the contract to compile
      .pause(2000)
      .click('*[data-id="Deploy - transact (not payable)"]')
      .waitForElementPresent('*[data-id="universalDappUiContractActionWrapper"]', 60000)
      .clickInstance(0)
      .clickFunction('store - transact (not payable)', { types: 'uint256 num', values: '10' })
      .clickFunction('retrieve - call')
      .waitForElementContainsText('[data-id="treeViewLi0"]', 'uint256: 10', 60000)
  },
}

module.exports = {
  ...tests,
}
