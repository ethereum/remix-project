'use strict'
import { NightwatchBrowser } from 'nightwatch'
import init from '../helpers/init'

module.exports = {
  before: function (browser: NightwatchBrowser, done: VoidFunction) {
    init(browser, done)
  },

  '@sources': function () {
    return sources
  },

  'Add Lib Test File': function (browser: NightwatchBrowser) {
    browser.addFile('Untitled5.sol', sources[0]['Untitled5.sol'])
      .clickLaunchIcon('udapp')
      .selectAccount('0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c') // this account will be used for this test suite
  },

  'Test Auto Deploy Lib': function (browser: NightwatchBrowser) {
    let addressRef: string
    browser.verifyContracts(['test'])
      .clickLaunchIcon('udapp')
      .click('#selectExEnv')
      .selectContract('test')
      .createContract('')
      .getAddressAtPosition(0, (address) => {
        console.log('testAutoDeployLib ' + address)
        addressRef = address
      })
      .clickInstance(0)
      .perform((done) => {
        browser.testConstantFunction(addressRef, 'get - call', null, '0:\nuint256: 45').perform(() => {
          done()
        })
      })
  },

  'Test Manual Deploy Lib': function (browser: NightwatchBrowser) {
    browser.click('*[data-id="deployAndRunClearInstances"]')
      .pause(5000)
      .waitForElementVisible('*[data-id="topbar-settingsIcon"]')
      .click('*[data-id="topbar-settingsIcon"]')
      .click('*[data-id="settingsTabGenerateContractMetadataLabel"]')
      .clickLaunchIcon('solidity')
      .click('#compileTabView button[data-id="compilerContainerCompileBtn"]') // that should generate the JSON artefact
      .clickLaunchIcon('udapp')
      .verifyContracts(['test'])
      .clickLaunchIcon('udapp')
      .selectContract('lib') // deploy lib
      .createContract('')
      .perform((done) => {
        browser.getAddressAtPosition(0, (address) => {
          console.log(address)
          checkDeployShouldFail(browser, () => {
            checkDeployShouldSucceed(browser, address, () => {
              done()
            })
          })
        })
      })
      .end()
  }
}

function checkDeployShouldFail (browser: NightwatchBrowser, callback: VoidFunction) {
  let config
  browser.openFile('artifacts/test.json')
    .getEditorValue((content) => {
      config = JSON.parse(content)
      config.deploy['VM:-'].autoDeployLib = false
    })
    .perform(() => {
      browser.setEditorValue(JSON.stringify(config))
    })
    .openFile('Untitled5.sol')
    .clickLaunchIcon('udapp')
    .selectContract('test') // deploy lib
    .createContract('')
    .pause(2000)
    .getText('div[class^="terminal"]', (value) => {
      console.log('value: ', value)
    })
    .assert.containsText('div[class^="terminal"]', '<address> is not a valid address')
    .perform(() => { callback() })
}

function checkDeployShouldSucceed (browser: NightwatchBrowser, address: string, callback: VoidFunction) {
  let addressRef: string
  let config
  browser.openFile('artifacts/test.json')
    .getEditorValue((content) => {
      config = JSON.parse(content)
      config.deploy['VM:-'].autoDeployLib = false
      config.deploy['VM:-'].linkReferences['Untitled5.sol'].lib = address
    })
    .perform(() => {
      browser.setEditorValue(JSON.stringify(config))
    })
    .openFile('Untitled5.sol')
    .clickLaunchIcon('udapp')
    .selectContract('test') // deploy lib
    .createContract('')
    .getAddressAtPosition(1, (address) => {
      addressRef = address
    })
    .clickInstance(1)
    .perform(() => {
      browser
        .testConstantFunction(addressRef, 'get - call', null, '0:\nuint256: 45')
        .perform(() => { callback() })
    })
}

const sources = [
  {
    'Untitled5.sol': {
      content: `library lib {
      function getInt () public view returns (uint) {
          return 45;
      }
    }

    contract test {
      function get () public view returns (uint) {
          return lib.getInt();
      }
    }`
    }
  }
]
